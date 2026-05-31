import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LogIn, Mail, Lock, Eye, EyeOff, Music } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      toast.success(t("auth.loginSuccess"));
      navigate("/");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-full bg-utv-gold flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-utv-bg" />
            </div>
            <h2 className="font-display text-3xl text-utv-cream">{t("auth.login")}</h2>
            <p className="text-utv-body mt-2">Welcome back to UNA TANTUM VOCE</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-utv-body mb-1.5">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-utv-body" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-4 py-3 text-utv-cream focus:outline-none focus:border-utv-gold transition-colors"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-utv-body mb-1.5">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-utv-body" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-12 py-3 text-utv-cream focus:outline-none focus:border-utv-gold transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-utv-body hover:text-utv-cream"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-utv-body">
                <input type="checkbox" className="rounded border-utv-border bg-utv-bg-light" />
                {t("auth.rememberMe")}
              </label>
              <Link to="/forgot-password" className="text-utv-gold hover:underline">
                {t("auth.forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-utv-gold text-utv-bg py-3 rounded-lg font-semibold hover:bg-utv-gold/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-utv-bg/30 border-t-utv-bg rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  {t("auth.login")}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-utv-body mt-6">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="text-utv-gold hover:underline">
              {t("auth.register")}
            </Link>
          </p>
        </div>
      </div>

      {/* Hero Side */}
      <div
        className="hidden lg:block lg:w-3/5 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=1200')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-utv-bg via-utv-bg/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-12">
            <h1 className="font-display text-5xl text-utv-cream mb-4">UNA TANTUM VOCE</h1>
            <p className="text-xl text-utv-body/80">One Voice, One Time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
