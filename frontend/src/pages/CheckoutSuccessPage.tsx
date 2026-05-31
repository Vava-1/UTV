import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { CheckCircle, Download, Home } from "lucide-react";
import { ordersApi } from "@/services/orders";

export function CheckoutSuccessPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [downloads, setDownloads] = useState<Array<{ type: string; url: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (sessionId) {
      ordersApi.checkoutSuccess(sessionId)
        .then((data) => setDownloads(data.downloads || []))
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [sessionId]);

  return (
    <div className="pt-20 pb-10 min-h-screen flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-3xl text-utv-cream mb-2"
        >
          {t("checkout.success")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-utv-body mb-8"
        >
          {t("checkout.thankYou")}
        </motion.p>

        {sessionId && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-utv-bg-light border border-utv-border rounded-xl p-4 mb-6"
          >
            <p className="text-sm text-utv-body">
              {t("checkout.orderNumber")}: <span className="text-utv-cream font-mono">{sessionId.slice(0, 8)}</span>
            </p>
          </motion.div>
        )}

        {downloads.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3 mb-8"
          >
            <p className="text-utv-cream font-medium mb-3">{t("checkout.downloadReady")}</p>
            {downloads.map((dl, i) => (
              <a
                key={i}
                href={dl.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-utv-border text-utv-cream py-3 rounded-lg hover:bg-utv-border-light transition-colors"
              >
                <Download className="w-4 h-4" />
                Download {dl.type}
              </a>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-utv-gold hover:underline"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
