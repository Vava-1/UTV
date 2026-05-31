import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export function AdminAnalyticsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [revenue, setRevenue] = useState<Array<{ date: string; revenue: number }>>([]);
  const [users, setUsers] = useState<Array<{ date: string; users: number }>>([]);
  const [topContent, setTopContent] = useState<Array<{ title: string; purchase_count: number }>>([]);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    api.get(`/admin/analytics/revenue?period=${period}`).then((r) => setRevenue(r.data.data || [])).catch(() => {});
    api.get("/admin/analytics/users-growth?period=month").then((r) => setUsers(r.data.data || [])).catch(() => {});
    api.get("/admin/analytics/top-content").then((r) => setTopContent(r.data.items || [])).catch(() => {});
  }, [isAdmin, navigate, period]);

  if (!isAdmin) return null;

  return (
    <div>
      <h1 className="font-display text-2xl text-utv-cream mb-6">Analytics</h1>

      <div className="flex gap-2 mb-6">
        {["day", "week", "month", "year"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              period === p
                ? "bg-utv-gold text-utv-bg"
                : "bg-utv-border text-utv-body hover:text-utv-cream"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue */}
        <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6">
          <h2 className="font-display text-lg text-utv-cream mb-4">Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenue}>
                <XAxis dataKey="date" tick={{ fill: "#B8C2D8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#B8C2D8", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1A2540", border: "1px solid #2A3550", borderRadius: "8px", color: "#F0EBE0" }} />
                <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth */}
        <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6">
          <h2 className="font-display text-lg text-utv-cream mb-4">User Growth</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={users}>
                <XAxis dataKey="date" tick={{ fill: "#B8C2D8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#B8C2D8", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1A2540", border: "1px solid #2A3550", borderRadius: "8px", color: "#F0EBE0" }} />
                <Line type="monotone" dataKey="users" stroke="#3B82F6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Content */}
        <div className="lg:col-span-2 bg-utv-bg-light border border-utv-border rounded-xl p-6">
          <h2 className="font-display text-lg text-utv-cream mb-4">Top Content</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topContent}>
                <XAxis dataKey="title" tick={{ fill: "#B8C2D8", fontSize: 11 }} />
                <YAxis tick={{ fill: "#B8C2D8", fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: "#1A2540", border: "1px solid #2A3550", borderRadius: "8px", color: "#F0EBE0" }} />
                <Bar dataKey="purchase_count" fill="#C9A84C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
