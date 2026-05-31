import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserPlus, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsLoading(true);
    try {
      await register({
        email: form.email,
        username: form.username,
        password: form.password,
        first_name: form.first_name || undefined,
        last_name: form.last_name || undefined,
      });
      toast.success(t("auth.registerSuccess"));
      navigate("/");
    } catch {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="font-display text-3xl text-utv-cream">{t("auth.register")}</h2>
            <p className="text-utv-body mt-2">Join the UNA TANTUM VOCE community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-utv-body mb-1.5">{t("auth.firstName")}</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  className="w-full bg-utv-bg-light border border-utv-border rounded-lg px-4 py-3 text-utv-cream focus:outline-none focus:border-utv-gold"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm text-utv-body mb-1.5">{t("auth.lastName")}</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  className="w-full bg-utv-bg-light border border-utv-border rounded-lg px-4 py-3 text-utv-cream focus:outline-none focus:border-utv-gold"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-utv-body mb-1.5">{t("auth.username")}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-utv-body" />
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-4 py-3 text-utv-cream focus:outline-none focus:border-utv-gold"
                  placeholder="johndoe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-utv-body mb-1.5">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-utv-body" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-4 py-3 text-utv-cream focus:outline-none focus:border-utv-gold"
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
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-12 py-3 text-utv-cream focus:outline-none focus:border-utv-gold"
                  placeholder="Min 8 characters"
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

            <div>
              <label className="block text-sm text-utv-body mb-1.5">{t("auth.confirmPassword")}</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full bg-utv-bg-light border border-utv-border rounded-lg px-4 py-3 text-utv-cream focus:outline-none focus:border-utv-gold"
                placeholder="Confirm password"
                required
              />
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
                  <UserPlus className="w-5 h-5" />
                  {t("auth.register")}
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-utv-body mt-6">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-utv-gold hover:underline">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>

      <div
        className="hidden lg:block lg:w-3/5 relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-utv-bg via-utv-bg/50 to-transparent" />
      </div>
    </div>
  );
}
