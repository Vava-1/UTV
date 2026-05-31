import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Package } from "lucide-react";
import type { Order } from "@/types";

export function AdminOrdersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    api.get("/admin/orders").then((r) => setOrders(r.data.items || [])).catch(() => {});
  }, [isAdmin, navigate]);

  const statusColor = (status: string) => {
    switch (status) {
      case "fulfilled": return "bg-green-400/10 text-green-400";
      case "paid": return "bg-blue-400/10 text-blue-400";
      case "pending": return "bg-amber-400/10 text-amber-400";
      case "cancelled": return "bg-red-400/10 text-red-400";
      default: return "bg-utv-border text-utv-body";
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-utv-cream mb-6">Orders</h1>
      <div className="bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-utv-border text-left text-utv-body bg-utv-bg">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Items</th>
              <th className="p-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-utv-border/50 hover:bg-utv-border/20">
                <td className="p-4 text-utv-cream font-mono">{order.id.slice(0, 8)}</td>
                <td className="p-4 text-utv-gold font-medium">${order.total_amount}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-utv-body">{order.items?.length || 0} items</td>
                <td className="p-4 text-utv-body">{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-utv-border mx-auto mb-3" />
            <p className="text-utv-body">No orders yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
