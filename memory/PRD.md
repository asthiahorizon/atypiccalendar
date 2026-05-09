# Atypic Calendar – PRD

## Vision
Un calendrier énergétique premium qui place la capacité humaine avant le temps. Aide les utilisateurs (notamment neurodivergents) à planifier en respectant leurs réserves cognitive, sociale et sensorielle.

## Stack
- **Frontend**: Expo SDK 54 (React Native), expo-router, react-native-svg, react-native-reanimated, lucide-react-native
- **Backend**: FastAPI + Motor (MongoDB)
- **Auth**: Aucune (MVP anonyme)

## Concept central
Chaque journée commence avec 3 réserves à 100% :
- 🧠 Cognitif (#A288F8)
- 👥 Social (#FFB07F)
- ⚡ Sensoriel (#4DD0E1)

Les événements modifient ces réserves :
- **Tâche** = diminue (médecin, réunion…)
- **Ressource** = recharge (marche, sieste…)

Si une réserve passerait sous 0 → blocage doux : *"Cette activité dépasse votre capacité énergétique actuelle."*

## Features MVP (livrés)
- ✅ Onboarding animé premium (1 écran)
- ✅ Dashboard calendrier avec 3 vues : **Jour / Semaine / Mois**
- ✅ 3 donuts énergétiques animés (SVG + reanimated)
- ✅ Création d'événement (modal bottom sheet)
- ✅ 10 templates prédéfinis (Médecin, Restaurant, Travail profond, Réunion, Courses, Marche, Sieste, Sport, Lecture, Méditation)
- ✅ Suggestions intelligentes (règles backend)
- ✅ Score de fatigue journalier (faible / modérée / élevée)
- ✅ Statistiques (7j / 30j) avec KPIs et 2 graphiques (tendance fatigue + équilibre 3 énergies)
- ✅ Page Paramètres (présentation des réserves, à propos)
- ✅ Bottom tab navigation (Calendrier · Stats · Paramètres)

## API Endpoints (FastAPI)
- `GET /api/templates` – Liste des templates
- `GET /api/events?start_date&end_date` – Événements
- `GET /api/events/by-date/{date}` – Événements d'un jour
- `POST /api/events/check` – Vérifier si capacité suffisante
- `POST /api/events` – Créer (bloque si capacité dépassée)
- `PUT /api/events/{id}` – Modifier
- `DELETE /api/events/{id}` – Supprimer
- `GET /api/energy/{date}` – Énergie d'un jour
- `GET /api/energy?start_date&end_date` – Énergie sur plage
- `GET /api/stats?start_date&end_date` – KPIs sur plage
- `GET /api/suggestions/{date}` – Suggestions douces

## Design System
- Thème : Dark mode premium (`#0B0E14` base)
- Glassmorphism léger, coins arrondis (16-32px)
- Animations 500-900ms easing soft (Easing.bezier 0.25, 1, 0.5, 1)
- Aucune emoji UI ; lucide-react-native avec strokeWidth 1.5-1.7
- Pas de couleurs agressives (pas de rouge vif, fatigue élevée = rose doux #E879A6)

## Smart business enhancement (futur)
- Mode Premium : suggestions IA personnalisées via Claude (pacing, micro-pauses, prévention burnout)
