import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

export function usePendingErrors() {
  const [count, setCount] = useState(0);

  const fetchCount = async () => {
    try {
      const { count: total, error } = await db
        .from("system_errors")
        .select("*", { count: "exact", head: true })
        .eq("resolved", false);

      if (!error && typeof total === "number") setCount(total);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchCount();

    const channel = supabase
      .channel("pending-errors-watch")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "system_errors" },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return count;
}
