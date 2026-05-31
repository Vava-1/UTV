import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { User, Package, Download, Ticket, Save } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "profile" | "orders" | "downloads" | "tickets";

export function ProfilePage() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    preferred_language: user?.preferred_language || "en",
  });

  const handleSave = () => {
    setUser(user ? { ...user, ...form } : null);
    toast.success("Profile updated");
    setIsEditing(false);
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: t("profile.title"), icon: User },
    { id: "orders", label: t("profile.orders"), icon: Package },
    { id: "downloads", label: t("profile.downloads"), icon: Download },
    { id: "tickets", label: t("profile.tickets"), icon: Ticket },
  ];

  return (
    <div className="pt-20 pb-10 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="font-display text-3xl text-utv-cream mb-8">{t("profile.title")}</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-utv-bg-light border border-utv-border rounded-xl p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    activeTab === tab.id
                      ? "bg-utv-gold/10 text-utv-gold"
                      : "text-utv-body hover:text-utv-cream hover:bg-utv-border"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {activeTab === "profile" && (
              <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-utv-border flex items-center justify-center">
                      <User className="w-8 h-8 text-utv-body" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-utv-cream">
                        {user?.first_name} {user?.last_name}
                      </h2>
                      <p className="text-sm text-utv-body">@{user?.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                    className="flex items-center gap-2 bg-utv-gold text-utv-bg px-4 py-2 rounded-lg text-sm font-medium hover:bg-utv-gold/90 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {isEditing ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-utv-body mb-1">First Name</label>
                      <input
                        value={form.first_name}
                        onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-utv-bg border border-utv-border rounded-lg px-3 py-2 text-sm text-utv-cream disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-utv-body mb-1">Last Name</label>
                      <input
                        value={form.last_name}
                        onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                        disabled={!isEditing}
                        className="w-full bg-utv-bg border border-utv-border rounded-lg px-3 py-2 text-sm text-utv-cream disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-utv-body mb-1">Email</label>
                    <input
                      value={user?.email || ""}
                      disabled
                      className="w-full bg-utv-bg border border-utv-border rounded-lg px-3 py-2 text-sm text-utv-cream opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-utv-body mb-1">Language</label>
                    <select
                      value={form.preferred_language}
                      onChange={(e) => setForm({ ...form, preferred_language: e.target.value })}
                      disabled={!isEditing}
                      className="w-full bg-utv-bg border border-utv-border rounded-lg px-3 py-2 text-sm text-utv-cream disabled:opacity-50"
                    >
                      <option value="en">English</option>
                      <option value="fr">Francais</option>
                      <option value="es">Espanol</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="pt">Portugues</option>
                      <option value="rw">Kinyarwanda</option>
                      <option value="sw">Kiswahili</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6 text-center">
                <Package className="w-12 h-12 text-utv-border mx-auto mb-3" />
                <p className="text-utv-body">Your orders will appear here</p>
              </div>
            )}

            {activeTab === "downloads" && (
              <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6 text-center">
                <Download className="w-12 h-12 text-utv-border mx-auto mb-3" />
                <p className="text-utv-body">Your downloads will appear here</p>
              </div>
            )}

            {activeTab === "tickets" && (
              <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6 text-center">
                <Ticket className="w-12 h-12 text-utv-border mx-auto mb-3" />
                <p className="text-utv-body">Your tickets will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
