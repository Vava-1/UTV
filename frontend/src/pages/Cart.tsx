import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  BookOpen,
  Package,
  Loader2,
  Receipt,
  Sparkles,
} from 'lucide-react';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { CartItem } from '@/types';

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const fetchCart = useCallback(async () => {
    try {
      const res = await api.get('/orders/cart');
      setCartItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const removeItem = async (cartItemId: number) => {
    setRemovingId(cartItemId);
    try {
      await api.delete(`/orders/cart/${cartItemId}`);
      setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
    } catch (err) {
      console.error(err);
    } finally {
      setRemovingId(null);
    }
  };

  const updateQuantity = async (item: CartItem, delta: number) => {
    const newQty = item.quantity + delta;
    if (newQty < 1) {
      await removeItem(item.id);
      return;
    }
    setUpdatingId(item.id);
    try {
      await api.post('/orders/cart', { content_id: item.content_id, quantity: newQty });
      setCartItems((prev) =>
        prev.map((ci) => (ci.id === item.id ? { ...ci, quantity: newQty } : ci))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await api.post('/orders/checkout');
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error(err);
      setCheckingOut(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.content?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  const currency = cartItems[0]?.content?.currency || 'USD';

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={36} className="text-amber-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <ShoppingCart size={20} className="text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
        </div>
        <p className="text-slate-400 text-sm ml-[52px]">
          {cartItems.length === 0
            ? 'No items yet'
            : `${cartItems.length} item${cartItems.length > 1 ? 's' : ''} in your cart`}
        </p>
      </motion.div>

      {cartItems.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="relative mb-8">
            <div className="w-28 h-28 rounded-full bg-amber-500/8 border border-amber-500/20 flex items-center justify-center mx-auto">
              <ShoppingCart size={48} className="text-amber-500/40" />
            </div>
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center"
            >
              <Package size={14} className="text-slate-500" />
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Your cart is empty</h2>
          <p className="text-slate-400 mb-8 max-w-sm">
            Discover our collection of books, scores, and recordings and add them to your cart.
          </p>
          <Link
            to="/books"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-[#09090b] font-bold rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <BookOpen size={18} />
            Browse Books
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Cart Items */}
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-amber-500/30 rounded-xl p-4 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    {/* Cover */}
                    <div className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-800">
                      {item.content?.cover_image_url ? (
                        <img
                          src={item.content.cover_image_url}
                          alt={item.content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen size={24} className="text-slate-600" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate text-sm">
                        {item.content?.title || `Item #${item.content_id}`}
                      </p>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {item.content?.author ||
                          item.content?.artist ||
                          item.content?.publisher ||
                          '—'}
                      </p>
                      <p className="text-xs text-amber-400 font-medium mt-1">
                        {item.content?.currency || 'USD'}{' '}
                        {(item.content?.price ?? 0).toFixed(2)} each
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item, -1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                      >
                        <Minus size={12} className="text-slate-300" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold text-white">
                        {updatingId === item.id ? (
                          <Loader2 size={12} className="mx-auto animate-spin text-amber-400" />
                        ) : (
                          item.quantity
                        )}
                      </span>
                      <button
                        onClick={() => updateQuantity(item, 1)}
                        disabled={updatingId === item.id}
                        className="w-7 h-7 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-amber-500/50 flex items-center justify-center transition-all duration-200 disabled:opacity-40"
                      >
                        <Plus size={12} className="text-slate-300" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right flex-shrink-0 w-20">
                      <p className="font-bold text-white text-sm">
                        {currency} {((item.content?.price ?? 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.id)}
                      disabled={removingId === item.id}
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 disabled:opacity-40 ml-1"
                    >
                      {removingId === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="sticky top-8"
          >
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              {/* Summary header */}
              <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-2">
                <Receipt size={18} className="text-amber-400" />
                <h2 className="font-bold text-white tracking-wide text-sm uppercase">
                  Order Summary
                </h2>
              </div>

              {/* Items breakdown */}
              <div className="px-6 py-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-300 truncate">
                        {item.content?.title || `Item #${item.content_id}`}
                      </p>
                      <p className="text-xs text-slate-500">× {item.quantity}</p>
                    </div>
                    <span className="text-xs font-medium text-white flex-shrink-0">
                      {currency}{' '}
                      {((item.content?.price ?? 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="px-6 py-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Subtotal</span>
                  <span className="text-sm text-white font-medium">
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">Taxes & fees</span>
                  <span className="text-sm text-slate-400">Calculated at checkout</span>
                </div>
                <div className="pt-3 border-t border-slate-700 flex justify-between items-center">
                  <span className="text-base font-bold text-white">Estimated Total</span>
                  <span className="text-xl font-bold text-amber-400">
                    {currency} {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="px-6 pb-6">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={checkingOut || cartItems.length === 0}
                  className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-[#09090b] font-bold tracking-widest text-sm uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Proceed to Checkout
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
                <p className="text-center text-xs text-slate-500 mt-3">
                  Secured by Stripe · SSL Encrypted
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
