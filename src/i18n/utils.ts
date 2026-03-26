import { ui, defaultLang } from "./ui";

export function getLangFromUrl(url: URL) {
  const urlSplit = url.pathname.split("/");
  const lang = urlSplit[urlSplit.length - 1];
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}
