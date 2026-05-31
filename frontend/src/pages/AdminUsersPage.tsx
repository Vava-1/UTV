import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";
import { Search, Shield, UserX } from "lucide-react";
import type { User } from "@/types";

export function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAdmin) { navigate("/"); return; }
    api.get("/admin/users").then((r) => setUsers(r.data.items || [])).catch(() => {});
  }, [isAdmin, navigate]);

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display text-2xl text-utv-cream mb-6">Users</h1>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-utv-body" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full bg-utv-bg-light border border-utv-border rounded-lg pl-10 pr-4 py-2 text-sm text-utv-cream placeholder:text-utv-body/50 focus:outline-none focus:border-utv-gold"
        />
      </div>

      <div className="bg-utv-bg-light border border-utv-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-utv-border text-left text-utv-body bg-utv-bg">
              <th className="p-4 font-medium">User</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Joined</th>
              <th className="p-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-utv-border/50 hover:bg-utv-border/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-utv-border flex items-center justify-center">
                      <span className="text-xs text-utv-cream">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-utv-cream font-medium">{user.username}</p>
                      <p className="text-xs text-utv-body">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                    user.role === "superadmin" ? "bg-purple-400/10 text-purple-400" :
                    user.role === "admin" ? "bg-utv-gold/10 text-utv-gold" :
                    "bg-utv-border text-utv-body"
                  }`}>
                    <Shield className="w-3 h-3" />
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.is_active ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                  }`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-utv-body">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="p-4">
                  <button className="p-1.5 text-red-400 hover:bg-red-400/10 rounded transition-colors">
                    <UserX className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
