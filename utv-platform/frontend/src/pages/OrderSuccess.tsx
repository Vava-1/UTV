import React, { useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, Music, Sparkles } from 'lucide-react';

// Floating particle component
function FloatingDot({ delay, x, y, size, color }: {
  delay: number;
  x: number;
  y: number;
  size: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x, y: y + 40 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1, 0.5],
        y: [y + 40, y - 60, y - 120],
        x: [x, x + (Math.random() > 0.5 ? 20 : -20), x],
      }}
      transition={{
        delay,
        duration: 3.5,
        repeat: Infinity,
        repeatDelay: Math.random() * 2 + 1,
        ease: 'easeOut',
      }}
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        left: '50%',
        top: '50%',
      }}
    />
  );
}

const particles = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  delay: i * 0.25,
  x: (Math.random() - 0.5) * 260,
  y: (Math.random() - 0.5) * 160,
  size: Math.random() * 6 + 4,
  color: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#10b981' : '#fcd34d',
}));

export function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-amber-500/8 blur-[80px]" />
      </div>

      <div className="relative w-full max-w-lg text-center">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <FloatingDot key={p.id} {...p} />
          ))}
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-10 shadow-2xl"
        >
          {/* Checkmark */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6, type: 'spring', stiffness: 200 }}
            className="relative inline-flex items-center justify-center mb-8"
          >
            {/* Pulse rings */}
            <motion.div
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              className="absolute w-24 h-24 rounded-full border-2 border-emerald-400/60"
            />
            <motion.div
              animate={{ scale: [1, 1.9], opacity: [0.3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.8 }}
              className="absolute w-24 h-24 rounded-full border border-amber-400/40"
            />
            <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 flex items-center justify-center">
              <CheckCircle size={44} className="text-emerald-400" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* UTV Branding */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex items-center justify-center gap-2 mb-6"
          >
            <div className="w-6 h-6 bg-amber-500 rounded-sm flex items-center justify-center">
              <Music size={12} className="text-[#09090b]" />
            </div>
            <span className="text-xs text-amber-500/70 tracking-[0.25em] uppercase font-medium">
              Una Tantum Voce
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-bold text-white mb-3 tracking-tight"
          >
            Payment Successful!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-slate-400 text-base mb-6 leading-relaxed"
          >
            Your order is being processed. You'll receive a confirmation
            <br />
            email shortly.
          </motion.p>

          {/* Session ID */}
          {sessionId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mb-8 px-4 py-2 bg-slate-800/80 rounded-lg border border-slate-700 inline-block"
            >
              <p className="text-xs text-slate-500 font-mono tracking-wider">
                Session: <span className="text-slate-400">{sessionId}</span>
              </p>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#09090b] font-bold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm tracking-wide"
            >
              <ShoppingBag size={16} />
              View My Orders
            </Link>
            <Link
              to="/music"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
            >
              <Sparkles size={16} className="text-amber-400" />
              Continue Shopping
            </Link>
          </motion.div>

          {/* Footer note */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="text-xs text-slate-600 mt-8"
          >
            Powered by Stripe · All transactions are secure and encrypted
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
