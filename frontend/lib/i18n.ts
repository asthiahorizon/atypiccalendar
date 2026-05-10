import { getLocales } from "expo-localization";

export type Lang = "en" | "fr" | "it" | "de";

const detectLang = (): Lang => {
  try {
    const locales = getLocales();
    const code = locales?.[0]?.languageCode?.toLowerCase();
    if (code === "fr" || code === "it" || code === "de") return code;
  } catch {}
  return "en";
};

export const lang: Lang = detectLang();

type Dict = {
  // Onboarding
  brand: string;
  onboarding_title: string;
  onboarding_subtitle: string;
  pillar_cog: string;
  pillar_cog_desc: string;
  pillar_soc: string;
  pillar_soc_desc: string;
  pillar_sen: string;
  pillar_sen_desc: string;
  cta_start: string;
  cta_no_account: string;

  // Tabs
  tab_calendar: string;
  tab_stats: string;
  tab_settings: string;

  // Calendar
  today: string;
  day_label: string;
  view_day: string;
  view_week: string;
  view_month: string;
  donut_cog: string;
  donut_soc: string;
  donut_sen: string;
  fatigue_label: string;
  fatigue_low: string;
  fatigue_med: string;
  fatigue_high: string;
  fatigue_avg_score: string;
  suggestions_title: string;
  events_title: string;
  empty_title: string;
  empty_sub: string;
  week_view_title: string;
  month_view_title: string;
  events_count_one: string;
  events_count_other: string;
  energy_short: string;

  // Suggestions
  sugg_cog: string;
  sugg_soc: string;
  sugg_sen: string;
  sugg_pause: string;
  sugg_resource: string;
  sugg_calm: string;

  // Event modal
  new_event: string;
  field_title: string;
  field_title_placeholder: string;
  field_type: string;
  type_task: string;
  type_task_desc: string;
  type_resource: string;
  type_resource_desc: string;
  field_time: string;
  field_duration: string;
  duration_unit: string;
  field_impact: string;
  field_impact_sub_task: string;
  field_impact_sub_resource: string;
  cta_save: string;
  err_title_missing_t: string;
  err_title_missing_m: string;
  err_time_invalid_t: string;
  err_time_invalid_m: string;
  err_capacity_t: string;
  err_capacity_m: string;
  err_unexpected: string;
  err_cant_add: string;

  // Stats
  stats_eyebrow: string;
  stats_title: string;
  stats_subtitle: string;
  range_7: string;
  range_30: string;
  kpi_avg_fatigue: string;
  kpi_overload: string;
  kpi_events: string;
  kpi_remaining: string;
  this_week: string;
  this_month: string;
  avg_label: string;
  avg_reserves: string;
  fatigue_trend: string;
  fatigue_trend_sub: string;
  energy_balance: string;
  energy_balance_sub: string;

  // Settings
  settings_eyebrow: string;
  settings_title: string;
  reserves_section: string;
  res_cog_desc: string;
  res_soc_desc: string;
  res_sen_desc: string;
  app_section: string;
  setting_theme: string;
  setting_theme_value: string;
  setting_language: string;
  setting_notifications: string;
  setting_notifications_value: string;
  setting_about: string;
  about_title: string;
  about_body: string;
  care_section: string;
  setting_engagement: string;
  engagement_title: string;
  engagement_body: string;
  setting_clear: string;
  clear_title: string;
  clear_body: string;
  footer: string;

  // Common
  cancel: string;
  ok: string;
  understood: string;
  delete_event_title: string;
  delete_event_body: string;
  delete: string;
  language_name: string;

  edit_event: string;
  save_changes: string;
  delete_event_btn: string;

  notif_toggle_desc: string;
  notif_perm_denied_t: string;
  notif_perm_denied_m: string;
};

