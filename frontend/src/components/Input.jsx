import React from 'react';

const Input = ({ label, ...props }) => {
  return (
    <div className="group flex flex-col gap-2 mb-6 w-full">
      <label className="text-xs uppercase tracking-[0.2em] text-cyan-200/50 font-bold ml-1 group-focus-within:text-cyan-400 transition-colors">
        {label}
      </label>
      <div className="relative">
        <input 
          className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-4 text-white placeholder:text-white/20 focus:outline-none focus:bg-white/[0.05] focus:border-cyan-500/50 transition-all font-mono tracking-wider shadow-inner"
          {...props}
        />
        {/* Glow Effect */}
        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-cyan-500 transition-all duration-300 group-focus-within:w-full shadow-[0_0_10px_currentColor]" />
      </div>
    </div>
  );
};

export default Input;