import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import GlassCard from '../components/GlassCard';
import { getStore, getLenderBalance, withdrawLiquidity } from '../utils/mockStore';
import { ArrowUpRight, ArrowDownLeft, ArrowLeft, Activity, Wallet } from 'lucide-react';
import { ethers } from "ethers";
import { usdcmockfile, auravaultfile, usdcaddress, auravaultaddress } from "../utils/contract.js"

const Lender = ({ wallet }) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [myBalance, setMyBalance] = useState(0);
  const [globalPool, setGlobalPool] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const store = await getStore();
      const bal = await getLenderBalance(wallet);
      setGlobalPool(store.poolBalance);
      setMyBalance(bal);
    };
    loadData();
  }, [wallet]);



  const handleProvide = async () => {
  if (!amount || !wallet) return;

  try {
    setMessage("Initializing...");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const usdcAddress = usdcaddress; 
    const liquidityContractAddress = auravaultaddress;

    const usdcContract = new ethers.Contract(usdcAddress, usdcmockfile.abi, signer);
    const liquidityContract = new ethers.Contract(liquidityContractAddress, auravaultfile.abi, signer);

    
    const parsedAmount = ethers.parseUnits(amount, 6);


    const allowance = await usdcContract.allowance(wallet, liquidityContractAddress); // BigInt in ethers v6
    if (allowance < parsedAmount) {
      setMessage("Approving USDC transfer...");
      const approveTx = await usdcContract.approve(liquidityContractAddress, parsedAmount);
      await approveTx.wait(); // wait for mining
      console.log("Approval mined ");
    } else {
      console.log("Sufficient allowance, skipping approve");
    }

    
    setMessage("Providing liquidity...");
    
    const provideTx = await liquidityContract.provideLiquidity(parsedAmount, { gasLimit: 300_000 });
    await provideTx.wait();
    console.log("Liquidity provided ✅");

    const store = await getStore(); // your backend/mock fetch
    const bal = await getLenderBalance(wallet);

    setMyBalance(bal);
    setGlobalPool(store.poolBalance);
    setMessage(`Successfully provided $${amount}`);
    setAmount('');

  } catch (error) {
    console.error("Transaction failed:", error);
    setMessage("Transaction failed. Check console for details.");
  }
};



  const handleWithdraw = async () => {
    if (!amount) return;
    const success = await withdrawLiquidity(wallet, amount);
    if (success) {
      const store = await getStore();
      const bal = await getLenderBalance(wallet);
      setMyBalance(bal);
      setGlobalPool(store.poolBalance);
      setMessage(`Withdrawal queued for $${amount}`);
    } else {
      setMessage("Insufficient funds in your position.");
    }
    setAmount('');
  };


  return (
    <div className="w-full max-w-2xl mx-auto py-12">
        <button 
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-cyan-500/60 hover:text-cyan-400 mb-8 uppercase text-[10px] font-bold tracking-[0.2em] transition-colors"
        >
          <div className="p-1 rounded-full border border-cyan-500/20 group-hover:border-cyan-500/50 transition-colors">
            <ArrowLeft size={14} /> 
          </div>
          Return to Dashboard
        </button>

        <div className="flex justify-between items-end mb-8 px-2">
          <div>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 mb-1">LIQUIDITY</h2>
            <p className="text-xs text-blue-400/60 font-mono tracking-widest">STABLECOIN VAULT (USDC)</p>
          </div>
          <div className="text-right bg-blue-900/10 px-4 py-2 rounded-lg border border-blue-500/20">
             <div className="flex items-center gap-2 justify-end mb-1">
                <Wallet size={12} className="text-blue-400" />
                <p className="text-[10px] text-blue-300/70 uppercase font-bold tracking-wider">Connected Wallet</p>
             </div>
             <p className="text-white font-mono text-xs tracking-wider">{wallet}</p>
          </div>
        </div>

        <GlassCard className="!p-10">
          
     
          <div className="flex justify-center gap-6 mb-10">
            <div className="relative group p-6 rounded-2xl bg-black/40 border border-cyan-500/20 overflow-hidden w-full max-w-md">
              <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <p className="text-cyan-400 text-[10px] uppercase tracking-[0.2em] font-bold">My Position</p>
                    <Activity size={16} className="text-cyan-500" />
                </div>
                <p className="text-3xl font-mono text-white tracking-tight">${myBalance.toLocaleString()}<span className="text-sm text-gray-500 ml-1">.00</span></p>
              </div>
            </div>

            
          </div>

          <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 mb-8">
            <Input 
                label="Deposit / Withdraw Amount" 
                type="number" 
                placeholder="0.00" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleProvide} 
              className="group relative overflow-hidden flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <ArrowUpRight size={18} /> 
              <span className="uppercase tracking-[0.1em] text-xs">Supply</span>
            </button>
            
            <button 
              onClick={handleWithdraw} 
              className="flex items-center justify-center gap-3 py-5 border border-white/20 bg-transparent text-white font-bold rounded-xl hover:bg-white hover:text-black transition-all uppercase tracking-[0.1em] text-xs"
            >
              <ArrowDownLeft size={18} /> Withdraw
            </button>
          </div>
          
          {message && (
            <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
                <p className="text-xs text-blue-300 font-mono">{message}</p>
            </div>
          )}
        </GlassCard>
    </div>
  );
};

export default Lender;