const en: Dict = {
  brand: "ATYPIC CALENDAR",
  onboarding_title: "A calendar\ndesigned for your\nenergy.",
  onboarding_subtitle:
    "Track your cognitive, social and sensory reserves. Build your days with kindness.",
  pillar_cog: "Cognitive",
  pillar_cog_desc: "Focus, decisions",
  pillar_soc: "Social",
  pillar_soc_desc: "Interactions, presence",
  pillar_sen: "Sensory",
  pillar_sen_desc: "Noise, light, motion",
  cta_start: "Get started",
  cta_no_account: "No account required",

  tab_calendar: "Calendar",
  tab_stats: "Statistics",
  tab_settings: "Settings",

  today: "Today",
  day_label: "Day",
  view_day: "Day",
  view_week: "Week",
  view_month: "Month",
  donut_cog: "Cognitive",
  donut_soc: "Social",
  donut_sen: "Sensory",
  fatigue_label: "Day state",
  fatigue_low: "Low fatigue",
  fatigue_med: "Moderate fatigue",
  fatigue_high: "High fatigue",
  fatigue_avg_score: "Average score",
  suggestions_title: "Gentle suggestions",
  events_title: "Events",
  empty_title: "No events today",
  empty_sub: "Add a task or resource to track your energy.",
  week_view_title: "Week overview",
  month_view_title: "Month overview",
  events_count_one: "event",
  events_count_other: "events",
  energy_short: "energy",

  sugg_cog: "Your cognitive reserve is low. A quiet pause could help.",
  sugg_soc: "Your social reserve is low. Choose some alone time tonight.",
  sugg_sen: "Your sensory reserve is low. Avoid loud environments.",
  sugg_pause: "Add a break between your appointments to breathe.",
  sugg_resource:
    "A resource activity (walk, nap, reading) could help.",
  sugg_calm: "Your day looks balanced. Take care of yourself.",

  new_event: "New event",
  field_title: "Title",
  field_title_placeholder: "Doctor",
  field_type: "Type",
  type_task: "Task",
  type_task_desc: "Decreases energy",
  type_resource: "Resource",
  type_resource_desc: "Restores energy",
  field_time: "Time",
  field_duration: "Duration",
  duration_unit: "min",
  field_impact: "Energy impact",
  field_impact_sub_task: "Slide to set the magnitude (0–75).",
  field_impact_sub_resource: "Slide to set the recharge (0–75).",
  cta_save: "Add event",
  err_title_missing_t: "Missing title",
  err_title_missing_m: "Please name your event.",
  err_time_invalid_t: "Invalid time",
  err_time_invalid_m: "Expected format: HH:MM (e.g. 09:30).",
  err_capacity_t: "Capacity exceeded",
  err_capacity_m: "This activity exceeds your current energy capacity.",
  err_unexpected: "Unexpected error.",
  err_cant_add: "Couldn't add",

  stats_eyebrow: "STATISTICS",
  stats_title: "Your balance",
  stats_subtitle: "A gentle reading of your recent days.",
  range_7: "7 days",
  range_30: "30 days",
  kpi_avg_fatigue: "Avg fatigue",
  kpi_overload: "Overload days",
  kpi_events: "Events",
  kpi_remaining: "Remaining energy",
  this_week: "this week",
  this_month: "this month",
  avg_label: "average",
  avg_reserves: "Average reserves",
  fatigue_trend: "Fatigue trend",
  fatigue_trend_sub: "Higher bar means more fatigue.",
  energy_balance: "Three energies balance",
  energy_balance_sub: "Your three reserves over the days.",

  settings_eyebrow: "SETTINGS",
  settings_title: "Your space",
  reserves_section: "Energy reserves",
  res_cog_desc: "Focus, decisions, mental load.",
  res_soc_desc: "Interactions, exchanges, presence of others.",
  res_sen_desc: "Noise, light, motion, stimulation.",
  app_section: "Application",
  setting_theme: "Theme",
  setting_theme_value: "Premium dark",
  setting_language: "Language",
  setting_notifications: "Notifications",
  setting_notifications_value: "Coming soon",
  setting_about: "About",
  about_title: "Atypic Calendar",
  about_body:
    "An energy calendar designed to respect your nervous system.\n\nVersion 1.0",
  care_section: "Care & kindness",
  setting_engagement: "Our commitment",
  engagement_title: "Our commitment",
  engagement_body:
    "We design this app to respect your nervous system. No aggressive notifications, no productivity score — just a gentle companion for your energy.",
  setting_clear: "Reset data",
  clear_title: "Reset",
  clear_body:
    "This feature will be available with an account. For now, you can delete events one by one from the calendar.",
  footer: "Atypic Calendar · With kindness · v1.0",

  cancel: "Cancel",
  ok: "OK",
  understood: "Got it",
  delete_event_title: "Delete this event?",
  delete_event_body: "This action is irreversible.",
  delete: "Delete",
  language_name: "English",
  edit_event: "Edit event",
  save_changes: "Save changes",
  delete_event_btn: "Delete event",
  notif_toggle_desc: "Daily morning reminder + 15 min before each event.",
  notif_perm_denied_t: "Permission denied",
  notif_perm_denied_m: "Allow notifications in your system settings to enable reminders.",
  paywall_eyebrow: "ATYPIC PREMIUM",
  paywall_title: "Unlock unlimited\ncalm planning.",
  paywall_subtitle: "Free includes 25 events. Premium removes the limit and adds more care.",
  paywall_feature_unlimited: "Unlimited events",
  paywall_feature_unlimited_desc: "No more 25-event cap. Plan as much as you need.",
  paywall_feature_notifications: "Smart reminders",
  paywall_feature_notifications_desc: "Daily morning and pre-event gentle nudges.",
  paywall_feature_stats: "Full statistics",
  paywall_feature_stats_desc: "30-day energy trends and balance charts.",
  paywall_feature_support: "Support a small team",
  paywall_feature_support_desc: "You help us keep the app calm and ad-free.",
  paywall_cta: "Continue",
  paywall_cta_loading: "Connecting…",
  paywall_price_fallback: "Monthly subscription",
  paywall_per_month: "/ month",
  paywall_restore: "Restore purchase",
  paywall_close: "Maybe later",
  paywall_terms:
    "Auto-renewable subscription. Cancel anytime in Settings → Apple ID. Renews monthly until cancelled.",
  paywall_unavailable_t: "Store unavailable",
  paywall_unavailable_m:
    "In-app purchases are only available in the App Store build of the app.",
  paywall_purchase_failed_t: "Purchase failed",
  paywall_purchase_failed_m: "Please try again later.",
  paywall_thanks_t: "Thank you",
  paywall_thanks_m: "Premium is now active. Enjoy unlimited planning.",
  paywall_restore_none_t: "Nothing to restore",
  paywall_restore_none_m: "No active subscription was found on this account.",
  limit_reached_t: "Free limit reached",
  limit_reached_m: "You've reached 25 events. Upgrade to Premium to keep planning.",
  limit_unlock: "Unlock unlimited events",
  limit_progress: "events used",
  premium_section: "Subscription",
  premium_active: "Premium active",
  premium_inactive: "Free plan",
  upgrade_cta: "Upgrade",
};

