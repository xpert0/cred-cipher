import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import GlassCard from '../components/GlassCard';
import { createPayment } from '../utils/mockStore';
import { CheckCircle2, ArrowLeft, CreditCard, Lock } from 'lucide-react';

const Borrower = ({ wallet }) => {
  const navigate = useNavigate();
  const [merchantId, setMerchantId] = useState('');
  const [amount, setAmount] = useState('');
  const [receipt, setReceipt] = useState(null);

  const handlePay = async () => {
    if(!merchantId || !amount) return;
    const newReceipt = await createPayment(merchantId, amount, wallet);
    setReceipt(newReceipt);
    setMerchantId('');
    setAmount('');
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-rose-500/60 hover:text-rose-400 mb-8 uppercase text-[10px] font-bold tracking-[0.2em] transition-colors"
      >
        <div className="p-1 rounded-full border border-rose-500/20 group-hover:border-rose-500/50 transition-colors">
          <ArrowLeft size={14} /> 
        </div>
        Return
      </button>

      {/* Header */}
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-red-600 mb-1">BORROW</h2>
          <p className="text-xs text-rose-400/60 font-mono tracking-widest">UNDER-COLLATERALIZED CREDIT</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-rose-900/10 border border-rose-500/20 rounded-full">
            <Lock size={12} className="text-rose-400" />
            <span className="text-[10px] text-rose-300 font-bold uppercase tracking-wider">ZK-Proof Ready</span>
        </div>
      </div>

      <GlassCard className="!p-0 overflow-hidden">
        {/* Decorative Header inside Card */}
        <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-transparent flex items-center justify-center border border-rose-500/20">
                <CreditCard size={24} className="text-rose-400" />
            </div>
            <div>
                <h3 className="text-white font-bold text-lg">Transaction Details</h3>
                <p className="text-zinc-500 text-xs">Execute payment to merchant address</p>
            </div>
        </div>

        <div className="p-8">
            {!receipt ? (
                <>
                <Input label="Merchant Address" placeholder="0x..." value={merchantId} onChange={(e) => setMerchantId(e.target.value)} />
                <Input label="Amount (USDC)" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
                
                <button 
                    onClick={handlePay} 
                    className="w-full mt-6 py-5 bg-gradient-to-r from-rose-600 to-red-700 text-white font-bold uppercase tracking-[0.2em] text-xs hover:shadow-[0_0_30px_rgba(225,29,72,0.4)] transition-all rounded-xl relative overflow-hidden group"
                >
                    <span className="relative z-10">Execute Payment</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                </>
            ) : (
                <div className="text-center py-8 animate-in zoom-in duration-300">
                    <div className="flex justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full animate-pulse" />
                        <CheckCircle2 size={80} className="text-emerald-400 relative z-10" />
                    </div>
                    <h3 className="text-3xl text-white font-bold mb-2 tracking-tight">Payment Successful</h3>
                    <p className="text-zinc-400 text-sm mb-8">Your transaction has been finalized on-chain.</p>
                    
                    <div className="bg-black/40 border border-white/10 rounded-xl p-6 mb-8 text-left relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Receipt ID</p>
                        <p className="font-mono text-lg text-emerald-400 break-all select-all">{receipt}</p>
                    </div>
                    
                    <button 
                        onClick={() => setReceipt(null)} 
                        className="text-xs text-zinc-500 hover:text-white uppercase font-bold tracking-widest border-b border-transparent hover:border-white transition-all pb-1"
                    >
                        Make Another Payment
                    </button>
                </div>
            )}
        </div>
      </GlassCard>
    </div>
  );
};

export default Borrower;