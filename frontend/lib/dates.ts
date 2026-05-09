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

const FR_MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

const FR_DAYS_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const FR_DAYS_LONG = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export const formatDateLong = (d: Date) => {
  const dayIdx = (d.getDay() + 6) % 7;
  return `${FR_DAYS_LONG[dayIdx]} ${d.getDate()} ${FR_MONTHS[d.getMonth()]}`;
};

export const formatMonthYear = (d: Date) =>
  `${FR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;

export const dayShort = (d: Date) => {
  const idx = (d.getDay() + 6) % 7;
  return FR_DAYS_SHORT[idx];
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const isToday = (d: Date) => isSameDay(d, new Date());
