import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Nickname given at sign-up (falls back to Google name, then email prefix). */
export const useDisplayName = () => {
  const [name, setName] = useState<string>("");
  useEffect(() => {
    const pick = (u: { email?: string; user_metadata?: Record<string, unknown> } | null | undefined) => {
      if (!u) return setName("");
      const m = u.user_metadata || {};
      const n = (m.name || m.full_name || m.nickname || u.email?.split("@")[0] || "") as string;
      setName(n.trim().split(" ")[0] ? n.trim() : "");
    };
    supabase.auth.getSession().then(({ data }) => pick(data.session?.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => pick(s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);
  return name;
};
