import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { adminTokens } from "@/lib/adminTokens";
import { refreshAccessToken } from "@/lib/refreshSession";

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const [status, setStatus] = useState<"checking" | "ok" | "denied">(
    adminTokens.getAccess() ? "ok" : "checking"
  );

  useEffect(() => {
    if (status !== "checking") return;

    refreshAccessToken()
      .then((accessToken) => {
        adminTokens.setAccess(accessToken);
        setStatus("ok");
      })
      .catch(() => setStatus("denied"));
  }, [status]);

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111111]">
        <div className="w-6 h-6 rounded-full border-2 border-[#C9A45C]/30 border-t-[#C9A45C] animate-spin" />
      </div>
    );
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
