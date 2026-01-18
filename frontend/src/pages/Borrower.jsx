import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import GlassCard from "../components/GlassCard";
import { ArrowLeft, CreditCard, Repeat, ShieldCheck, Copy, Loader2, AlertCircle } from "lucide-react";
import { ethers } from "ethers";
import { auravaultfile, auravaultaddress, usdcmockfile, usdcaddress } from "../utils/contract.js"

// --- MOCK BACKEND SERVICE ---
// Replace this with your actual API call later
const fetchDueAmount = async (walletAddress) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("1250.00"); // Default mock due amount
    }, 1000);
  });
};

const Borrower = ({ wallet }) => {
  const navigate = useNavigate();

  
  const [activeTab, setActiveTab] = useState("borrow"); // 'borrow' | 'repay'
  const [loading, setLoading] = useState(false);
  
  
  const [merchantId, setMerchantId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueAmount, setDueAmount] = useState("0.00");

  
  const [status, setStatus] = useState({ type: "", message: "" }); // type: 'success' | 'error' | 'info'
  const [receiptHash, setReceiptHash] = useState(null);

 
  useEffect(() => {
    const loadData = async () => {
      if (wallet) {
        const due = await fetchDueAmount(wallet);
        setDueAmount(due);
      }
    };
    loadData();
  }, [wallet]);

  
  const clearForm = () => {
    setStatus({ type: "", message: "" });
    setReceiptHash(null);
  };

  
  const handleExecute = async () => {
    if (!amount || !merchantId) return;
    setLoading(true);
    clearForm();

    try {
      if (!window.ethereum) throw new Error("Wallet not found");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(auravaultaddress, auravaultfile.abi, signer);

      const parsedAmount = ethers.parseUnits(amount, 6); // USDC 6 decimals

      setStatus({ type: "info", message: "Sign transaction to lock funds..." });
      
      const tx = await contract.lockFunds(merchantId, parsedAmount);
      setStatus({ type: "info", message: "Transaction sent. Waiting for confirmation..." });
      
      const receipt = await tx.wait();

      // Find Event Log
      const event = receipt.logs.find(log => {
        try { return contract.interface.parseLog(log).name === "FundsLocked"; } 
        catch (e) { return false; }
      });
      
      if (event) {
        const parsedLog = contract.interface.parseLog(event);
        setReceiptHash(parsedLog.args[0]); // Save hash to state
        setStatus({ type: "success", message: "Funds locked successfully!" });
        setAmount("");
        setMerchantId("");
      } else {
        setStatus({ type: "success", message: "Transaction successful (Receipt ID not found in logs)." });
      }

    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.reason || error.message || "Transaction failed" });
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION: REPAY LOAN ---
  const handleRepay = async () => {
    if (!amount) return;
    setLoading(true);
    clearForm();

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const usdcContract = new ethers.Contract(usdcaddress, usdcmockfile.abi, signer);
      const vaultContract = new ethers.Contract(auravaultaddress, auravaultfile.abi, signer);
      
      const parsedAmount = ethers.parseUnits(amount, 6);

      // 1. Check Allowance
      setStatus({ type: "info", message: "Checking USDC allowance..." });
      const allowance = await usdcContract.allowance(wallet, auravaultaddress);
      
      if (allowance < parsedAmount) {
        setStatus({ type: "info", message: "Approving USDC..." });
        const approveTx = await usdcContract.approve(auravaultaddress, parsedAmount);
        await approveTx.wait();
      }

      // 2. Repay
      setStatus({ type: "info", message: "Processing repayment..." });
      const tx = await vaultContract.repay(parsedAmount);
      await tx.wait();

      setStatus({ type: "success", message: "Repayment successful! Balance updated." });
      setAmount("");
      
      
      setDueAmount((prev) => (parseFloat(prev) - parseFloat(amount)).toFixed(2));

    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: error.reason || error.message || "Repayment failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4">
      
      {/* Return Button */}
      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-rose-500/60 hover:text-rose-400 mb-8 uppercase text-[10px] font-bold tracking-[0.2em] transition-colors"
      >
        <div className="p-1 rounded-full border border-rose-500/20 group-hover:border-rose-500/50 transition-colors">
          <ArrowLeft size={14} />
        </div>
        Return
      </button>


      <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600 mb-1">BORROWER</h2>
            <p className="text-xs text-rose-400/60 font-mono tracking-widest">CREDIT & REPAYMENT</p>
          </div>
          
       
          <div className="text-right">
             <p className="text-[10px] text-rose-300/70 uppercase font-bold tracking-wider mb-1">Current Due</p>
             <div className="bg-rose-950/30 border border-rose-500/30 px-4 py-2 rounded-lg">
                <p className="text-xl font-mono text-rose-100">${dueAmount}</p>
             </div>
          </div>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        
       
        <div className="flex border-b border-rose-500/20">
            <button 
              onClick={() => { setActiveTab("borrow"); clearForm(); }}
              className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                ${activeTab === "borrow" ? "bg-rose-500/20 text-rose-300" : "text-rose-500/40 hover:text-rose-400 hover:bg-rose-500/5"}`}
            >
              <CreditCard size={16} /> Pay Merchant
            </button>
            <div className="w-[1px] bg-rose-500/20"></div>
            <button 
              onClick={() => { setActiveTab("repay"); clearForm(); }}
              className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                ${activeTab === "repay" ? "bg-rose-500/20 text-rose-300" : "text-rose-500/40 hover:text-rose-400 hover:bg-rose-500/5"}`}
            >
              <Repeat size={16} /> Repay Loan
            </button>
        </div>

        <div className="p-8">
          

          {activeTab === "borrow" && (
            <div className="space-y-6">
                <Input
                    label="Merchant Address"
                    placeholder="0x..."
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                />
                <Input
                    label="Amount (USDC)"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button
                    disabled={loading || !amount || !merchantId}
                    onClick={handleExecute}
                    className={`w-full py-5 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all rounded-xl relative overflow-hidden group
                        ${loading || !amount || !merchantId ? "bg-zinc-800 cursor-not-allowed opacity-50" : "bg-gradient-to-r from-rose-600 to-red-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]"}
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                        {loading ? "Processing..." : "Lock Funds & Generate Receipt"}
                    </div>
                </button>
            </div>
          )}

 
          {activeTab === "repay" && (
            <div className="space-y-6">
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-xl mb-4">
                    <p className="text-xs text-rose-300/80 mb-1">Total Outstanding Due</p>
                    <p className="text-2xl font-mono text-white">${dueAmount} USDC</p>
                </div>

                <Input
                    label="Repayment Amount (USDC)"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                />
                
                <button
                    disabled={loading || !amount}
                    onClick={handleRepay}
                    className={`w-full py-5 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all rounded-xl relative overflow-hidden group
                        ${loading || !amount ? "bg-zinc-800 cursor-not-allowed opacity-50" : "bg-gradient-to-r from-emerald-600 to-teal-700 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"}
                    `}
                >
                    <div className="flex items-center justify-center gap-2">
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Repeat size={16} />}
                        {loading ? "Processing..." : "Approve & Repay"}
                    </div>
                </button>
            </div>
          )}

          {/* --- STATUS MESSAGE --- */}
          {status.message && (
             <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2
                ${status.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 
                  status.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 
                  'bg-blue-500/10 border-blue-500/30 text-blue-300'}`}
             >
                <div className="mt-0.5">
                    {status.type === 'error' ? <AlertCircle size={16} /> : <ShieldCheck size={16} />}
                </div>
                <div className="text-xs font-mono leading-relaxed break-all">
                    {status.message}
                </div>
             </div>
          )}

          {/* --- RECEIPT  --- */}
          {receiptHash && (
             <div className="mt-4 p-5 bg-black/40 border border-rose-500/30 rounded-xl">
                 <p className="text-[10px] text-rose-400 uppercase font-bold tracking-widest mb-3">Transaction Receipt</p>
                 <div className="flex items-center justify-between bg-black/50 p-3 rounded-lg border border-white/5">
                     <code className="text-xs text-rose-100/80 font-mono truncate mr-4">
                         {receiptHash}
                     </code>
                     <button 
                        onClick={() => navigator.clipboard.writeText(receiptHash)}
                        className="text-rose-500 hover:text-white transition-colors"
                        title="Copy to clipboard"
                     >
                         <Copy size={14} />
                     </button>
                 </div>
                 <p className="text-[10px] text-zinc-500 mt-2 text-center">
                    Share this Receipt Hash with the merchant to complete the payment.
                 </p>
             </div>
          )}

        </div>
      </GlassCard>
    </div>
  );
};

export default Borrower;