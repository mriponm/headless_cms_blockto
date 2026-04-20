export const LANGUAGES = [
  { code: "en", name: "English",    native: "English",    flag: "🇬🇧" },
  { code: "nl", name: "Dutch",      native: "Nederlands", flag: "🇳🇱" },
  { code: "de", name: "German",     native: "Deutsch",    flag: "🇩🇪" },
  { code: "fr", name: "French",     native: "Français",   flag: "🇫🇷" },
  { code: "es", name: "Spanish",    native: "Español",    flag: "🇪🇸" },
  { code: "pt", name: "Portuguese", native: "Português",  flag: "🇵🇹" },
  { code: "ru", name: "Russian",    native: "Русский",    flag: "🇷🇺" },
  { code: "zh", name: "Chinese",    native: "中文",        flag: "🇨🇳" },
  { code: "ja", name: "Japanese",   native: "日本語",      flag: "🇯🇵" },
  { code: "ko", name: "Korean",     native: "한국어",      flag: "🇰🇷" },
  { code: "ar", name: "Arabic",     native: "العربية",    flag: "🇸🇦" },
  { code: "tr", name: "Turkish",    native: "Türkçe",     flag: "🇹🇷" },
  { code: "hi", name: "Hindi",      native: "हिन्दी",      flag: "🇮🇳" },
  { code: "id", name: "Indonesian", native: "Bahasa",     flag: "🇮🇩" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt", flag: "🇻🇳" },
] as const;

export type LangCode = typeof LANGUAGES[number]["code"];
