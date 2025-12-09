"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@utils/supabase/client";

export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (error) {
      return {
        success: false,
        error,
      };
    }

    if (data?.session) {
      await supabaseBrowserClient.auth.setSession(data.session);

      return {
        success: true,
        redirectTo: "/",
      };
    }

    // for third-party login
    return {
      success: false,
      error: {
        name: "LoginError",
        message: "Invalid username or password",
      },
    };
  },
  logout: async () => {
    const { error } = await supabaseBrowserClient.auth.signOut();

    if (error) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: true,
      redirectTo: "/login",
    };
  },
  register: async ({ email, password }) => {
    try {
      const { data, error } = await supabaseBrowserClient.auth.signUp({
        email,
        password,
      });

      if (error) {
        return {
          success: false,
          error,
        };
      }

      if (data) {
        return {
          success: true,
          redirectTo: "/",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error,
      };
    }

    return {
      success: false,
      error: {
        message: "Register failed",
        name: "Invalid email or password",
      },
    };
  },
  check: async () => {
    const { data, error } = await supabaseBrowserClient.auth.getUser();
    const { user } = data;

    if (error) {
      return {
        authenticated: false,
        redirectTo: "/login",
        logout: true,
      };
    }

    if (user) {
      return {
        authenticated: true,
      };
    }

    return {
      authenticated: false,
      redirectTo: "/login",
    };
  },
  getPermissions: async () => {
    const user = await supabaseBrowserClient.auth.getUser();

    if (user) {
      return user.data.user?.role;
    }

    return null;
  },
  getIdentity: async () => {
    const { data } = await supabaseBrowserClient.auth.getUser();

    if (data?.user) {
      return {
        ...data.user,
        name: data.user.email,
      };
    }

    return null;
  },
  onError: async (error) => {
    if (error?.code === "PGRST301" || error?.code === 401) {
      return {
        logout: true,
      };
    }

    return { error };
  },

// Damit der Header weiß, wer eingeloggt ist (Name, Avatar, Email), müssen wir dem authProvider die Methode getIdentity hinzufügen.

getIdentity: async () => {
    // 1. Hole den eingeloggten User aus der Auth-Session
    const { data: { user } } = await supabaseBrowserClient.auth.getUser();

    if (!user) return null;

    // 2. Hole das Profil aus deiner Tabelle 'profiles'
    // WICHTIG: Falls deine Tabelle in einem Schema wie 'account' liegt, 
    // stelle sicher, dass der Supabase Client Zugriff darauf hat oder die Tabelle im public schema gespiegelt ist.
  const { data: profile } = await supabaseBrowserClient
      .schema("account")
      .from("profiles") 
      .select("avatar, name") // Passe die Spaltennamen an deine DB an
      .eq("id", user.id)
      .single();

    // 3. Avatar URL bauen
    let avatarUrl = user.user_metadata?.avatar_url; // Fallback: Google/GitHub Bild

    if (profile?.avatar) {
      // Fall A: In der DB steht schon eine volle URL (https://...)
      if (profile.avatar.startsWith("http")) {
        avatarUrl = profile.avatar;
      } 
      // Fall B: In der DB steht nur der Dateipfad (z.B. "user_123.jpg")
      else {
        // Hier musst du den Namen deines Storage Buckets wissen (z.B. 'avatars')
        const { data } = supabaseBrowserClient
          .storage
          .from("avatars") 
          .getPublicUrl(profile.avatar);
          
        avatarUrl = data.publicUrl;
      }
    }

    // 4. Rückgabe an Refine (und damit an den Header)
    return {
      id: user.id,
      name: profile?.name || user.email, // Name aus Profil oder Email als Fallback
      avatar: avatarUrl,
      email: user.email,
    };
  },
};
