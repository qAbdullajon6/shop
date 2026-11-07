import { useState, useEffect, useCallback, useRef } from "react";
import { adminUsersService, type UsersListResponse } from "@/services/admin/adminUsers.service";
import type { User } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

const ROLE_LABELS: Record<string, string> = {
  USER: "Foydalanuvchi",
  ADMIN: "Admin",
  SUPER_ADMIN: "Super Admin",
};

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    debounceRef.current && clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => { debounceRef.current && clearTimeout(debounceRef.current); };
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res: UsersListResponse = await adminUsersService.getAll({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      });
      setUsers(res.data);
      setTotal(res.total);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleActive = async (user: User) => {
    if (togglingId) return;
    setTogglingId(user.id);
    const prev = [...users];
    setUsers((us) => us.map((u) => (u.id === user.id ? { ...u, is_active: !u.is_active } : u)));
    try {
      await adminUsersService.update(user.id, { is_active: !user.is_active });
    } catch {
      setUsers(prev);
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const fullName = (u: User) => [u.name, u.last_name].filter(Boolean).join(" ") || null;
  const initial = (u: User) => (u.name?.[0] ?? u.phone_number[4] ?? "?").toUpperCase();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-white">Foydalanuvchilar</h2>
          {!loading && <span className="text-xs text-white/30">{total} ta</span>}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism, telefon yoki email..."
          className="w-full pl-9 pr-4 py-2.5 bg-[#1A1A1A] border border-white/10 rounded-lg text-sm text-white placeholder-white/30 outline-none focus:border-[#C9A45C]/50"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1A1A1A] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Foydalanuvchi</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Telefon</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Rol</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Holati</th>
              <th className="text-left px-3 py-3 text-white/40 font-medium text-xs uppercase tracking-wider">Ro'yxat sanasi</th>
              <th className="px-3 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-3 py-3">
                      <div className="h-4 bg-white/5 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-white/30 text-sm">
                  {debouncedSearch ? "Qidiruv natijasi topilmadi" : "Foydalanuvchilar mavjud emas"}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#C9A45C]/15 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#C9A45C] text-xs font-semibold">{initial(user)}</span>
                      </div>
                      <div>
                        <span className="text-white text-sm block">{fullName(user) ?? <span className="text-white/30 italic">Ism yo'q</span>}</span>
                        {user.email && <span className="text-white/40 text-xs">{user.email}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-white/70 text-sm font-mono">{user.phone_number}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                      user.role === "SUPER_ADMIN"
                        ? "bg-[#C9A45C]/15 text-[#C9A45C] border-[#C9A45C]/30"
                        : user.role === "ADMIN"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-white/5 text-white/40 border-white/10"
                    )}>
                      {ROLE_LABELS[user.role] ?? user.role}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {user.is_active ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />Faol
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-white/5 text-white/40 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/30" />Bloklangan
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-white/40 text-xs">{formatDate(user.created_at)}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    {user.role === "USER" && (
                      <button
                        onClick={() => handleToggleActive(user)}
                        disabled={togglingId === user.id}
                        title={user.is_active ? "Bloklash" : "Faollashtirish"}
                        className={cn(
                          "p-1.5 rounded-lg transition-colors disabled:opacity-50",
                          user.is_active
                            ? "text-white/30 hover:text-red-400 hover:bg-red-400/5"
                            : "text-white/30 hover:text-green-400 hover:bg-green-400/5"
                        )}
                      >
                        {user.is_active ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-white/30">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
          </span>
          <div className="flex gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">←</button>
            <span className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/70 select-none">{page} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30">→</button>
          </div>
        </div>
      )}
    </div>
  );
}
