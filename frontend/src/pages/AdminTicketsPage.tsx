import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { QrCode, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/services/api";
import toast from "react-hot-toast";

export function AdminTicketsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ valid: boolean; message: string; event_title?: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isAdmin) { navigate("/"); return null; }

  const handleVerify = async () => {
    if (!code.trim()) return;
    setIsVerifying(true);
    try {
      const { data } = await api.post(`/tickets/verify/${code}`);
      setResult(data);
      if (data.valid) toast.success("Ticket verified!");
      else toast.error(data.message || "Invalid ticket");
    } catch {
      toast.error("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl text-utv-cream mb-6">Ticket Verification</h1>

      <div className="max-w-lg">
        <div className="bg-utv-bg-light border border-utv-border rounded-xl p-6">
          <label className="block text-sm text-utv-body mb-2">Enter Ticket Code</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Scan or type ticket code"
              className="flex-1 bg-utv-bg border border-utv-border rounded-lg px-4 py-3 text-utv-cream placeholder:text-utv-body/50 focus:outline-none focus:border-utv-gold font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            />
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="bg-utv-gold text-utv-bg px-6 py-3 rounded-lg font-medium hover:bg-utv-gold/90 transition-colors disabled:opacity-50"
            >
              {isVerifying ? "..." : "Verify"}
            </button>
          </div>
        </div>

        {result && (
          <div className={`mt-4 p-4 rounded-xl border ${
            result.valid
              ? "bg-green-400/10 border-green-400/30"
              : "bg-red-400/10 border-red-400/30"
          }`}>
            <div className="flex items-center gap-3">
              {result.valid ? (
                <CheckCircle className="w-8 h-8 text-green-400" />
              ) : (
                <XCircle className="w-8 h-8 text-red-400" />
              )}
              <div>
                <p className={`font-medium ${result.valid ? "text-green-400" : "text-red-400"}`}>
                  {result.valid ? "Valid Ticket" : "Invalid Ticket"}
                </p>
                {result.event_title && (
                  <p className="text-sm text-utv-body">{result.event_title}</p>
                )}
                <p className="text-sm text-utv-body">{result.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
