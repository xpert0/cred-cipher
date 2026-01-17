const { ethers } = require("hardhat");

async function main() {
  // 1. Get multiple accounts so we can fund them
  const [deployer, lender, merchant, oracle, user4] = await ethers.getSigners();
  
  const USDC_DECIMALS = 6;
  const INITIAL_SUPPLY = ethers.parseUnits("1000000", USDC_DECIMALS);
  const TEST_AMOUNT = ethers.parseUnits("500", USDC_DECIMALS); // 500 USDC

  console.log("🚀 Deploying contracts with account:", deployer.address);

  // 2. Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy(INITIAL_SUPPLY);
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log(`✅ MockUSDC deployed to: ${usdcAddress}`);

  // 3. Deploy AuraVault
  const AuraVault = await ethers.getContractFactory("AuraVault");
  const vault = await AuraVault.deploy(usdcAddress);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ AuraVault deployed to: ${vaultAddress}`);

  // 4. Configuration (Set Oracle)
  if (oracle) {
      await vault.setOracle(oracle.address);
      console.log(`🔧 Oracle configured to: ${oracle.address}`);
  }

  // 5. Fund Test Accounts
  console.log("\n💸 Funding test accounts with 500 USDC each...");
  const recipients = [lender, merchant, oracle, user4];
  
  for (const recipient of recipients) {
    await usdc.transfer(recipient.address, TEST_AMOUNT);
    console.log(`   -> Sent 500 USDC to ${recipient.address}`);
  }
  
  console.log("\n✅ Deployment & Funding Complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});