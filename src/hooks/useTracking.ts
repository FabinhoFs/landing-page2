import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TrackingConfig {
  g_tag_id: string;
  g_ads_purchase_label: string;
  meta_pixel_id: string;
  g_tag_manager_id: string;
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
    fbq: (...args: any[]) => void;
  }
}

let loaded = false;

function injectScript(src: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

function injectInlineScript(code: string, id: string) {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.textContent = code;
  document.head.appendChild(s);
}

function injectGtag(gTagId: string) {
  injectScript(`https://www.googletagmanager.com/gtag/js?id=${gTagId}`, "gtag-script");
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", gTagId);
}

function injectGTM(gtmId: string) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
  injectScript(`https://www.googletagmanager.com/gtm.js?id=${gtmId}`, "gtm-script");

  if (!document.getElementById("gtm-noscript")) {
    const ns = document.createElement("noscript");
    ns.id = "gtm-noscript";
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    ns.appendChild(iframe);
    document.body.prepend(ns);
  }
}

function injectMetaPixel(pixelId: string) {
  const code = `
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init','${pixelId}');fbq('track','PageView');
  `;
  injectInlineScript(code, "meta-pixel-script");
}

export function useTracking() {
  const configRef = useRef<TrackingConfig | null>(null);

  useEffect(() => {
    if (loaded) return;
    loaded = true;

    // Defer tracking scripts so they don't compete with LCP / hero paint
    const bootstrap = () => {
      (async () => {
        const { data } = await supabase
          .from("site_settings" as any)
          .select("key, value")
          .eq("environment", "published")
          .in("key", ["g_tag_id", "g_ads_purchase_label", "meta_pixel_id", "g_tag_manager_id"]);

        const cfg: TrackingConfig = {
          g_tag_id: "",
          g_ads_purchase_label: "",
          meta_pixel_id: "",
          g_tag_manager_id: "",
        };
        (data as any[])?.forEach((r: any) => {
          if (r.key in cfg) (cfg as any)[r.key] = r.value;
        });
        configRef.current = cfg;

        if (cfg.g_tag_id) injectGtag(cfg.g_tag_id);
        if (cfg.g_tag_manager_id) injectGTM(cfg.g_tag_manager_id);
        if (cfg.meta_pixel_id) injectMetaPixel(cfg.meta_pixel_id);
      })();
    };

    // Use requestIdleCallback where available, else setTimeout 2s
    if ("requestIdleCallback" in window) {
      (window as any).requestIdleCallback(bootstrap, { timeout: 3000 });
    } else {
      setTimeout(bootstrap, 2000);
    }
  }, []);

  const trackPurchase = useCallback((value: number, productName: string) => {
    const cfg = configRef.current;
    if (!cfg) return;

    if (cfg.g_tag_id && cfg.g_ads_purchase_label && window.gtag) {
      window.gtag("event", "conversion", {
        send_to: `${cfg.g_tag_id}/${cfg.g_ads_purchase_label}`,
        value,
        currency: "BRL",
        transaction_id: `${Date.now()}`,
      });
    }

    if (cfg.meta_pixel_id && window.fbq) {
      window.fbq("track", "Purchase", { value, currency: "BRL", content_name: productName });
    }
  }, []);

  return { trackPurchase };
}
