import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin");
      
      if (data && data.length > 0) {
        setIsAdmin(true);
      } else {
        navigate("/admin/login");
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setIsAdmin(false);
        setLoading(false);
        navigate("/admin/login");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkAdmin(session.user.id);
      } else {
        setLoading(false);
        navigate("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return { loading, isAdmin, signOut };
};
