'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { dict, Lang } from '@/lib/i18n';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  isAr: boolean;
}
const Ctx = createContext<LangCtx>({ lang: 'ar', setLang: () => {}, isAr: true });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('ar');
  useEffect(() => {
    const url = new URL(window.location.href);
    const p = url.searchParams.get('lang');
    const stored = window.localStorage.getItem('rehlaty-lang');
    const initial: Lang = p === 'en' || p === 'ar' ? p : stored === 'en' || stored === 'ar' ? (stored as Lang) : 'ar';
    setLangState(initial);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    window.localStorage.setItem('rehlaty-lang', lang);
  }, [lang]);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', l);
    window.history.replaceState(null, '', url.toString());
  }, []);
  return <Ctx.Provider value={{ lang, setLang, isAr: lang === 'ar' }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);
export const useDict = () => {
  const { lang } = useLang();
  return dict;
};
export { dict };
export type { Lang };
