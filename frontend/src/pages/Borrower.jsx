import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import GlassCard from "../components/GlassCard";
import { createPayment } from "../utils/mockStore";
import { ArrowLeft, CreditCard } from "lucide-react";
import { ethers } from "ethers";
import { auravaultfile, auravaultaddress } from "../utils/contract.js"

const Borrower = ({ wallet }) => {
  const navigate = useNavigate();

  const [merchantId, setMerchantId] = useState("");
  const [amount, setAmount] = useState("");

  const isAmountValid = amount && Number(amount) > 0;
  const isMerchantProvided = merchantId.trim().length > 0;

  const canExecute = isAmountValid && isMerchantProvided;
  const canRepay = isAmountValid && !isMerchantProvided;

  const handleExecute = async () => {
      if (!canExecute) return;

      try {
          if (!window.ethereum) throw new Error("No crypto wallet found. Please install MetaMask.");

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();

          const contract = new ethers.Contract(auravaultaddress, auravaultfile.abi, signer);

          const parsedAmount = ethers.parseUnits(amount, 6);

          console.log(`Locking funds for ${merchantId}...`);
          const tx = await contract.lockFunds(merchantId, parsedAmount);
          
          console.log("Transaction sent:", tx.hash);
          
          const receipt = await tx.wait();

          // Extract receiptHash from the Events 
          // This parses the logs to find the "FundsLocked" event
          const event = receipt.logs.find(log => {
              try {
                  return contract.interface.parseLog(log).name === "FundsLocked";
              } catch (e) {
                  return false;
              }
          });
          
          if (event) {
              const parsedLog = contract.interface.parseLog(event);
              const receiptHash = parsedLog.args[0]; // The first argument is receiptHash
              console.log("Receipt Hash:", receiptHash);
          }

          alert("Transaction Successful! Funds Locked.");

          // 9. Reset Form
          setMerchantId("");
          setAmount("");

      } catch (error) {
          console.error("Transaction failed:", error);
          alert(`Transaction failed: ${error.message || error}`);
      }
  };

  const handleRepay = () => {
    if (!canRepay) return;
    console.log("Repayment triggered:", amount);
    setAmount("");
  };

  return (
    <div className="w-full max-w-xl mx-auto py-12">


      <button
        onClick={() => navigate(-1)}
        className="group flex items-center gap-2 text-rose-500/60 hover:text-rose-400 mb-8 uppercase text-[10px] font-bold tracking-[0.2em] transition-colors"
      >
        <div className="p-1 rounded-full border border-rose-500/20 group-hover:border-rose-500/50 transition-colors">
          <ArrowLeft size={14} />
        </div>
        Return
      </button>

      <GlassCard className="!p-0 overflow-hidden">

        <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-transparent flex items-center justify-center border border-rose-500/20">
            <CreditCard size={24} className="text-rose-400" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Transaction Details</h3>
            <p className="text-zinc-500 text-xs">
              Execute or repay based on input
            </p>
          </div>
        </div>


        <div className="p-8">

          <Input
            label="Merchant Address (Optional)"
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

          <div className="flex gap-4 mt-6">

            {/* EXECUTE BUTTON */}
            <button
              disabled={!canExecute}
              onClick={handleExecute}
              className={`flex-1 py-5 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all rounded-xl relative overflow-hidden group
                ${
                  canExecute
                    ? "bg-gradient-to-r from-rose-600 to-red-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]"
                    : "bg-zinc-700 opacity-40 cursor-not-allowed"
                }
              `}
            >
              <span className="relative z-10">Execute</span>
              {canExecute && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              )}
            </button>

            <button
              disabled={!canRepay}
              onClick={handleRepay}
              className={`flex-1 py-5 text-white font-bold uppercase tracking-[0.2em] text-xs transition-all rounded-xl relative overflow-hidden group
                ${
                  canRepay
                    ? "bg-gradient-to-r from-rose-600 to-red-700 hover:shadow-[0_0_30px_rgba(225,29,72,0.4)]"
                    : "bg-zinc-700 opacity-40 cursor-not-allowed"
                }
              `}
            >
              <span className="relative z-10">Repay</span>
              {canRepay && (
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              )}
            </button>

          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Borrower;