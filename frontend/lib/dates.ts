export const pad = (n: number) => n.toString().padStart(2, "0");

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const fromISODate = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

export const startOfWeek = (d: Date) => {
  const r = new Date(d);
  const day = r.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday-first
  r.setDate(r.getDate() + diff);
  r.setHours(0, 0, 0, 0);
  return r;
};

export const startOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), 1);

export const endOfMonth = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth() + 1, 0);

type Lang = "en" | "fr" | "it" | "de";

const MONTHS: Record<Lang, string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
  it: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
};

const DAYS_SHORT: Record<Lang, string[]> = {
  en: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  fr: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
  it: ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"],
  de: ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"],
};

const DAYS_LONG: Record<Lang, string[]> = {
  en: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
  fr: ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"],
  it: ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"],
  de: ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"],
};

export const formatDateLong = (d: Date, lang: Lang = "en") => {
  const dayIdx = (d.getDay() + 6) % 7;
  const day = DAYS_LONG[lang][dayIdx];
  const month = MONTHS[lang][d.getMonth()];
  if (lang === "en") return `${day}, ${month} ${d.getDate()}`;
  if (lang === "de") return `${day}, ${d.getDate()}. ${month}`;
  return `${day} ${d.getDate()} ${month}`;
};

export const formatMonthYear = (d: Date, lang: Lang = "en") =>
  `${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}`;

export const dayShort = (d: Date, lang: Lang = "en") => {
  const idx = (d.getDay() + 6) % 7;
  return DAYS_SHORT[lang][idx];
};

export const monthName = (d: Date, lang: Lang = "en") => MONTHS[lang][d.getMonth()];

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isToday = (d: Date) => isSameDay(d, new Date());
