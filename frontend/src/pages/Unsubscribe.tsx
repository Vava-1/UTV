import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, CheckCircle, Home, RefreshCcw, Loader2, Music } from 'lucide-react';
import api from '@/utils/api';

type PageState = 'idle' | 'loading' | 'success' | 'error';

export function UnsubscribePage() {
  const [searchParams] = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [pageState, setPageState] = useState<PageState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [resubscribed, setResubscribed] = useState(false);

  const handleUnsubscribe = async () => {
    if (!email.trim()) return;
    setPageState('loading');
    setErrorMsg('');
    try {
      await api.post(`/newsletter/unsubscribe?email=${encodeURIComponent(email.trim())}`);
      setPageState('success');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || 'Something went wrong. Please try again.');
      setPageState('error');
    }
  };

  const handleResubscribe = async () => {
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      setResubscribed(true);
    } catch {
      // silent
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        {/* UTV Logo header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-7 h-7 bg-amber-500 rounded-sm flex items-center justify-center">
            <Music size={14} className="text-[#09090b]" />
          </div>
          <span className="text-xs text-amber-500/70 tracking-[0.25em] uppercase font-medium">
            Una Tantum Voce
          </span>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {pageState !== 'success' ? (
              /* FORM STATE */
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              >
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-6">
                  <X size={28} className="text-slate-400" />
                </div>

                <h1 className="text-2xl font-bold text-white text-center mb-2">
                  Unsubscribe
                </h1>
                <p className="text-slate-400 text-sm text-center mb-8 leading-relaxed">
                  We're sorry to see you go. Confirm your email below and we'll remove you from
                  our newsletter.
                </p>

                {/* Email field */}
                <div className="mb-6">
                  <label className="block text-xs text-slate-400 font-medium mb-2 tracking-wide uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-slate-800/80 border border-slate-700 focus:border-amber-500/60 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none transition-all duration-200 focus:ring-2 focus:ring-amber-500/15"
                    />
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {pageState === 'error' && errorMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400"
                    >
                      {errorMsg}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUnsubscribe}
                  disabled={pageState === 'loading' || !email.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-500/80 hover:bg-red-500 text-white font-bold rounded-xl transition-all duration-200 text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pageState === 'loading' ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Processing…
                    </>
                  ) : (
                    <>
                      <X size={15} />
                      Confirm Unsubscribe
                    </>
                  )}
                </motion.button>

                {/* Back to home */}
                <div className="text-center mt-5">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    <Home size={12} />
                    Back to home
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* SUCCESS STATE */
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle size={28} className="text-emerald-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-3">You've been unsubscribed</h2>
                <p className="text-slate-400 text-sm mb-1">
                  <span className="text-amber-400">{email}</span> has been removed from our
                  newsletter.
                </p>
                <p className="text-slate-500 text-xs mb-8">
                  You will no longer receive marketing emails from UTV.
                </p>

                {/* Re-subscribe */}
                {!resubscribed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 px-4 py-4 bg-slate-800/60 border border-slate-700 rounded-xl"
                  >
                    <p className="text-sm text-slate-400 mb-3">Changed your mind?</p>
                    <button
                      onClick={handleResubscribe}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-sm font-medium rounded-lg transition-all duration-200"
                    >
                      <RefreshCcw size={13} />
                      Re-subscribe
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400"
                  >
                    ✓ You've been re-subscribed to the newsletter.
                  </motion.div>
                )}

                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Home size={12} />
                  Back to home
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
