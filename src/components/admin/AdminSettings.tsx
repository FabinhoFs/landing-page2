import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Settings, Globe, Trash2, ExternalLink } from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";

export const AdminSettings = () => {
  const { settings, fetching, saving, updateField, saveKeys } = useAdminSettings();

  if (fetching) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  const faviconUrl = settings["favicon_url"] || "";

  const handleSaveFavicon = async () => {
    await saveKeys(["favicon_url"], "Favicon salvo com sucesso!");
  };

  const handleRemoveFavicon = () => {
    updateField("favicon_url", "");
  };

  return (
    <div className="space-y-6">
      {/* Favicon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5 text-primary" />
            Favicon do Site
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O favicon é o ícone pequeno que aparece na aba do navegador. Insira a URL de uma imagem (.png, .ico ou .svg).
          </p>

          <div className="space-y-2">
            <Label htmlFor="favicon_url">URL do Favicon</Label>
            <Input
              id="favicon_url"
              placeholder="https://exemplo.com/favicon.png"
              value={faviconUrl}
              onChange={(e) => updateField("favicon_url", e.target.value)}
            />
          </div>

          {/* Preview */}
          {faviconUrl && (
            <div className="flex items-center gap-4 rounded-md border border-border bg-muted/30 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-background">
                <img
                  src={faviconUrl}
                  alt="Preview do favicon"
                  className="h-8 w-8 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-foreground">Preview atual</p>
                <a
                  href={faviconUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate max-w-xs"
                >
                  {faviconUrl} <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button onClick={handleSaveFavicon} disabled={saving} size="sm">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Favicon
            </Button>
            {faviconUrl && (
              <Button variant="outline" size="sm" onClick={handleRemoveFavicon}>
                <Trash2 className="mr-2 h-4 w-4" /> Remover
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for other global settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-5 w-5 text-primary" />
            Outras Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">As opções de badge foram movidas para a aba Ofertas.</p>
        </CardContent>
      </Card>
    </div>
  );
};