const fr: Dict = {
  brand: "ATYPIC CALENDAR",
  onboarding_title: "Un calendrier\npensé pour votre\nénergie.",
  onboarding_subtitle:
    "Suivez vos réserves cognitive, sociale et sensorielle. Construisez vos journées avec douceur.",
  pillar_cog: "Cognitif",
  pillar_cog_desc: "Concentration, décisions",
  pillar_soc: "Social",
  pillar_soc_desc: "Échanges, présence",
  pillar_sen: "Sensoriel",
  pillar_sen_desc: "Bruit, lumière, mouvement",
  cta_start: "Commencer",
  cta_no_account: "Aucune création de compte",

  tab_calendar: "Calendrier",
  tab_stats: "Statistiques",
  tab_settings: "Paramètres",

  today: "Aujourd'hui",
  day_label: "Journée",
  view_day: "Jour",
  view_week: "Semaine",
  view_month: "Mois",
  donut_cog: "Cognitif",
  donut_soc: "Social",
  donut_sen: "Sensoriel",
  fatigue_label: "État du jour",
  fatigue_low: "Fatigue faible",
  fatigue_med: "Fatigue modérée",
  fatigue_high: "Fatigue élevée",
  fatigue_avg_score: "Score moyen",
  suggestions_title: "Suggestions douces",
  events_title: "Événements",
  empty_title: "Aucun événement aujourd'hui",
  empty_sub: "Ajoutez une tâche ou une ressource pour suivre votre énergie.",
  week_view_title: "Vue semaine",
  month_view_title: "Vue mois",
  events_count_one: "événement",
  events_count_other: "événements",
  energy_short: "énergie",

  sugg_cog: "Votre réserve cognitive devient faible. Une pause silencieuse pourrait aider.",
  sugg_soc: "Votre réserve sociale devient faible. Privilégiez du temps seul ce soir.",
  sugg_sen: "Votre réserve sensorielle est basse. Évitez les environnements bruyants.",
  sugg_pause: "Ajoutez une pause entre vos rendez-vous pour respirer.",
  sugg_resource: "Une activité ressource (marche, sieste, lecture) pourrait vous aider.",
  sugg_calm: "Votre journée semble équilibrée. Prenez soin de vous.",

  new_event: "Nouvel événement",
  field_title: "Titre",
  field_title_placeholder: "Médecin",
  field_type: "Type",
  type_task: "Tâche",
  type_task_desc: "Diminue l'énergie",
  type_resource: "Ressource",
  type_resource_desc: "Recharge l'énergie",
  field_time: "Heure",
  field_duration: "Durée",
  duration_unit: "min",
  field_impact: "Impact énergétique",
  field_impact_sub_task: "Glissez pour ajuster l'intensité (0–75).",
  field_impact_sub_resource: "Glissez pour ajuster la recharge (0–75).",
  cta_save: "Ajouter l'événement",
  err_title_missing_t: "Titre manquant",
  err_title_missing_m: "Donnez un nom à votre événement.",
  err_time_invalid_t: "Heure invalide",
  err_time_invalid_m: "Format attendu : HH:MM (ex. 09:30).",
  err_capacity_t: "Capacité dépassée",
  err_capacity_m: "Cette activité dépasse votre capacité énergétique actuelle.",
  err_unexpected: "Erreur inattendue.",
  err_cant_add: "Impossible d'ajouter",

  stats_eyebrow: "STATISTIQUES",
  stats_title: "Votre équilibre",
  stats_subtitle: "Une lecture douce de vos dernières journées.",
  range_7: "7 jours",
  range_30: "30 jours",
  kpi_avg_fatigue: "Fatigue moyenne",
  kpi_overload: "Jours surcharge",
  kpi_events: "Événements",
  kpi_remaining: "Énergie restante",
  this_week: "cette semaine",
  this_month: "ce mois",
  avg_label: "moyenne",
  avg_reserves: "Réserves moyennes",
  fatigue_trend: "Tendance fatigue",
  fatigue_trend_sub: "Plus la barre est haute, plus la fatigue est forte.",
  energy_balance: "Équilibre des 3 énergies",
  energy_balance_sub: "Les 3 réserves au fil des jours.",

  settings_eyebrow: "PARAMÈTRES",
  settings_title: "Votre espace",
  reserves_section: "Réserves d'énergie",
  res_cog_desc: "Concentration, prise de décision, charge mentale.",
  res_soc_desc: "Interactions, échanges, présence des autres.",
  res_sen_desc: "Bruit, lumière, mouvement, stimulation.",
  app_section: "Application",
  setting_theme: "Thème",
  setting_theme_value: "Sombre premium",
  setting_language: "Langue",
  setting_notifications: "Notifications",
  setting_notifications_value: "Bientôt",
  setting_about: "À propos",
  about_title: "Atypic Calendar",
  about_body:
    "Un calendrier énergétique pensé pour respecter votre système nerveux.\n\nVersion 1.0",
  care_section: "Soin & douceur",
  setting_engagement: "Notre engagement",
  engagement_title: "Notre engagement",
  engagement_body:
    "Nous concevons cette application pour respecter votre système nerveux. Pas de notifications agressives, pas de score de productivité, juste un compagnon doux pour votre énergie.",
  setting_clear: "Réinitialiser les données",
  clear_title: "Réinitialiser",
  clear_body:
    "Cette fonctionnalité sera disponible avec un compte. Pour l'instant, vous pouvez supprimer vos événements un par un depuis le calendrier.",
  footer: "Atypic Calendar · Avec douceur · v1.0",

  cancel: "Annuler",
  ok: "OK",
  understood: "Compris",
  delete_event_title: "Supprimer cet événement ?",
  delete_event_body: "Cette action est irréversible.",
  delete: "Supprimer",
  language_name: "Français",
  edit_event: "Modifier l'événement",
  save_changes: "Enregistrer",
  delete_event_btn: "Supprimer l'événement",
  notif_toggle_desc: "Rappel matinal + 15 min avant chaque événement.",
  notif_perm_denied_t: "Permission refusée",
  notif_perm_denied_m: "Autorisez les notifications dans les paramètres système pour activer les rappels.",
  paywall_eyebrow: "ATYPIC PREMIUM",
  paywall_title: "Débloquez une\nplanification illimitée.",
  paywall_subtitle: "La version gratuite inclut 25 événements. Premium retire la limite et ajoute davantage de soin.",
  paywall_feature_unlimited: "Événements illimités",
  paywall_feature_unlimited_desc: "Plus de plafond à 25 événements. Planifiez autant que vous avez besoin.",
  paywall_feature_notifications: "Rappels intelligents",
  paywall_feature_notifications_desc: "Rappel matinal quotidien et avant chaque événement.",
  paywall_feature_stats: "Statistiques complètes",
  paywall_feature_stats_desc: "Tendances énergétiques sur 30 jours et équilibre détaillé.",
  paywall_feature_support: "Soutien d'une petite équipe",
  paywall_feature_support_desc: "Vous nous aidez à garder l'app douce et sans pub.",
  paywall_cta: "Continuer",
  paywall_cta_loading: "Connexion…",
  paywall_price_fallback: "Abonnement mensuel",
  paywall_per_month: "/ mois",
  paywall_restore: "Restaurer l'achat",
  paywall_close: "Plus tard",
  paywall_terms:
    "Abonnement auto-renouvelable. Annulable à tout moment dans Réglages → Identifiant Apple. Renouvellement mensuel jusqu'à annulation.",
  paywall_unavailable_t: "Boutique indisponible",
  paywall_unavailable_m:
    "Les achats intégrés ne sont disponibles que dans la version App Store de l'application.",
  paywall_purchase_failed_t: "Achat échoué",
  paywall_purchase_failed_m: "Veuillez réessayer plus tard.",
  paywall_thanks_t: "Merci",
  paywall_thanks_m: "Premium est désormais actif. Profitez d'une planification sans limite.",
  paywall_restore_none_t: "Rien à restaurer",
  paywall_restore_none_m: "Aucun abonnement actif n'a été trouvé sur ce compte.",
  limit_reached_t: "Limite gratuite atteinte",
  limit_reached_m: "Vous avez atteint 25 événements. Passez à Premium pour continuer à planifier.",
  limit_unlock: "Débloquer les événements illimités",
  limit_progress: "événements utilisés",
  premium_section: "Abonnement",
  premium_active: "Premium actif",
  premium_inactive: "Plan gratuit",
  upgrade_cta: "Passer à Premium",
};

