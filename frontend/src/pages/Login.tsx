import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Music, LogIn, UserPlus, Mail, Lock, User } from 'lucide-react';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) await register(email, password, firstName, lastName);
      else await login(email, password);
      navigate('/');
    } catch (err: any) { setError(err.response?.data?.detail || 'An error occurred'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Music size={28} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{isRegister ? t('auth.register') : t('auth.login')}</h1>
            <p className="text-sm text-slate-400">UNA TANTUM VOCE</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder={t('auth.firstName')} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" required /></div>
                <div className="relative"><User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder={t('auth.lastName')} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" required /></div>
              </>
            )}
            <div className="relative"><Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('auth.email')} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" required /></div>
            <div className="relative"><Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('auth.password')} className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50" required minLength={8} /></div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-500 text-slate-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" /> : isRegister ? <><UserPlus size={18} /> {t('auth.register')}</> : <><LogIn size={18} /> {t('auth.login')}</>}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            {isRegister ? <>{t('auth.hasAccount')} <button onClick={() => setIsRegister(false)} className="text-amber-500 hover:text-amber-400 font-medium">{t('auth.login')}</button></> : <>{t('auth.noAccount')} <button onClick={() => setIsRegister(true)} className="text-amber-500 hover:text-amber-400 font-medium">{t('auth.register')}</button></>}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
