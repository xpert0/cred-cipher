import React from "react";
import { UserCircle, LogOut, Hexagon, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

const Layout = ({ children, wallet, onConnect, onDisconnect, onSwitchWallet }) => {
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col font-sans">
      
      {/* BACKGROUND */}
      <div className="fixed inset-0 bg-[#030014] z-0" />
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none cyber-grid animate-[grid-move_20s_linear_infinite]" />
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[120px] animate-pulse-slow pointer-events-none" />

      {/* NAVBAR */}
      <nav className="h-20 flex-none z-[9999] border-b border-white/5 bg-black/20 backdrop-blur-md relative">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <Hexagon className="absolute inset-0 text-cyan-500 animate-spin-slow" strokeWidth={1} />
              <div className="w-6 h-6 bg-cyan-500/20 rounded-full blur-md absolute" />
              <span className="text-cyan-400 font-bold text-lg relative z-10">A</span>
            </div>
            <span className="text-2xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 group-hover:opacity-80 transition-opacity">
              AURA
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {wallet ? (
              <div className="flex items-center gap-2">
                
                {/* SWITCH WALLET BUTTON */}
                <button
                  type="button"
                  onClick={onSwitchWallet}
                  className="cursor-pointer relative z-[10000] group flex items-center gap-3 bg-white/5 hover:bg-emerald-500/10 rounded-full pl-4 pr-3 py-1.5 border border-white/10 hover:border-emerald-500/50 transition-all active:scale-95"
                  title="Switch Wallet Account"
                >
                  {/* pointer-events-none ensures the click bubbles up to the button, not the div */}
                  <div className="pointer-events-none flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_currentColor] animate-pulse group-hover:bg-emerald-300" />
                    {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : "Loading..."}
                  </div>
                  <RefreshCw size={12} className="pointer-events-none text-emerald-400 opacity-50 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-500" />
                </button>

                {/* LOGOUT BUTTON */}
                <button
                  type="button"
                  onClick={onDisconnect}
                  className="cursor-pointer relative z-[10000] p-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all border border-transparent hover:border-red-500/50 active:scale-95"
                  title="Disconnect Wallet"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={onConnect}
                className="cursor-pointer relative z-[10000] overflow-hidden flex items-center gap-2 px-6 py-2.5 bg-cyan-950/30 text-cyan-400 font-bold text-sm border border-cyan-500/30 rounded-full hover:bg-cyan-500 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all group"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <UserCircle size={18} />
                <span className="tracking-widest">CONNECT</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <main className="flex-1 relative z-10 flex flex-col justify-center w-full max-w-7xl mx-auto px-6 py-10">
        {children}
      </main>
    </div>
  );
};

export default Layout;