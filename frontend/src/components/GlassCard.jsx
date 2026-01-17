import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = "" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        relative overflow-hidden
        bg-[#111]/40 backdrop-blur-2xl 
        border border-white/10 
        rounded-2xl
        shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]
        p-8 w-full
        before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none
        ${className}
      `}
    >
      {/* Decorative top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      
      {children}
    </motion.div>
  );
};

export default GlassCard;