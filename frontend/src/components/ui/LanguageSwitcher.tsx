import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Globe, Check } from "lucide-react";

const languages = [
  { code: "en", label: "English", flag: "EN" },
  { code: "fr", label: "Francais", flag: "FR" },
  { code: "es", label: "Espanol", flag: "ES" },
  { code: "de", label: "Deutsch", flag: "DE" },
  { code: "it", label: "Italiano", flag: "IT" },
  { code: "pt", label: "Portugues", flag: "PT" },
  { code: "rw", label: "Kinyarwanda", flag: "RW" },
  { code: "sw", label: "Kiswahili", flag: "SW" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = languages.find((l) => l.code === i18n.language) || languages[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-2 text-utv-body hover:text-utv-gold transition-colors"
        title="Change language"
      >
        <Globe className="w-5 h-5" />
        <span className="text-xs font-medium hidden sm:inline">{current.flag}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-utv-bg-light border border-utv-border rounded-lg shadow-xl z-50 py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                i18n.changeLanguage(lang.code);
                localStorage.setItem("utv_lang", lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                i18n.language === lang.code
                  ? "text-utv-gold bg-utv-border/50"
                  : "text-utv-body hover:text-utv-cream hover:bg-utv-border"
              }`}
            >
              <span>{lang.label}</span>
              {i18n.language === lang.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
