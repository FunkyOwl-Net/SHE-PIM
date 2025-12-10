"use server";

import { createClient } from "@supabase/supabase-js";

export async function deleteUser(userId: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Löscht den User aus auth.users (Cascade löscht automatisch das Profil mit!)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Benutzer gelöscht" };
}

export async function createNewUser(formData: any) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { email, password, name, surname, role } = formData;

  // 1. User in Supabase Auth erstellen
  // Wir packen Namen & Rolle in die Metadaten, damit unser DB-Trigger sie findet!
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Email direkt bestätigen, damit Login sofort geht
    user_metadata: {
      firstName: name,    // Wichtig: Muss zum Trigger passen
      lastName: surname,  // Wichtig: Muss zum Trigger passen
      role: role
    }
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "Benutzer erfolgreich erstellt" };
}