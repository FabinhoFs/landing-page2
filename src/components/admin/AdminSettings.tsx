import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Loader2, Settings, Globe, Trash2, ExternalLink, Search, Image, Link2 } from "lucide-react";
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

  const seoKeys = ["seo_title", "seo_description", "seo_og_image", "seo_og_title", "seo_canonical"];

  const handleSaveSeo = async () => {
    await saveKeys(seoKeys, "Configurações de SEO salvas com sucesso!");
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

      {/* SEO & Compartilhamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-5 w-5 text-primary" />
            SEO e Compartilhamento
          </CardTitle>
          <CardDescription>
            Configure como sua página aparece no Google, WhatsApp e redes sociais.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* SEO Title */}
          <div className="space-y-2">
            <Label htmlFor="seo_title">Título da Página (title tag)</Label>
            <Input
              id="seo_title"
              placeholder="Certificado Digital Online - Agis Digital"
              value={settings["seo_title"] || ""}
              onChange={(e) => updateField("seo_title", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Aparece na aba do navegador e nos resultados do Google. Ideal: 50-60 caracteres.
            </p>
          </div>

          {/* Meta Description */}
          <div className="space-y-2">
            <Label htmlFor="seo_description">Meta Description</Label>
            <Textarea
              id="seo_description"
              placeholder="Emita seu Certificado Digital 100% online com a Agis Digital..."
              value={settings["seo_description"] || ""}
              onChange={(e) => updateField("seo_description", e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Texto que aparece abaixo do título no Google. Ideal: 120-160 caracteres.
              {settings["seo_description"] && (
                <span className="ml-1 font-medium">
                  ({settings["seo_description"].length} caracteres)
                </span>
              )}
            </p>
          </div>

          {/* OG Title */}
          <div className="space-y-2">
            <Label htmlFor="seo_og_title" className="flex items-center gap-2">
              <span>Título de Compartilhamento</span>
            </Label>
            <Input
              id="seo_og_title"
              placeholder="Certificado Digital rápido e seguro — Agis Digital"
              value={settings["seo_og_title"] || ""}
              onChange={(e) => updateField("seo_og_title", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Título exibido ao compartilhar no WhatsApp, Facebook e LinkedIn.
            </p>
          </div>

          {/* OG Image */}
          <div className="space-y-2">
            <Label htmlFor="seo_og_image" className="flex items-center gap-2">
              <Image className="h-4 w-4 text-muted-foreground" />
              <span>Imagem de Compartilhamento (OG Image)</span>
            </Label>
            <Input
              id="seo_og_image"
              placeholder="https://exemplo.com/imagem-compartilhamento.png"
              value={settings["seo_og_image"] || ""}
              onChange={(e) => updateField("seo_og_image", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Imagem exibida ao compartilhar o link. Tamanho ideal: 1200×630px.
            </p>
            {settings["seo_og_image"] && (
              <div className="rounded-md border border-border bg-muted/30 p-3">
                <img
                  src={settings["seo_og_image"]}
                  alt="Preview OG Image"
                  className="max-h-40 rounded object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </div>

          {/* Canonical */}
          <div className="space-y-2">
            <Label htmlFor="seo_canonical" className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-muted-foreground" />
              <span>URL Canônica</span>
            </Label>
            <Input
              id="seo_canonical"
              placeholder="https://www.agisdigital.com"
              value={settings["seo_canonical"] || ""}
              onChange={(e) => updateField("seo_canonical", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              URL principal do site. Evita conteúdo duplicado no Google.
            </p>
          </div>

          <Button onClick={handleSaveSeo} disabled={saving} size="sm">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar SEO
          </Button>
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
