import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import GlassCard from '../components/GlassCard';
import { verifyPayment } from '../utils/mockStore';
import { ScanSearch, Check, X, ArrowLeft, ShieldAlert, ShieldCheck } from 'lucide-react';

const Merchant = ({ wallet }) => {
  const navigate = useNavigate();
  const [receiptInput, setReceiptInput] = useState('');
  const [status, setStatus] = useState(null);
  const [details, setDetails] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    const result = await verifyPayment(receiptInput, wallet);
    
    if (result.success) {
      setStatus('valid');
      setDetails(result.data);
    } else {
      if (result.error && result.error.includes("ACCESS DENIED")) {
        setStatus('denied');
        setErrorMsg(result.error);
      } else {
        setStatus('invalid');
      }
      setDetails(null);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-emerald-500/60 hover:text-emerald-400 mb-8 uppercase text-[10px] font-bold tracking-[0.2em] transition-colors"
        >
          <div className="p-1 rounded-full border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
            <ArrowLeft size={14} /> 
          </div>
          Return
        </button>

        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-600 mb-1">MERCHANT</h2>
            <p className="text-xs text-emerald-400/60 font-mono tracking-widest">POS VERIFICATION SYSTEM</p>
          </div>
        </div>

        <GlassCard className="!p-8">
          <div className="relative mb-8">
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
          </div>

          <Input 
            label="Receipt Hash ID" 
            placeholder="RCPT-..." 
            value={receiptInput} 
            onChange={(e) => { setReceiptInput(e.target.value); setStatus(null); }}
          />

          <button 
            onClick={handleVerify} 
            className="w-full mb-8 py-5 bg-emerald-600 text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-emerald-500 transition-all rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
          >
            <ScanSearch size={18} /> Verify Transaction
          </button>

          {/* STATUS DISPLAYS */}
          {status === 'valid' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="p-6 border border-emerald-500/50 bg-emerald-500/10 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <ShieldCheck size={24} />
                        <span className="font-bold text-lg uppercase tracking-wider">Verified Owner</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-emerald-500/20 pt-4">
                        <span className="text-xs text-emerald-300/70 uppercase tracking-widest">Total Amount</span>
                        <span className="text-3xl font-mono text-white tracking-tighter">${details.amount}</span>
                    </div>
                </div>
            </div>
          )}

          {status === 'denied' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="p-6 border border-red-600/50 bg-red-600/10 rounded-xl flex flex-col gap-3 text-red-500 relative">
                    <div className="flex items-center gap-3 font-bold uppercase text-sm tracking-wider">
                        <ShieldAlert size={20} className="animate-pulse" /> Security Alert
                    </div>
                    <p className="text-xs leading-relaxed text-red-400/80 font-mono border-l-2 border-red-600 pl-3">
                        {errorMsg}
                    </p>
                </div>
            </div>
          )}

          {status === 'invalid' && (
            <div className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="p-6 border border-rose-500/30 bg-rose-500/5 rounded-xl flex items-center gap-3 text-rose-500">
                    <X size={20} /> 
                    <span className="font-bold text-sm uppercase tracking-widest">Invalid Receipt ID</span>
                </div>
            </div>
          )}
        </GlassCard>
    </div>
  );
};

export default Merchant;