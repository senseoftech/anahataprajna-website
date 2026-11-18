---
title: "ADR-0006: Référencement : données structurées, fichiers classiques et llms.txt pour les assistants IA"
status: "Acceptée"
date: "2026-11-17"
authors: "Adrien Clerbois (développement, avec Claude Code) ; Mélissa Letenre (commanditaire)"
tags: ["architecture", "decision", "seo", "llms", "json-ld"]
supersedes: ""
superseded_by: ""
---

# ADR-0006 : Référencement — données structurées, fichiers classiques et `llms.txt` pour les assistants IA

## Statut

**Acceptée** — 17 novembre 2026 (état documenté dans `maquettes/referencement.md`).

## Contexte

Le site doit être trouvé par deux publics de machines : les moteurs de recherche classiques
(Google, Bing) pour les recherches locales (« chant de guérison Thuin », « sonopuncture
Hainaut »), et les assistants IA (ChatGPT, Claude, Perplexity, Gemini), qui deviennent une porte
d'entrée courante pour ce type de recherche. Un domaine neuf, sans historique ni liens entrants,
part de zéro ; un sujet proche de la santé exige en outre un cadre honnête (le site affiche sur
chaque page que le chant de guérison ne remplace pas un suivi médical ou psychologique).

Le générateur (ADR-0002) permet d'industrialiser tout ce qui est automatisable et d'imposer des
garde-fous.

## Décision

Le référencement repose sur quatre couches, toutes générées par `build_site.py` :

1. **Balises classiques par page** : titre (≤ 65 caractères, contrôlé), description (110–160
   caractères, contrôlée), adresse canonique, `lang="fr-BE"`, balises géographiques
   (`geo.region`, `geo.placename`), Open Graph avec image de partage 1200 × 630, liens au texte
   explicite.
2. **Données structurées JSON-LD** sur chaque page : `WebSite`, `HealthAndBeautyBusiness`
   (avec TVA, adresse, zone desservie), `Person` (la praticienne), un nœud `Service` par soin,
   `FAQPage` sur l'accueil (les onze questions-réponses), `BreadcrumbList` sur les pages
   intérieures.
3. **Fichiers pour les robots** : `robots.txt` ouvrant explicitement le site aux robots des
   assistants IA (GPTBot, ClaudeBot, PerplexityBot, etc.), `sitemap.xml` daté,
   `site.webmanifest`, page 404 en `noindex, follow`.
4. **Fichiers `llms.txt` et `llms-full.txt`** destinés aux assistants IA : le premier résume le
   site (faits essentiels, définitions, liste des pages), le second contient le texte complet des
   pages, extrait automatiquement du HTML généré — donc toujours synchrone avec le site.

Les comptes de suivi (Google Search Console, Bing Webmaster Tools, fiche Google Business
Profile) sont identifiés comme étapes à réaliser, hors périmètre du code.

## Conséquences

### Positives

- **POS-001** : Cohérence garantie : balises, JSON-LD, sitemap et fichiers `llms` dérivent des
  mêmes constantes ; une mise à jour de contenu se propage partout en une génération.
- **POS-002** : Les garde-fous du générateur (longueurs de titre et de description) éliminent à
  la source les défauts d'affichage dans les résultats de recherche.
- **POS-003** : Le format FAQ et les définitions en texte simple de `llms.txt` sont les formats
  les plus repris par les assistants IA : le site est lisible par eux sans interprétation du
  HTML.
- **POS-004** : La mention de cadre (« ne remplace pas un suivi médical ou psychologique »),
  présente sur chaque page et dans `llms.txt`, protège la crédibilité sur un sujet sensible —
  prudence volontaire sur les allégations de santé.

### Négatives

- **NEG-001** : `llms.txt` est une convention récente, sans garantie d'être lue par les
  assistants : un pari à faible coût, pas un levier prouvé.
- **NEG-002** : Ouvrir le site aux robots IA, c'est accepter que son contenu alimente leurs
  réponses, parfois sans visite sur le site ; assumé, la visibilité primant pour une activité
  naissante.
- **NEG-003** : Le référencement effectif dépend d'étapes externes non codées : HTTPS à activer
  (bloquant), Search Console, fiche Google Business Profile, liens entrants, vraies photos ;
  plusieurs semaines à plusieurs mois avant des effets mesurables.
- **NEG-004** : `llms-full.txt` duplique tout le contenu du site en un fichier : à régénérer à
  chaque modification (automatique via le générateur, mais à ne jamais éditer à la main).

## Alternatives envisagées

### Référencement minimal (titres et sitemap seulement)

- **ALT-001** : **Description** : se limiter aux balises de base et attendre que l'indexation se
  fasse.
- **ALT-002** : **Raison du rejet** : pour un domaine neuf sur un créneau local concurrentiel
  (bien-être), les données structurées et la FAQ sont précisément ce qui permet d'exister dans
  les résultats enrichis et les réponses d'assistants ; le surcoût est nul une fois le
  générateur en place.

### Bloquer les robots des assistants IA

- **ALT-003** : **Description** : interdire GPTBot, ClaudeBot, etc. dans `robots.txt` pour
  protéger le contenu.
- **ALT-004** : **Raison du rejet** : contraire à l'objectif : être cité par les assistants est
  une source de clientèle espérée ; le contenu du site est promotionnel, sa reprise est un
  bénéfice, pas un préjudice.

### Outil SEO tiers ou suivi par extension CMS

- **ALT-005** : **Description** : déléguer balises et audits à un outil (type Yoast, Semrush).
- **ALT-006** : **Raison du rejet** : sans CMS, ces outils n'ont pas de prise ; les contrôles
  utiles (longueurs, cohérence) sont codés en dur dans le générateur, version la plus fiable
  d'un audit.

## Notes de mise en œuvre

- **IMP-001** : Étapes bloquantes documentées dans `maquettes/referencement.md` : activer le
  HTTPS, créer Google Search Console et Bing Webmaster Tools, soumettre `sitemap.xml`, créer la
  fiche Google Business Profile.
- **IMP-002** : Enrichissements prévus après validation par Mélissa : tarifs et durées (données
  d'offre), vraies questions de clients dans la FAQ, témoignages avec accord écrit, photos
  réelles, liens entrants (Equinergie, annuaires).
- **IMP-003** : Ne jamais éditer `sitemap.xml`, `robots.txt`, `llms.txt` ou `llms-full.txt` à la
  main : ils sont écrasés à chaque génération.
- **IMP-004** : Critères de succès : site indexé dans Search Console sans erreur, résultats
  enrichis (FAQ) affichés, site cité correctement par au moins un assistant IA sur la requête
  « chant vibratoire Thuin ».

## Références

- **REF-001** : [ADR-0002](adr-0002-generation-par-script-python.md) — le générateur qui produit
  et synchronise tous ces fichiers.
- **REF-002** : [ADR-0003](adr-0003-hebergement-github-pages-domaine.md) — le domaine et le HTTPS
  dont dépend ce référencement.
- **REF-003** : `maquettes/referencement.md` — état complet du référencement au 17 novembre 2026
  et liste des suites ; convention `llms.txt` (llmstxt.org).
