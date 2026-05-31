import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { ordersApi } from "@/services/orders";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export function CartPage() {
  const { t } = useTranslation();
  const { items, removeItem, totalPrice, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const tax = totalPrice * 0.1;
  const total = totalPrice + tax;

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      return;
    }
    setIsCheckingOut(true);
    try {
      const cartItems = items.map((item) => ({
        item_type: item.item_type,
        item_id: item.item_id,
        quantity: item.quantity,
      }));
      const { url } = await ordersApi.createCheckout(cartItems);
      window.location.href = url;
    } catch {
      toast.error("Checkout failed. Please try again.");
      setIsCheckingOut(false);
    }
  };

  const typeIcon = (type: string) => {
    const icons: Record<string, string> = {
      music: "bg-blue-500/20 text-blue-400",
      book: "bg-amber-500/20 text-amber-400",
      score: "bg-purple-500/20 text-purple-400",
      video: "bg-red-500/20 text-red-400",
      ticket: "bg-green-500/20 text-green-400",
    };
    return icons[type] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-display text-3xl text-utv-cream mb-8">{t("cart.title")}</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 text-utv-border mx-auto mb-4" />
            <p className="text-utv-body text-lg mb-4">{t("cart.empty")}</p>
            <Link
              to="/music"
              className="inline-flex items-center gap-2 text-utv-gold hover:underline"
            >
              Browse Music <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Items */}
            <div className="md:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.item_type}-${item.item_id}`}
                  className="flex items-center gap-4 bg-utv-bg-light border border-utv-border rounded-xl p-4"
                >
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=100"}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${typeIcon(item.item_type)}`}>
                        {item.item_type}
                      </span>
                    </div>
                    <h3 className="text-utv-cream font-medium truncate mt-1">{item.title}</h3>
                    <p className="text-utv-gold font-medium">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.item_id, item.item_type)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6 h-fit">
              <h2 className="font-display text-lg text-utv-cream mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-utv-body">
                  <span>{t("cart.subtotal")}</span>
                  <span className="text-utv-cream">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-utv-body">
                  <span>{t("cart.tax")}</span>
                  <span className="text-utv-cream">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-utv-border pt-3 flex justify-between text-utv-cream font-semibold">
                  <span>{t("cart.total")}</span>
                  <span className="text-utv-gold text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full mt-6 bg-utv-gold text-utv-bg py-3 rounded-lg font-semibold hover:bg-utv-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <div className="w-5 h-5 border-2 border-utv-bg/30 border-t-utv-bg rounded-full animate-spin" />
                ) : (
                  <>
                    {t("cart.checkout")}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-utv-body text-center mt-3">
                  <Link to="/login" className="text-utv-gold hover:underline">Login</Link> required for checkout
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
