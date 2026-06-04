import { ui, defaultLang } from "./ui";

export function getLangFromUrl(url: URL) {
  const segments = url.pathname.split("/");
  for (const segment of segments) {
    if (segment in ui) return segment as keyof typeof ui;
  }
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
