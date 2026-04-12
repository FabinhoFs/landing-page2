import { useEffect } from "react";
import { useCtaMessages } from "@/hooks/useCtaMessages";

/**
 * Applies SEO meta tags from site_settings to the document <head>.
 * Keys: seo_title, seo_description, seo_og_image, seo_og_title, seo_og_description, seo_canonical
 */
export function useSeoSettings() {
  const { settings, isLoading } = useCtaMessages();

  useEffect(() => {
    if (isLoading) return;

    // OG Image
    const ogImage = settings["seo_og_image"];
    if (ogImage) {
      setMeta("og:image", ogImage);
      setMeta("twitter:image", ogImage);
    }

    // OG Title
    const ogTitle = settings["seo_og_title"] || settings["seo_title"];
    if (ogTitle) {
      setMeta("og:title", ogTitle);
      setMeta("twitter:title", ogTitle);
    }

    // OG Description (separate field, falls back to seo_description)
    const ogDesc = settings["seo_og_description"] || settings["seo_description"];
    if (ogDesc) {
      setMeta("og:description", ogDesc);
      setMeta("twitter:description", ogDesc);
    }

    // Meta description
    const desc = settings["seo_description"];
    if (desc) {
      setMetaName("description", desc);
    }

    // Canonical
    const canonical = settings["seo_canonical"];
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
      setMeta("og:url", canonical);
    }

    // Twitter card type
    setMeta("twitter:card", "summary_large_image");
    setMeta("og:type", "website");
  }, [settings, isLoading]);
}

function setMeta(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}