const it: Dict = {
  brand: "ATYPIC CALENDAR",
  onboarding_title: "Un calendario\npensato per la tua\nenergia.",
  onboarding_subtitle:
    "Monitora le tue riserve cognitiva, sociale e sensoriale. Costruisci le tue giornate con dolcezza.",
  pillar_cog: "Cognitiva",
  pillar_cog_desc: "Concentrazione, decisioni",
  pillar_soc: "Sociale",
  pillar_soc_desc: "Scambi, presenza",
  pillar_sen: "Sensoriale",
  pillar_sen_desc: "Rumore, luce, movimento",
  cta_start: "Inizia",
  cta_no_account: "Nessun account richiesto",

  tab_calendar: "Calendario",
  tab_stats: "Statistiche",
  tab_settings: "Impostazioni",

  today: "Oggi",
  day_label: "Giornata",
  view_day: "Giorno",
  view_week: "Settimana",
  view_month: "Mese",
  donut_cog: "Cognitiva",
  donut_soc: "Sociale",
  donut_sen: "Sensoriale",
  fatigue_label: "Stato del giorno",
  fatigue_low: "Stanchezza bassa",
  fatigue_med: "Stanchezza moderata",
  fatigue_high: "Stanchezza alta",
  fatigue_avg_score: "Punteggio medio",
  suggestions_title: "Suggerimenti gentili",
  events_title: "Eventi",
  empty_title: "Nessun evento oggi",
  empty_sub: "Aggiungi un compito o una risorsa per seguire la tua energia.",
  week_view_title: "Vista settimana",
  month_view_title: "Vista mese",
  events_count_one: "evento",
  events_count_other: "eventi",
  energy_short: "energia",

  sugg_cog: "La tua riserva cognitiva è bassa. Una pausa silenziosa potrebbe aiutarti.",
  sugg_soc: "La tua riserva sociale è bassa. Scegli del tempo da solo stasera.",
  sugg_sen: "La tua riserva sensoriale è bassa. Evita ambienti rumorosi.",
  sugg_pause: "Aggiungi una pausa tra i tuoi appuntamenti per respirare.",
  sugg_resource: "Un'attività risorsa (passeggiata, riposo, lettura) potrebbe aiutarti.",
  sugg_calm: "La tua giornata sembra equilibrata. Prenditi cura di te.",

  new_event: "Nuovo evento",
  field_title: "Titolo",
  field_title_placeholder: "Medico",
  field_type: "Tipo",
  type_task: "Compito",
  type_task_desc: "Riduce l'energia",
  type_resource: "Risorsa",
  type_resource_desc: "Ricarica l'energia",
  field_time: "Ora",
  field_duration: "Durata",
  duration_unit: "min",
  field_impact: "Impatto energetico",
  field_impact_sub_task: "Trascina per regolare l'intensità (0–75).",
  field_impact_sub_resource: "Trascina per regolare la ricarica (0–75).",
  cta_save: "Aggiungi evento",
  err_title_missing_t: "Titolo mancante",
  err_title_missing_m: "Dai un nome al tuo evento.",
  err_time_invalid_t: "Ora non valida",
  err_time_invalid_m: "Formato richiesto: HH:MM (es. 09:30).",
  err_capacity_t: "Capacità superata",
  err_capacity_m: "Questa attività supera la tua capacità energetica attuale.",
  err_unexpected: "Errore inaspettato.",
  err_cant_add: "Impossibile aggiungere",

  stats_eyebrow: "STATISTICHE",
  stats_title: "Il tuo equilibrio",
  stats_subtitle: "Una lettura dolce delle tue ultime giornate.",
  range_7: "7 giorni",
  range_30: "30 giorni",
  kpi_avg_fatigue: "Stanchezza media",
  kpi_overload: "Giorni di sovraccarico",
  kpi_events: "Eventi",
  kpi_remaining: "Energia rimasta",
  this_week: "questa settimana",
  this_month: "questo mese",
  avg_label: "media",
  avg_reserves: "Riserve medie",
  fatigue_trend: "Andamento stanchezza",
  fatigue_trend_sub: "Più la barra è alta, più la stanchezza è forte.",
  energy_balance: "Equilibrio delle 3 energie",
  energy_balance_sub: "Le 3 riserve nel corso dei giorni.",

  settings_eyebrow: "IMPOSTAZIONI",
  settings_title: "Il tuo spazio",
  reserves_section: "Riserve di energia",
  res_cog_desc: "Concentrazione, decisioni, carico mentale.",
  res_soc_desc: "Interazioni, scambi, presenza degli altri.",
  res_sen_desc: "Rumore, luce, movimento, stimolazione.",
  app_section: "Applicazione",
  setting_theme: "Tema",
  setting_theme_value: "Scuro premium",
  setting_language: "Lingua",
  setting_notifications: "Notifiche",
  setting_notifications_value: "Presto",
  setting_about: "Informazioni",
  about_title: "Atypic Calendar",
  about_body:
    "Un calendario energetico pensato per rispettare il tuo sistema nervoso.\n\nVersione 1.0",
  care_section: "Cura & dolcezza",
  setting_engagement: "Il nostro impegno",
  engagement_title: "Il nostro impegno",
  engagement_body:
    "Progettiamo questa app per rispettare il tuo sistema nervoso. Niente notifiche aggressive, niente punteggi di produttività — solo un compagno gentile per la tua energia.",
  setting_clear: "Reimposta dati",
  clear_title: "Reimposta",
  clear_body:
    "Questa funzione sarà disponibile con un account. Per ora puoi eliminare gli eventi uno per uno dal calendario.",
  footer: "Atypic Calendar · Con dolcezza · v1.0",

  cancel: "Annulla",
  ok: "OK",
  understood: "Capito",
  delete_event_title: "Eliminare questo evento?",
  delete_event_body: "Questa azione è irreversibile.",
  delete: "Elimina",
  language_name: "Italiano",
  edit_event: "Modifica evento",
  save_changes: "Salva modifiche",
  delete_event_btn: "Elimina evento",
  notif_toggle_desc: "Promemoria mattutino + 15 min prima di ogni evento.",
  notif_perm_denied_t: "Permesso negato",
  notif_perm_denied_m: "Autorizza le notifiche nelle impostazioni di sistema per attivare i promemoria.",
  paywall_eyebrow: "ATYPIC PREMIUM",
  paywall_title: "Sblocca una\npianificazione illimitata.",
  paywall_subtitle: "La versione gratuita include 25 eventi. Premium rimuove il limite e aggiunge più cura.",
  paywall_feature_unlimited: "Eventi illimitati",
  paywall_feature_unlimited_desc: "Niente più tetto a 25 eventi. Pianifica quanto ti serve.",
  paywall_feature_notifications: "Promemoria intelligenti",
  paywall_feature_notifications_desc: "Promemoria mattutino e prima di ogni evento.",
  paywall_feature_stats: "Statistiche complete",
  paywall_feature_stats_desc: "Tendenze su 30 giorni e grafici di equilibrio.",
  paywall_feature_support: "Sostieni un piccolo team",
  paywall_feature_support_desc: "Ci aiuti a mantenere l'app dolce e senza pubblicità.",
  paywall_cta: "Continua",
  paywall_cta_loading: "Connessione…",
  paywall_price_fallback: "Abbonamento mensile",
  paywall_per_month: "/ mese",
  paywall_restore: "Ripristina acquisto",
  paywall_close: "Più tardi",
  paywall_terms:
    "Abbonamento a rinnovo automatico. Annullabile in qualsiasi momento in Impostazioni → ID Apple. Rinnovo mensile fino all'annullamento.",
  paywall_unavailable_t: "Negozio non disponibile",
  paywall_unavailable_m:
    "Gli acquisti in-app sono disponibili solo nella versione App Store dell'app.",
  paywall_purchase_failed_t: "Acquisto fallito",
  paywall_purchase_failed_m: "Riprova più tardi.",
  paywall_thanks_t: "Grazie",
  paywall_thanks_m: "Premium è ora attivo. Goditi una pianificazione illimitata.",
  paywall_restore_none_t: "Nulla da ripristinare",
  paywall_restore_none_m: "Nessun abbonamento attivo trovato su questo account.",
  limit_reached_t: "Limite gratuito raggiunto",
  limit_reached_m: "Hai raggiunto 25 eventi. Passa a Premium per continuare a pianificare.",
  limit_unlock: "Sblocca eventi illimitati",
  limit_progress: "eventi usati",
  premium_section: "Abbonamento",
  premium_active: "Premium attivo",
  premium_inactive: "Piano gratuito",
  upgrade_cta: "Passa a Premium",
};

