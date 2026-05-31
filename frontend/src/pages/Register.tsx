import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/Toast';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Music } from 'lucide-react';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
      showToast('Welcome to UNA TANTUM VOCE!', 'success');
      navigate('/discover');
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Registration failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-600/5 rounded-full blur-2xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-[#0f0e0c] border border-[#2a2515] rounded-2xl p-8 shadow-2xl">
          {/* Logo + Title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music size={24} className="text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold text-white font-serif tracking-wide">
              Join UNA TANTUM VOCE
            </h1>
            <p className="text-sm text-[#6a6055] mt-2 tracking-wide">
              Music Development for All
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#7a6e62] mb-1.5 tracking-wider uppercase">
                  First Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4035]" />
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Jean"
                    className="w-full bg-[#1a1813] border border-[#2a2515] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#4a4035] focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#7a6e62] mb-1.5 tracking-wider uppercase">
                  Last Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4035]" />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Baptiste"
                    className="w-full bg-[#1a1813] border border-[#2a2515] rounded-lg pl-9 pr-3 py-2.5 text-sm text-white placeholder-[#4a4035] focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs text-[#7a6e62] mb-1.5 tracking-wider uppercase">
                Email Address
              </label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4035]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-[#1a1813] border border-[#2a2515] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#4a4035] focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-[#7a6e62] mb-1.5 tracking-wider uppercase">
                Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4035]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full bg-[#1a1813] border border-[#2a2515] rounded-lg pl-9 pr-10 py-2.5 text-sm text-white placeholder-[#4a4035] focus:outline-none focus:border-amber-500/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4a4035] hover:text-amber-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-[#7a6e62] mb-1.5 tracking-wider uppercase">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a4035]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Repeat password"
                  className="w-full bg-[#1a1813] border border-[#2a2515] rounded-lg pl-9 pr-4 py-2.5 text-sm text-white placeholder-[#4a4035] focus:outline-none focus:border-amber-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Password strength indicator */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(level => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        getPasswordStrength(formData.password) >= level
                          ? level <= 2 ? 'bg-red-500' : level === 3 ? 'bg-amber-500' : 'bg-emerald-500'
                          : 'bg-[#2a2515]'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#6a6055]">
                  {['', 'Weak', 'Fair', 'Good', 'Strong'][getPasswordStrength(formData.password)]} password
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-amber-500 text-[#09090b] font-bold text-sm tracking-widest uppercase rounded-lg hover:bg-amber-400 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#09090b] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus size={16} />
                  CREATE ACCOUNT
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#2a2515]" />
            <span className="text-xs text-[#4a4035]">OR</span>
            <div className="flex-1 h-px bg-[#2a2515]" />
          </div>

          {/* Sign In link */}
          <p className="text-center text-sm text-[#6a6055]">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
              Sign In
            </Link>
          </p>
        </div>

        {/* Legal note */}
        <p className="text-center text-xs text-[#4a4035] mt-4 px-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
