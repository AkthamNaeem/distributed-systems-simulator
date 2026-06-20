"use client";

import {
  Children,
  cloneElement,
  createContext,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { translateToArabic } from "@/lib/translations";

export type Language = "en" | "ar";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (text: string) => string;
  localize: (node: ReactNode) => ReactNode;
};

const STORAGE_KEY = "ds-simulator-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);
const translatedProps = new Set([
  "aria-label",
  "detail",
  "explanation",
  "label",
  "linkLabel",
  "name",
  "proof",
  "subtitle",
  "title",
]);
const originalText = new WeakMap<Text, string>();

function translateValue(value: unknown): unknown {
  if (typeof value === "string") return translateToArabic(value);
  if (Array.isArray(value)) return value.map(translateValue);
  if (value && typeof value === "object" && !isValidElement(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, translateValue(item)]),
    );
  }
  return value;
}

function localizeNode(node: ReactNode): ReactNode {
  if (typeof node === "string") return translateToArabic(node);
  if (!isValidElement(node)) return node;

  const element = node as ReactElement<Record<string, unknown>>;
  const props: Record<string, unknown> = {};

  for (const name of translatedProps) {
    if (name in element.props) props[name] = translateValue(element.props[name]);
  }
  if ("guide" in element.props) props.guide = translateValue(element.props.guide);
  if ("children" in element.props) {
    props.children = Children.map(element.props.children as ReactNode, localizeNode);
  }

  return cloneElement(element, props);
}

function selectLanguage(nextLanguage: Language) {
  localStorage.setItem(STORAGE_KEY, nextLanguage);
  document.documentElement.lang = nextLanguage;
  document.documentElement.dir = nextLanguage === "ar" ? "rtl" : "ltr";
  window.dispatchEvent(new Event("languagechange"));
}

function getLanguage(): Language {
  return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "en";
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("languagechange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("languagechange", callback);
  };
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getLanguage,
    (): Language => "en",
  );

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage: selectLanguage,
    t: (text) => language === "ar" ? translateToArabic(text) : text,
    localize: (node) => language === "ar" ? localizeNode(node) : node,
  }), [language]);

  useEffect(() => {
    function updateNode(node: Text) {
      if (language === "ar") {
        const source = originalText.get(node) ?? node.data;
        const translated = translateToArabic(source);
        if (translated !== source) {
          originalText.set(node, source);
          if (node.data !== translated) node.data = translated;
        }
      } else {
        const source = originalText.get(node);
        if (source && node.data !== source) node.data = source;
      }
    }

    function updateText(root: Node) {
      if (root.nodeType === Node.TEXT_NODE) {
        updateNode(root as Text);
        return;
      }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode() as Text | null;
      while (node) {
        updateNode(node);
        node = walker.nextNode() as Text | null;
      }
    }

    updateText(document.body);
    if (language === "en") return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") updateText(mutation.target);
        mutation.addedNodes.forEach(updateText);
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
