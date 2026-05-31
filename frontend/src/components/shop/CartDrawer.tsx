import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: Props) {
  const { t } = useTranslation();
  const { items, removeItem, totalPrice, totalItems } = useCart();
  const { isAuthenticated } = useAuth();

  const tax = totalPrice * 0.1;
  const total = totalPrice + tax;

  const typeIcons: Record<string, string> = {
    music: "",
    book: "",
    score: "",
    video: "",
    ticket: "",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-[400px] bg-utv-bg border-l border-utv-border z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-utv-border">
              <h2 className="font-display text-lg text-utv-cream">{t("cart.title")}</h2>
              <button
                onClick={onClose}
                className="p-2 text-utv-body hover:text-utv-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-16 h-16 text-utv-border mb-4" />
                  <p className="text-utv-body mb-2">{t("cart.empty")}</p>
                  <button
                    onClick={onClose}
                    className="text-utv-gold hover:underline text-sm"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.item_type}-${item.item_id}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 bg-utv-bg-light rounded-lg p-3"
                    >
                      <img
                        src={item.image || "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=100"}
                        alt={item.title}
                        className="w-12 h-12 rounded object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-utv-cream truncate">{item.title}</p>
                        <p className="text-xs text-utv-body capitalize">{item.item_type}</p>
                        <p className="text-sm font-medium text-utv-gold">
                          ${item.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.item_id, item.item_type)}
                        className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-utv-border p-4 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-utv-body">
                    <span>{t("cart.subtotal")}</span>
                    <span className="text-utv-cream">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-utv-body">
                    <span>{t("cart.tax")}</span>
                    <span className="text-utv-cream">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-utv-cream font-semibold pt-1 border-t border-utv-border">
                    <span>{t("cart.total")}</span>
                    <span className="text-utv-gold">${total.toFixed(2)}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <Link
                    to="/checkout"
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full bg-utv-gold text-utv-bg py-3 rounded-lg font-semibold hover:bg-utv-gold/90 transition-colors"
                  >
                    {t("cart.checkout")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={onClose}
                    className="flex items-center justify-center w-full bg-utv-border text-utv-cream py-3 rounded-lg font-medium hover:bg-utv-border-light transition-colors"
                  >
                    Login to Checkout
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
