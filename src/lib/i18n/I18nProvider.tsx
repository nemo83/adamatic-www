/**
 * Hand-rolled i18n. Loads JSON message files synchronously (bundled at
 * build time) and exposes a `useTranslations()` hook with `{key}` token
 * interpolation. Persists the chosen locale to localStorage; falls back
 * to the closest browser language on first visit.
 */
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import en from "../../../messages/en.json";
import fr from "../../../messages/fr.json";
import es from "../../../messages/es.json";
import it from "../../../messages/it.json";
import ja from "../../../messages/ja.json";

export const SUPPORTED_LOCALES = ["en", "fr", "es", "it", "ja"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
const STORAGE_KEY = "adamatic.locale";

type Messages = typeof en;
const MESSAGES: Record<Locale, Messages> = {
    en,
    fr,
    es,
    it,
    ja: ja as unknown as Messages,
};

interface I18nValue {
    locale: Locale;
    setLocale(locale: Locale): void;
    /** Look up a dotted path; falls back to English then to the literal key. */
    t(key: string, vars?: Record<string, string | number>): string;
}

const Ctx = createContext<I18nValue | null>(null);

function lookup(messages: unknown, dotted: string): string | undefined {
    let cursor: unknown = messages;
    for (const part of dotted.split(".")) {
        if (cursor && typeof cursor === "object" && part in cursor) {
            cursor = (cursor as Record<string, unknown>)[part];
        } else {
            return undefined;
        }
    }
    return typeof cursor === "string" ? cursor : undefined;
}

function interpolate(template: string, vars?: Record<string, string | number>): string {
    if (!vars) return template;
    return template.replace(/\{(\w+)\}/g, (m, k) =>
        Object.prototype.hasOwnProperty.call(vars, k) ? String(vars[k]) : m,
    );
}

function detectInitialLocale(): Locale {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (SUPPORTED_LOCALES as readonly string[]).includes(stored)) {
        return stored as Locale;
    }
    const nav = window.navigator?.language?.slice(0, 2).toLowerCase();
    if (nav && (SUPPORTED_LOCALES as readonly string[]).includes(nav)) {
        return nav as Locale;
    }
    return DEFAULT_LOCALE;
}

export const I18nProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    // SSR-safe: server renders English, client hydrates to the persisted/detected locale.
    const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

    useEffect(() => {
        setLocaleState(detectInitialLocale());
    }, []);

    const setLocale = useCallback((next: Locale) => {
        setLocaleState(next);
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, next);
        }
    }, []);

    const t = useCallback(
        (key: string, vars?: Record<string, string | number>) => {
            const hit =
                lookup(MESSAGES[locale], key) ??
                lookup(MESSAGES.en, key) ??
                key;
            return interpolate(hit, vars);
        },
        [locale],
    );

    const value = useMemo<I18nValue>(
        () => ({ locale, setLocale, t }),
        [locale, setLocale, t],
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useI18n(): I18nValue {
    const v = useContext(Ctx);
    if (!v) throw new Error("useI18n must be used inside <I18nProvider>");
    return v;
}

/** Shorthand — most call sites only need `t`. */
export function useTranslations() {
    return useI18n().t;
}
