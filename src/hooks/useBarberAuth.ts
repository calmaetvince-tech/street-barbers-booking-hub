import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type BarberRecord = { id: string; name: string; location_id: string };

export const useBarberAuth = () => {
  const [loading, setLoading] = useState(true);
  const [barber, setBarber] = useState<BarberRecord | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkBarber = async (userId: string) => {
      const { data } = await supabase
        .from("barbers")
        .select("id,name,location_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setBarber(data);
      } else {
        navigate("/barber/login");
      }
      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        checkBarber(session.user.id);
      } else {
        setBarber(null);
        setLoading(false);
        navigate("/barber/login");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        checkBarber(session.user.id);
      } else {
        setLoading(false);
        navigate("/barber/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/barber/login");
  };

  return { loading, barber, signOut };
};
