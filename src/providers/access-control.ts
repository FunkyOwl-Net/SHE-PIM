import { AccessControlProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@/utils/supabase/client";

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action }) => {
    // 1. Wer ist eingeloggt?
    const { data: { user } } = await supabaseBrowserClient.auth.getUser();
    if (!user) return { can: false };

    // 2. Welche Rolle hat er?
    const { data: profile } = await supabaseBrowserClient
      .schema("account")
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = profile?.role || "User";

    // 3. Regeln definieren
    
    // Regel A: Nur Admins dürfen auf "admin_users" zugreifen
    if (resource === "admin_users") {
      if (role === "Admin") return { can: true };
      return { can: false, reason: "Nur für Administratoren" };
    }

    // Regel B: Alle anderen Ressourcen sind (erstmal) offen
    return { can: true };
  },
};