// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
}

contract AuraVault {
    IERC20 public immutable usdc;
    address public oracle;

    uint256 public totalLent;
    uint256 public lockedForSettlement;

    mapping(address => uint256) public lenderBalances;
    mapping(bytes32 => uint256) public creditLimits;

    struct Receipt { address merchant; uint256 amount; bool settled; }
    mapping(bytes32 => Receipt) public receipts;

    // --- NEW: TRACKING RECEIPTS PER MERCHANT ---
    // We need this array to let merchants "find" their forgotten receipts
    mapping(address => bytes32[]) public merchantReceipts;

    // Events
    event LiquidityProvided(address indexed lender, uint256 amount);
    event LiquidityWithdrawn(address indexed lender, uint256 amount);
    event FundsLocked(bytes32 indexed receiptHash, address indexed merchant, uint256 amount);
    event ReceiptSettled(bytes32 indexed receiptHash, address indexed merchant, uint256 amount);
    event OracleUpdated(address indexed newOracle);
    event LoanRepaid(address indexed borrower, uint256 amount);
    event CreditLimitSet(bytes32 indexed identityHash, uint256 limitScore);
    
    // --- NEW EVENT ---
    event BulkClaim(address indexed merchant, uint256 totalAmount, uint256 count);

    // Errors
    error Unauthorized();
    error ZeroAmount();
    error TransferFailed();
    error InsufficientBalance();
    error Insolvent();
    error InvalidReceipt();
    error AlreadySettled();
    error NoClaimableFunds();

    constructor(address _usdc) {
        oracle = msg.sender;
        usdc = IERC20(_usdc);
    }

    modifier onlyOracle() {
        if (msg.sender != oracle) revert Unauthorized();
        _;
    }

    function getDebugInfo(address user) external view returns (uint256 userBalance, uint256 vaultAllowance, address vaultAddress) {
        return (
            usdc.balanceOf(user),
            usdc.allowance(user, address(this)),
            address(this)
        );
    }

    function repay(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        bool ok = usdc.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();
        emit LoanRepaid(msg.sender, amount);
    }

    function setCreditLimit(bytes32 identityHash, uint256 limitScore) external onlyOracle {
        creditLimits[identityHash] = limitScore;
        emit CreditLimitSet(identityHash, limitScore);
    }

    function provideLiquidity(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        uint256 balanceBefore = usdc.balanceOf(address(this));
        bool ok = usdc.transferFrom(msg.sender, address(this), amount);
        if (!ok) revert TransferFailed();

        uint256 balanceAfter = usdc.balanceOf(address(this));
        uint256 actualReceived = balanceAfter - balanceBefore;

        lenderBalances[msg.sender] += actualReceived;
        totalLent += actualReceived;

        emit LiquidityProvided(msg.sender, actualReceived);
    }

    function setOracle(address _newOracle) external onlyOracle {
        oracle = _newOracle;
        emit OracleUpdated(_newOracle);
    }

    function withdrawLiquidity(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (lenderBalances[msg.sender] < amount) revert InsufficientBalance();

        uint256 balance = usdc.balanceOf(address(this));
        uint256 freeLiquidity = balance > lockedForSettlement ? balance - lockedForSettlement : 0;

        if (freeLiquidity < amount) revert Insolvent();

        lenderBalances[msg.sender] -= amount;
        totalLent -= amount;

        bool ok = usdc.transfer(msg.sender, amount);
        if (!ok) revert TransferFailed();

        emit LiquidityWithdrawn(msg.sender, amount);
    }

    function lockFunds(address merchant, uint256 amount) external returns (bytes32 receiptHash) {
        if (amount == 0) revert ZeroAmount();
        uint256 balance = usdc.balanceOf(address(this));
        if (balance < lockedForSettlement + amount) revert Insolvent();

        receiptHash = keccak256(abi.encodePacked(merchant, amount, block.timestamp, block.number, lockedForSettlement));
        if (receipts[receiptHash].amount != 0) revert InvalidReceipt();

        lockedForSettlement += amount;
        receipts[receiptHash] = Receipt({ merchant: merchant, amount: amount, settled: false });
        
        // --- NEW: Add this receipt to the merchant's list ---
        merchantReceipts[merchant].push(receiptHash);

        emit FundsLocked(receiptHash, merchant, amount);
    }

    function verifyReceipt(bytes32 receiptHash) external view returns (address merchant, uint256 amount, bool claimable) {
        Receipt memory r = receipts[receiptHash];
        if (r.amount == 0) revert InvalidReceipt();
        return (r.merchant, r.amount, !r.settled);
    }

    function settleReceipt(bytes32 receiptHash) external {
        Receipt storage r = receipts[receiptHash];
        if (r.amount == 0) revert InvalidReceipt();
        if (r.settled) revert AlreadySettled();
        if (msg.sender != r.merchant) revert Unauthorized();

        lockedForSettlement -= r.amount;
        r.settled = true;
        bool ok = usdc.transfer(r.merchant, r.amount);
        if (!ok) revert TransferFailed();

        emit ReceiptSettled(receiptHash, r.merchant, r.amount);
    }

    // --- NEW FUNCTION: CLAIM ALL ---
    // Finds all receipts for the caller, sums up the unsettled ones, and sends one transfer
    function claimAll() external {
        bytes32[] memory myReceipts = merchantReceipts[msg.sender];
        uint256 totalPayout = 0;
        uint256 count = 0;

        for (uint256 i = 0; i < myReceipts.length; i++) {
            bytes32 rHash = myReceipts[i];
            Receipt storage r = receipts[rHash];

            // Only claim if it exists, belongs to sender, and hasn't been paid yet
            if (r.amount > 0 && r.merchant == msg.sender && !r.settled) {
                r.settled = true;
                lockedForSettlement -= r.amount;
                totalPayout += r.amount;
                count++;
                
                // Emit individual event for tracking
                emit ReceiptSettled(rHash, msg.sender, r.amount);
            }
        }

        if (totalPayout == 0) revert NoClaimableFunds();

        // One single transfer saves gas compared to many small transfers
        bool ok = usdc.transfer(msg.sender, totalPayout);
        if (!ok) revert TransferFailed();

        emit BulkClaim(msg.sender, totalPayout, count);
    }
}
