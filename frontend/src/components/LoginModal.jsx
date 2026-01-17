import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Fingerprint, FileText, Wallet, CheckCircle2, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1); 
  const [aadhar, setAadhar] = useState('');
  const [otp, setOtp] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(false);

  // MOCK DB (Unchanged)
  const MOCK_DB = {
    "111122223333": "101010",
    "444455556666": "202020",
    "777788889999": "303030",
    "123412341234": "404040",
    "909090909090": "505050"
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1); setAadhar(''); setOtp(''); setAgreed(false); setError(''); setScanning(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAadharSubmit = () => {
    setScanning(true);
    setTimeout(() => {
        if (!MOCK_DB[aadhar]) {
            setError("Identity hash not found in registry.");
            setScanning(false);
            return;
        }
        setScanning(false);
        setError('');
        setStep(2);
    }, 1500);
  };

  const handleOtpSubmit = () => {
    const correctOtp = MOCK_DB[aadhar];
    if (otp !== correctOtp) {
      setError("Encryption key mismatch (Invalid OTP).");
      return;
    }
    setError('');
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-1 relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Animated Border Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 pointer-events-none" />
        
        <div className="relative bg-[#0F1014] rounded-[22px] p-8 h-[550px] flex flex-col">
            <button onClick={onClose} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors z-20">
            <X size={20} />
            </button>

            {/* Progress Bar */}
            <div className="flex gap-2 mb-8 justify-center">
                {[1,2,3,4].map(i => (
                    <div key={i} className={`h-1 rounded-full transition-all duration-500 ${step >= i ? 'w-8 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'w-2 bg-zinc-800'}`} />
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full items-center text-center justify-center"
                >
                    <div className="relative mb-8 group">
                        <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse-slow" />
                        <div className="w-24 h-24 border border-cyan-500/30 rounded-full flex items-center justify-center relative bg-black/50 overflow-hidden">
                            {scanning ? <ScanLine size={48} className="text-cyan-400 animate-bounce" /> : <Fingerprint size={48} className="text-cyan-400" />}
                            {scanning && <div className="absolute inset-0 bg-cyan-400/10 animate-pulse" />}
                        </div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-white mb-2">Biometric Sync</h2>
                    <p className="text-zinc-500 text-sm mb-8 px-4">Initialize secure connection via National ID Protocol (Aadhar).</p>
                    
                    <div className="w-full space-y-4">
                        <input 
                            type="text" 
                            maxLength="12"
                            placeholder="0000 0000 0000"
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-4 text-white text-center tracking-[0.5em] text-lg focus:border-cyan-500/50 outline-none transition-all focus:shadow-[0_0_20px_rgba(6,182,212,0.1)] font-mono"
                            value={aadhar}
                            onChange={(e) => setAadhar(e.target.value.replace(/\D/g,''))}
                        />
                        {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
                        
                        <button 
                            onClick={handleAadharSubmit}
                            disabled={scanning}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-cyan-900/20 tracking-widest text-xs uppercase"
                        >
                            {scanning ? 'VERIFYING...' : 'INITIATE REQUEST'}
                        </button>
                    </div>
                </motion.div>
                )}

                {step === 2 && (
                <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full items-center text-center justify-center"
                >
                    <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                        <ShieldCheck size={40} className="text-yellow-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">2FA Verification</h2>
                    <p className="text-zinc-500 text-sm mb-8">Enter the 6-digit encryption key sent to your device.</p>
                    
                    <div className="w-full space-y-4">
                        <input 
                            type="text" 
                            maxLength="6"
                            placeholder="------"
                            className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-4 text-white text-center tracking-[1em] text-xl focus:border-yellow-500/50 outline-none transition-all font-mono"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g,''))}
                        />
                        {error && <p className="text-red-400 text-xs font-mono">{error}</p>}

                        <button 
                            onClick={handleOtpSubmit}
                            className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-all tracking-widest text-xs uppercase"
                        >
                            Authenticate
                        </button>
                    </div>
                </motion.div>
                )}

                {step === 3 && (
                <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col h-full"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                            <FileText size={24} className="text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Smart Contract Terms</h2>
                    </div>
                    
                    <div className="flex-1 bg-black/40 rounded-xl border border-zinc-800 p-4 mb-6 overflow-y-auto font-mono text-xs text-zinc-400 leading-relaxed custom-scrollbar">
                        <p className="mb-2 text-zinc-300 font-bold">1. PROTOCOL USAGE</p>
                        <p className="mb-4">Accessing the AURA protocol requires binding on-chain identity to off-chain reputation markers.</p>
                        <p className="mb-2 text-zinc-300 font-bold">2. ZK-PROOFS</p>
                        <p className="mb-4">Your personal data (Aadhar) remains off-chain. Only Zero-Knowledge proofs are generated and stored.</p>
                        <p className="mb-2 text-zinc-300 font-bold">3. LIABILITY</p>
                        <p>User accepts full responsibility for private key management and transaction signing.</p>
                    </div>

                    <label className="flex items-start gap-4 cursor-pointer group mb-6 p-4 rounded-xl border border-transparent hover:bg-white/5 transition-colors">
                        <div className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors ${agreed ? 'bg-purple-500 border-purple-500' : 'border-zinc-600 bg-black'}`}>
                            {agreed && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                        <span className="text-sm text-zinc-400 group-hover:text-white transition-colors select-none">
                            I cryptographically sign and agree to the Terms & Conditions.
                        </span>
                    </label>

                    <button 
                        onClick={() => { if(agreed) setStep(4); }}
                        className={`w-full font-bold py-4 rounded-xl transition-all tracking-widest text-xs uppercase ${agreed ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
                    >
                        Sign & Continue
                    </button>
                </motion.div>
                )}

                {step === 4 && (
                <motion.div 
                    key="step4"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col h-full items-center text-center justify-center"
                >
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-cyan-600 rounded-2xl flex items-center justify-center relative shadow-xl transform rotate-3">
                            <Wallet size={48} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Identity Verified</h2>
                    <p className="text-zinc-400 mb-8 max-w-xs">Access granted. Connect your wallet to finalize the handshake.</p>
                    
                    <button 
                        onClick={() => { onComplete(); setStep(1); }}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                    >
                        <Wallet size={18} /> Connect Metamask
                    </button>
                </motion.div>
                )}
            </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginModal;