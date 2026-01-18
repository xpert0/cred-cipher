import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import GlassCard from '../components/GlassCard';
import { ScanSearch, Wallet, ArrowLeft, ShieldAlert, ShieldCheck, Loader2, Coins, Layers } from 'lucide-react';

import { ethers } from 'ethers';
import { auravaultfile, auravaultaddress } from "../utils/contract.js"

const Merchant = ({ wallet }) => {
  const navigate = useNavigate();
  

  const [activeTab, setActiveTab] = useState('verify'); // 'verify' or 'claim'
  const [inputHash, setInputHash] = useState('');
  const [loading, setLoading] = useState(false);
  

  const [verificationResult, setVerificationResult] = useState(null);
  const [claimStatus, setClaimStatus] = useState(null); // 'success', 'error', null
  const [statusMessage, setStatusMessage] = useState('');

  const getContract = async (needSigner = false) => {
    if (!window.ethereum) throw new Error("No wallet found");
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (needSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(auravaultaddress, auravaultfile.abi, signer);
    }
    return new ethers.Contract(auravaultaddress, auravaultfile.abi, provider);
  };


  const handleVerify = async () => {
    if (!inputHash) return;
    setLoading(true);
    setVerificationResult(null);
    setClaimStatus(null);

    try {
      const contract = await getContract(false); 
      const [merchant, amount, claimable] = await contract.verifyReceipt(inputHash);
      
      setVerificationResult({
        merchant,
        amount: ethers.formatUnits(amount, 6), 
        claimable,
        isValid: true
      });

    } catch (error) {
      console.error(error);
      setVerificationResult({ isValid: false, error: "Receipt not found or invalid." });
    } finally {
      setLoading(false);
    }
  };


  const handleClaim = async () => {
    if (!inputHash) return;
    executeClaimTransaction(() => {
        return getContract(true).then(c => c.settleReceipt(inputHash));
    });
  };


  const handleClaimAll = async () => {
    executeClaimTransaction(() => {
        return getContract(true).then(c => c.claimAll());
    });
  };


  const executeClaimTransaction = async (transactionFn) => {
    setLoading(true);
    setClaimStatus(null);
    setStatusMessage('');

    try {
      const tx = await transactionFn();
      setStatusMessage("Transaction sent... Waiting for confirmation.");
      
      await tx.wait(); 
      
      setClaimStatus('success');
      setStatusMessage(`Funds successfully claimed! Transaction Hash: ${tx.hash.slice(0, 10)}...`);
      
    } catch (error) {
      console.error("Claim Error:", error);
      setClaimStatus('error');
      
      if (error.reason) setStatusMessage(error.reason);
      else if (error.message.includes("NoClaimableFunds")) setStatusMessage("No pending funds found to claim.");
      else if (error.message.includes("Unauthorized")) setStatusMessage("Access Denied: You are not the merchant.");
      else if (error.message.includes("AlreadySettled")) setStatusMessage("Funds have already been claimed.");
      else setStatusMessage("Transaction failed or rejected.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4">
      
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-emerald-500/60 hover:text-emerald-400 mb-8 uppercase text-[10px] font-bold tracking-[0.2em] transition-colors"
        >
          <div className="p-1 rounded-full border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
            <ArrowLeft size={14} /> 
          </div>
          Return
        </button>

        <div className="mb-8">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600 mb-1">MERCHANT PORTAL</h2>
            <p className="text-xs text-emerald-400/60 font-mono tracking-widest">SETTLEMENT & VERIFICATION</p>
        </div>

        <GlassCard className="!p-0 overflow-hidden">
          
          <div className="flex border-b border-emerald-500/20">
            <button 
              onClick={() => { setActiveTab('verify'); setVerificationResult(null); setClaimStatus(null); setInputHash(''); }}
              className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                ${activeTab === 'verify' ? 'bg-emerald-500/20 text-emerald-300' : 'text-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5'}`}
            >
              <ScanSearch size={16} /> Verify Receipt
            </button>
            <div className="w-[1px] bg-emerald-500/20"></div>
            <button 
              onClick={() => { setActiveTab('claim'); setVerificationResult(null); setClaimStatus(null); setInputHash(''); }}
              className={`flex-1 p-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2
                ${activeTab === 'claim' ? 'bg-emerald-500/20 text-emerald-300' : 'text-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/5'}`}
            >
              <Coins size={16} /> Claim Funds
            </button>
          </div>

          <div className="p-8">
            
       
            {activeTab === 'verify' && (
                <>
                    <div className="relative mb-6">
                        <Input 
                            label="Enter Receipt Hash to Verify"
                            placeholder="0x..." 
                            value={inputHash} 
                            onChange={(e) => setInputHash(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleVerify}
                        disabled={loading || !inputHash}
                        className={`w-full py-4 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all rounded-xl shadow-lg flex items-center justify-center gap-3
                            ${loading ? 'bg-emerald-800 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'}
                        `}
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <ScanSearch size={18} />}
                        {loading ? "Processing..." : "Check Status"}
                    </button>
                </>
            )}

        
            {activeTab === 'claim' && (
                <div className="space-y-8">
                
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-6 h-[1px] bg-emerald-500/30"></span> Option A: Single Receipt
                        </div>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Input 
                                    placeholder="Enter Specific Receipt Hash..." 
                                    value={inputHash} 
                                    onChange={(e) => setInputHash(e.target.value)}
                                />
                            </div>
                            <button 
                                onClick={handleClaim}
                                disabled={loading || !inputHash}
                                className="px-6 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                            >
                                <Wallet size={20} />
                            </button>
                        </div>
                    </div>

              
                    <div>
                         <div className="flex items-center gap-2 mb-4 text-emerald-500/60 text-[10px] font-bold uppercase tracking-widest">
                            <span className="w-6 h-[1px] bg-emerald-500/30"></span> Option B: Bulk Settlement
                        </div>
                        <button 
                            onClick={handleClaimAll}
                            disabled={loading}
                            className={`w-full py-5 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all rounded-xl shadow-lg flex items-center justify-center gap-3 relative overflow-hidden group
                                ${loading ? 'bg-emerald-800 cursor-not-allowed' : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:scale-[1.02] shadow-[0_0_25px_rgba(16,185,129,0.4)]'}
                            `}
                        >
                            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Layers size={18} />}
                            {loading ? "Processing..." : "Claim All Available Funds"}
                        </button>
                        <p className="text-center mt-3 text-[10px] text-emerald-500/40 uppercase tracking-widest">
                            Automatically finds and settles all your pending receipts
                        </p>
                    </div>
                </div>
            )}

       
            {activeTab === 'verify' && verificationResult && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                {verificationResult.isValid ? (
                  <div className="p-5 border border-emerald-500/30 bg-emerald-500/10 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs tracking-wider border-b border-emerald-500/20 pb-3">
                      <ShieldCheck size={16} /> Valid Receipt Found
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] text-emerald-500/50 uppercase font-bold">Amount</div>
                        <div className="text-xl font-mono text-emerald-200">{verificationResult.amount} USDC</div>
                      </div>
                      <div>
                         <div className="text-[10px] text-emerald-500/50 uppercase font-bold">Status</div>
                         <div className={`text-sm font-bold ${verificationResult.claimable ? 'text-green-400' : 'text-yellow-400'}`}>
                            {verificationResult.claimable ? 'READY TO CLAIM' : 'ALREADY SETTLED'}
                         </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-[10px] text-emerald-500/50 uppercase font-bold">Merchant Owner</div>
                      <div className="text-[10px] font-mono text-emerald-200/80 break-all">{verificationResult.merchant}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border border-red-500/30 bg-red-500/10 rounded-xl text-red-400 flex items-center gap-3 text-xs font-bold uppercase">
                    <ShieldAlert size={18} /> {verificationResult.error}
                  </div>
                )}
              </div>
            )}

          
            {activeTab === 'claim' && claimStatus && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-2">
                <div className={`p-5 border rounded-xl flex flex-col gap-2 ${claimStatus === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-red-500/30 bg-red-500/10'}`}>
                  <div className={`flex items-center gap-2 font-bold uppercase text-xs tracking-wider ${claimStatus === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {claimStatus === 'success' ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                    {claimStatus === 'success' ? "Settlement Successful" : "Settlement Failed"}
                  </div>
                  <p className={`text-xs font-mono leading-relaxed opacity-80 ${claimStatus === 'success' ? 'text-emerald-200' : 'text-red-200'}`}>
                    {statusMessage}
                  </p>
                </div>
              </div>
            )}

          </div>
        </GlassCard>
    </div>
  );
};

export default Merchant;