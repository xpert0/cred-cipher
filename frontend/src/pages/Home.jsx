import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  ShoppingBag,
  Coins,
  ArrowRight,
  UserCircle,
  Wallet,
} from "lucide-react";
import { motion } from "framer-motion";

const RoleCard = ({ title, icon: Icon, desc, onClick, color, delay }) => {
  const colorMap = {
    blue: "cyan",
    green: "emerald",
    red: "rose",
  };
  const theme = colorMap[color];

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay, duration: 0.5 }}
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onClick}
      className={`
        group relative flex flex-col items-start text-left p-8 h-full w-full 
        rounded-3xl border border-white/5 bg-gradient-to-b from-white/[0.08] to-transparent
        hover:border-${theme}-500/50 hover:bg-white/[0.08] hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)]
        hover:shadow-${theme}-500/20
        transition-all duration-300 overflow-hidden
      `}
    >
      <div
        className={`absolute -right-10 -top-10 w-32 h-32 bg-${theme}-500/20 rounded-full blur-2xl group-hover:bg-${theme}-500/30 transition-all`}
      />

      <div
        className={`mb-6 p-4 rounded-2xl bg-black/50 border border-white/10 text-${theme}-400 group-hover:text-${theme}-300 shadow-lg relative z-10`}
      >
        <Icon size={32} strokeWidth={1.5} />
      </div>

      <h3 className="text-3xl font-bold text-white mb-3 tracking-tight relative z-10">
        {title}
      </h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-8 relative z-10 font-light">
        {desc}
      </p>

      <div
        className={`mt-auto flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-${theme}-400`}
      >
        <span className="group-hover:translate-x-1 transition-transform">
          Enter Portal
        </span>
        <ArrowRight
          size={14}
          className="group-hover:translate-x-2 transition-transform"
        />
      </div>
    </motion.button>
  );
};

const Home = ({ wallet, onConnect }) => {
  const navigate = useNavigate();

  if (!wallet) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl w-full text-center space-y-12"
        >
          <div className="flex justify-center gap-6">
            <div className="px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] uppercase font-bold tracking-[0.2em] shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              ZK-Privacy Layer
            </div>
            <div className="px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10px] uppercase font-bold tracking-[0.2em] shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              Sepolia Network
            </div>
          </div>

          <div>
            
            <h1
              className="
  text-8xl md:text-[10rem] font-bold tracking-tighter leading-none cursor-pointer
  text-transparent bg-clip-text
  bg-gradient-to-b from-white via-white to-white/40
  drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]
  transition-all duration-300 ease-out]"
            >
              AURA
            </h1>
            <p className="mt-6 text-2xl md:text-3xl text-slate-400 font-light max-w-2xl mx-auto tracking-wide">
              The{" "}
              <span className="text-cyan-400 font-normal">Credit Layer</span>{" "}
              for Web3.
            </p>
            <div className="text-[#9AA0B3]">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit.
              Explicabo hic atque consequatur animi labore dignissimos
              aspernatur quaerat! Saepe illum aspernatur aut repellendus
              voluptates magnam! Illo tempore molestiae alias enim odio repellat
              minima corrupti magni eius dignissimos sit dolore, nemo aliquam
              veritatis quisquam mollitia cupiditate? A nisi aspernatur
              consequatur excepturi nulla?
            </div>
          </div>

          <button
            onClick={onConnect}
            className="group relative px-10 py-5 bg-white text-black font-bold text-lg uppercase tracking-widest rounded-full hover:scale-105 transition-all duration-300 mx-auto shadow-[0_0_40px_rgba(255,255,255,0.3)]"
          >
            <div className="
  absolute inset-0 rounded-full border border-white
  opacity-0
  group-hover:opacity-100
  shadow-[0_0_15px_rgba(255,255,255,0.15),0_0_40px_rgba(255,255,255,0.25)]
  transition-opacity duration-500
"/>
            <div className="flex items-center gap-3">
              <Wallet size={20} />
              Connect Wallet
            </div>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-end mb-12 border-b border-white/10 pb-6"
        >
          <div>
            <h2 className="text-5xl font-bold tracking-tight text-white mb-2">
              Protocol Access
            </h2>
            <p className="text-sm text-cyan-400/60 uppercase tracking-[0.2em]">
              Select your service  below
            </p>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              SYSTEM ONLINE
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <RoleCard
            title="Lender"
            desc="Supply liquidity to the protocol pool. Earn yield on stablecoins."
            icon={Coins}
            color="blue"
            delay={0.1}
            onClick={() => navigate("/lender")}
          />
          <RoleCard
            title="Merchant"
            desc="Verify customer payments via ZK-proofs. Receives bulk settlement."
            icon={ShoppingBag}
            color="green"
            delay={0.2}
            onClick={() => navigate("/merchant")}
          />
          <RoleCard
            title="Borrower"
            desc="Access under-collateralized credit based on on-chain reputation."
            icon={Briefcase}
            color="red"
            delay={0.3}
            onClick={() => navigate("/borrower")}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
