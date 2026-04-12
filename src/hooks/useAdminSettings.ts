import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { logSettingsChanges } from "@/lib/auditLog";

export function useAdminSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [originalSettings, setOriginalSettings] = useState<Record<string, string>>({});
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("site_settings" as any)
        .select("key, value")
        .eq("environment", "draft");
      if (data) {
        const map: Record<string, string> = {};
        (data as any[]).forEach((r: any) => { map[r.key] = r.value; });
        setSettings(map);
        setOriginalSettings({ ...map });
      }
      setFetching(false);
    };
    fetchData();
  }, []);

  const updateField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveKeys = async (keys: string[], successMsg = "Salvo com sucesso!", section?: string) => {
    setSaving(true);
    const payload = keys
      .filter(k => settings[k] !== undefined)
      .map(key => ({ key, value: settings[key], environment: "draft", updated_at: new Date().toISOString() }));

    if (payload.length > 0) {
      const { error } = await supabase.from("site_settings" as any).upsert(payload as any, { onConflict: "key,environment" });
      if (error) {
        toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
        setSaving(false);
        return false;
      }

      // Log changes to audit
      if (section) {
        const changes = keys
          .filter(k => settings[k] !== undefined)
          .map(k => ({
            key: k,
            oldValue: originalSettings[k] ?? "",
            newValue: settings[k] ?? "",
          }));
        await logSettingsChanges(section, changes);
      }

      // Update original snapshot
      const updated = { ...originalSettings };
      keys.forEach(k => { if (settings[k] !== undefined) updated[k] = settings[k]; });
      setOriginalSettings(updated);
    }
    toast({ title: successMsg, description: "As alterações foram salvas no rascunho. Publique quando estiver pronto." });
    setSaving(false);
    return true;
  };

  return { settings, fetching, saving, updateField, saveKeys, setSettings };
}
