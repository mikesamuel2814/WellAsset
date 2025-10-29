import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  keywords?: string;
  structuredData?: object;
}

export function SEOHead({
  title,
  description,
  ogImage = "/default-og-image.jpg",
  ogType = "website",
  canonicalUrl,
  keywords,
  structuredData,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = `${title} | Well Asset Development Co., Ltd`;

    const metaTags: { [key: string]: string } = {
      description,
      "og:title": title,
      "og:description": description,
      "og:image": ogImage,
      "og:type": ogType,
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": ogImage,
    };

    if (keywords) {
      metaTags.keywords = keywords;
    }

    Object.entries(metaTags).forEach(([name, content]) => {
      let meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        if (name.startsWith("og:") || name.startsWith("twitter:")) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.content = content;
    });

    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonicalUrl;
    }

    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [title, description, ogImage, ogType, canonicalUrl, keywords, structuredData]);

  return null;
}
