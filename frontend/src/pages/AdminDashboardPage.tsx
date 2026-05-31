import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  Users, ShoppingCart, DollarSign, Music, BookOpen, FileMusic, Video,
  TrendingUp, ArrowUpRight
} from "lucide-react";
import { api } from "@/services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface DashboardData {
  total_users: number;
  total_revenue: number;
  total_orders: number;
  content_counts: { music: number; books: number; scores: number; videos: number };
  recent_orders: Array<{
    id: string;
    total_amount: string;
    status: string;
    created_at: string;
    items: Array<{ item_type: string; unit_price: string }>;
  }>;
}

export function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number }>>([]);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    api.get("/admin/dashboard").then((r) => setData(r.data)).catch(() => {});
    api.get("/admin/analytics/revenue?period=month").then((r) => setRevenueData(r.data.data || [])).catch(() => {});
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const stats = [
    { label: "Total Users", value: data?.total_users || 0, icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Revenue", value: `$${(data?.total_revenue || 0).toFixed(2)}`, icon: DollarSign, color: "text-green-400", bg: "bg-green-400/10" },
    { label: "Orders", value: data?.total_orders || 0, icon: ShoppingCart, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Music", value: data?.content_counts?.music || 0, icon: Music, color: "text-purple-400", bg: "bg-purple-400/10" },
  ];

  const quickLinks = [
    { label: "Music", href: "/admin-secure-portal/music", icon: Music, count: data?.content_counts?.music || 0 },
    { label: "Books", href: "/admin-secure-portal/books", icon: BookOpen, count: data?.content_counts?.books || 0 },
    { label: "Scores", href: "/admin-secure-portal/scores", icon: FileMusic, count: data?.content_counts?.scores || 0 },
    { label: "Videos", href: "/admin-secure-portal/videos", icon: Video, count: data?.content_counts?.videos || 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl text-utv-cream mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-utv-bg-light border border-utv-border rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-utv-body">{stat.label}</p>
                <p className="text-2xl font-semibold text-utv-cream mt-1">{stat.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-utv-bg-light border border-utv-border rounded-xl p-6">
          <h2 className="font-display text-lg text-utv-cream mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-utv-gold" />
            Revenue Trend
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="date" tick={{ fill: "#B8C2D8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#B8C2D8", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1A2540",
                    border: "1px solid #2A3550",
                    borderRadius: "8px",
                    color: "#F0EBE0",
                  }}
                />
                <Line type="monotone" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6">
          <h2 className="font-display text-lg text-utv-cream mb-4">Content Management</h2>
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center justify-between p-3 rounded-lg bg-utv-bg hover:bg-utv-border transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-utv-gold" />
                  <span className="text-sm text-utv-cream">{link.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-utv-body">{link.count}</span>
                  <ArrowUpRight className="w-4 h-4 text-utv-body group-hover:text-utv-gold transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="mt-6 bg-utv-bg-light border border-utv-border rounded-xl p-6">
        <h2 className="font-display text-lg text-utv-cream mb-4">Recent Orders</h2>
        {data?.recent_orders && data.recent_orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-utv-border text-left text-utv-body">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-utv-border/50">
                    <td className="py-3 text-utv-cream font-mono">{order.id.slice(0, 8)}</td>
                    <td className="py-3 text-utv-gold">${order.total_amount}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "fulfilled" ? "bg-green-400/10 text-green-400" :
                        order.status === "pending" ? "bg-amber-400/10 text-amber-400" :
                        "bg-red-400/10 text-red-400"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-utv-body">{new Date(order.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-utv-body text-center py-8">No orders yet</p>
        )}
      </div>
    </div>
  );
}
