import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { adminAuthService } from "@/services/admin/adminAuth.service";
import { adminTokens } from "@/lib/adminTokens";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await adminAuthService.adminLogin(phone_number, password);
      adminTokens.setAccess(data.access_token);
      navigate("/admin/categories", { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string; message?: string } } })
          ?.response?.data?.detail ??
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ??
        "Login yoki parol noto'g'ri";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-2xl font-serif font-semibold tracking-widest text-[#C9A45C] uppercase">
            ZAHABI
          </span>
          <p className="text-white/40 text-xs tracking-wider uppercase mt-1">
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-8">
          <h2 className="text-white font-semibold text-lg mb-6">Kirish</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Telefon raqam
              </label>
              <input
                type="tel"
                value={phone_number}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+998901234567"
                required
                className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2.5 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/60 mb-1.5">
                Parol
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#111111] border border-white/15 text-white rounded-lg px-3 py-2.5 text-sm placeholder-white/25 focus:outline-none focus:border-[#C9A45C]/50 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A45C] text-black font-semibold rounded-lg px-4 py-2.5 text-sm mt-2 hover:bg-[#d4b06a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Yuklanmoqda..." : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