const de: Dict = {
  brand: "ATYPIC CALENDAR",
  onboarding_title: "Ein Kalender,\nentworfen für deine\nEnergie.",
  onboarding_subtitle:
    "Verfolge deine kognitive, soziale und sensorische Reserve. Gestalte deine Tage mit Sanftheit.",
  pillar_cog: "Kognitiv",
  pillar_cog_desc: "Fokus, Entscheidungen",
  pillar_soc: "Sozial",
  pillar_soc_desc: "Austausch, Präsenz",
  pillar_sen: "Sensorisch",
  pillar_sen_desc: "Lärm, Licht, Bewegung",
  cta_start: "Loslegen",
  cta_no_account: "Kein Konto erforderlich",

  tab_calendar: "Kalender",
  tab_stats: "Statistiken",
  tab_settings: "Einstellungen",

  today: "Heute",
  day_label: "Tag",
  view_day: "Tag",
  view_week: "Woche",
  view_month: "Monat",
  donut_cog: "Kognitiv",
  donut_soc: "Sozial",
  donut_sen: "Sensorisch",
  fatigue_label: "Tageszustand",
  fatigue_low: "Geringe Müdigkeit",
  fatigue_med: "Mäßige Müdigkeit",
  fatigue_high: "Hohe Müdigkeit",
  fatigue_avg_score: "Durchschnittswert",
  suggestions_title: "Sanfte Vorschläge",
  events_title: "Ereignisse",
  empty_title: "Heute keine Ereignisse",
  empty_sub: "Füge eine Aufgabe oder Ressource hinzu, um deine Energie zu verfolgen.",
  week_view_title: "Wochenansicht",
  month_view_title: "Monatsansicht",
  events_count_one: "Ereignis",
  events_count_other: "Ereignisse",
  energy_short: "Energie",

  sugg_cog: "Deine kognitive Reserve ist niedrig. Eine ruhige Pause könnte helfen.",
  sugg_soc: "Deine soziale Reserve ist niedrig. Wähle heute Abend Zeit für dich allein.",
  sugg_sen: "Deine sensorische Reserve ist niedrig. Vermeide laute Umgebungen.",
  sugg_pause: "Füge eine Pause zwischen deinen Terminen ein, um durchzuatmen.",
  sugg_resource:
    "Eine Ressourcen-Aktivität (Spaziergang, Nickerchen, Lesen) könnte helfen.",
  sugg_calm: "Dein Tag wirkt ausgeglichen. Pass gut auf dich auf.",

  new_event: "Neues Ereignis",
  field_title: "Titel",
  field_title_placeholder: "Arzt",
  field_type: "Typ",
  type_task: "Aufgabe",
  type_task_desc: "Verringert Energie",
  type_resource: "Ressource",
  type_resource_desc: "Lädt Energie auf",
  field_time: "Uhrzeit",
  field_duration: "Dauer",
  duration_unit: "Min",
  field_impact: "Energie-Auswirkung",
  field_impact_sub_task: "Wische, um die Intensität einzustellen (0–75).",
  field_impact_sub_resource: "Wische, um die Aufladung einzustellen (0–75).",
  cta_save: "Ereignis hinzufügen",
  err_title_missing_t: "Titel fehlt",
  err_title_missing_m: "Gib deinem Ereignis einen Namen.",
  err_time_invalid_t: "Ungültige Uhrzeit",
  err_time_invalid_m: "Erwartetes Format: HH:MM (z. B. 09:30).",
  err_capacity_t: "Kapazität überschritten",
  err_capacity_m: "Diese Aktivität übersteigt deine aktuelle Energie-Kapazität.",
  err_unexpected: "Unerwarteter Fehler.",
  err_cant_add: "Kann nicht hinzugefügt werden",

  stats_eyebrow: "STATISTIKEN",
  stats_title: "Dein Gleichgewicht",
  stats_subtitle: "Eine sanfte Lesart deiner letzten Tage.",
  range_7: "7 Tage",
  range_30: "30 Tage",
  kpi_avg_fatigue: "Ø Müdigkeit",
  kpi_overload: "Überlastungstage",
  kpi_events: "Ereignisse",
  kpi_remaining: "Verbleibende Energie",
  this_week: "diese Woche",
  this_month: "diesen Monat",
  avg_label: "Durchschnitt",
  avg_reserves: "Durchschnittliche Reserven",
  fatigue_trend: "Müdigkeitsverlauf",
  fatigue_trend_sub: "Je höher der Balken, desto stärker die Müdigkeit.",
  energy_balance: "Gleichgewicht der 3 Energien",
  energy_balance_sub: "Deine 3 Reserven über die Tage.",

  settings_eyebrow: "EINSTELLUNGEN",
  settings_title: "Dein Raum",
  reserves_section: "Energiereserven",
  res_cog_desc: "Fokus, Entscheidungen, mentale Last.",
  res_soc_desc: "Interaktionen, Austausch, Präsenz anderer.",
  res_sen_desc: "Lärm, Licht, Bewegung, Stimulation.",
  app_section: "Anwendung",
  setting_theme: "Thema",
  setting_theme_value: "Premium dunkel",
  setting_language: "Sprache",
  setting_notifications: "Benachrichtigungen",
  setting_notifications_value: "Bald verfügbar",
  setting_about: "Über",
  about_title: "Atypic Calendar",
  about_body:
    "Ein Energiekalender, gestaltet, um dein Nervensystem zu respektieren.\n\nVersion 1.0",
  care_section: "Achtsamkeit & Sanftheit",
  setting_engagement: "Unser Versprechen",
  engagement_title: "Unser Versprechen",
  engagement_body:
    "Wir gestalten diese App, um dein Nervensystem zu respektieren. Keine aggressiven Benachrichtigungen, kein Produktivitätsscore — nur ein sanfter Begleiter für deine Energie.",
  setting_clear: "Daten zurücksetzen",
  clear_title: "Zurücksetzen",
  clear_body:
    "Diese Funktion wird mit einem Konto verfügbar sein. Du kannst Ereignisse einzeln aus dem Kalender löschen.",
  footer: "Atypic Calendar · Mit Sanftheit · v1.0",

  cancel: "Abbrechen",
  ok: "OK",
  understood: "Verstanden",
  delete_event_title: "Dieses Ereignis löschen?",
  delete_event_body: "Diese Aktion ist unumkehrbar.",
  delete: "Löschen",
  language_name: "Deutsch",
  edit_event: "Ereignis bearbeiten",
  save_changes: "Änderungen speichern",
  delete_event_btn: "Ereignis löschen",
  notif_toggle_desc: "Morgendliche Erinnerung + 15 Min vor jedem Ereignis.",
  notif_perm_denied_t: "Erlaubnis verweigert",
  notif_perm_denied_m: "Erlaube Benachrichtigungen in den Systemeinstellungen, um Erinnerungen zu aktivieren.",
  paywall_eyebrow: "ATYPIC PREMIUM",
  paywall_title: "Unbegrenzte ruhige\nPlanung freischalten.",
  paywall_subtitle: "Die Gratis-Version enthält 25 Ereignisse. Premium entfernt das Limit und fügt mehr Achtsamkeit hinzu.",
  paywall_feature_unlimited: "Unbegrenzte Ereignisse",
  paywall_feature_unlimited_desc: "Kein 25-Ereignisse-Limit mehr. Plane so viel du brauchst.",
  paywall_feature_notifications: "Smarte Erinnerungen",
  paywall_feature_notifications_desc: "Tägliche morgendliche und Vor-Ereignis-Erinnerungen.",
  paywall_feature_stats: "Vollständige Statistiken",
  paywall_feature_stats_desc: "Energieverläufe über 30 Tage und Gleichgewichts-Charts.",
  paywall_feature_support: "Unterstütze ein kleines Team",
  paywall_feature_support_desc: "Du hilfst uns, die App ruhig und werbefrei zu halten.",
  paywall_cta: "Weiter",
  paywall_cta_loading: "Verbindung…",
  paywall_price_fallback: "Monatsabo",
  paywall_per_month: "/ Monat",
  paywall_restore: "Kauf wiederherstellen",
  paywall_close: "Später",
  paywall_terms:
    "Automatisch verlängerndes Abo. Jederzeit kündbar in Einstellungen → Apple-ID. Monatliche Verlängerung bis zur Kündigung.",
  paywall_unavailable_t: "Store nicht verfügbar",
  paywall_unavailable_m:
    "In-App-Käufe sind nur in der App-Store-Version der App verfügbar.",
  paywall_purchase_failed_t: "Kauf fehlgeschlagen",
  paywall_purchase_failed_m: "Bitte versuche es später erneut.",
  paywall_thanks_t: "Danke",
  paywall_thanks_m: "Premium ist jetzt aktiv. Genieße unbegrenzte Planung.",
  paywall_restore_none_t: "Nichts zum Wiederherstellen",
  paywall_restore_none_m: "Auf diesem Konto wurde kein aktives Abo gefunden.",
  limit_reached_t: "Gratis-Limit erreicht",
  limit_reached_m: "Du hast 25 Ereignisse erreicht. Upgrade auf Premium, um weiter zu planen.",
  limit_unlock: "Unbegrenzte Ereignisse freischalten",
  limit_progress: "Ereignisse genutzt",
  premium_section: "Abonnement",
  premium_active: "Premium aktiv",
  premium_inactive: "Gratis-Plan",
  upgrade_cta: "Upgrade",
};

const dictionaries: Record<Lang, Dict> = { en, fr, it, de };

export const t = dictionaries[lang];

export const sugByType = (type: string): string => {
  switch (type) {
    case "cognitive":
      return t.sugg_cog;
    case "social":
      return t.sugg_soc;
    case "sensory":
      return t.sugg_sen;
    case "pause":
      return t.sugg_pause;
    case "resource":
      return t.sugg_resource;
    default:
      return t.sugg_calm;
  }
};
