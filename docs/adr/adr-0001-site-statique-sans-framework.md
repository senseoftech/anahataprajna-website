---
title: "ADR-0001: Site 100 % statique, sans framework ni générateur tiers"
status: "Acceptée"
date: "2026-11-17"
authors: "Adrien Clerbois (développement, avec Claude Code) ; Mélissa Letenre (commanditaire)"
tags: ["architecture", "decision", "statique", "simplicite"]
supersedes: ""
superseded_by: ""
---

# ADR-0001 : Site 100 % statique, sans framework ni générateur tiers

## Statut

**Acceptée** — 17 novembre 2026 (première mise en ligne de la page d'attente).

## Contexte

Anahata Prajñā est le site vitrine de l'activité de chant d'ancrage et de chant vibratoire de
Mélissa Letenre, à Thuin et Beaumont (Hainaut, Belgique). Le besoin est modeste et stable :

- six pages de présentation (`index.html`, `essence.html`, `chant-ancrage.html`,
  `chant-vibratoire.html`, `vivant.html`, `contact.html`) plus une page 404 ;
- aucun contenu dynamique côté serveur : pas de blog à flux continu, pas de compte utilisateur,
  pas de paiement en ligne, pas de formulaire traité par un serveur ;
- un budget de fonctionnement nul : l'hébergement et la maintenance ne doivent rien coûter ;
- une maintenance assurée par Adrien Clerbois à l'aide de Claude Code, pas par une agence ;
- un public francophone local, souvent sur mobile, pour qui la rapidité de chargement compte.

Les forces en présence : la simplicité d'exploitation (personne ne doit mettre à jour un CMS ou
ses extensions de sécurité), le coût nul, et la pérennité (un fichier HTML reste lisible dans
dix ans, un CMS non entretenu devient une faille).

## Décision

Le site est composé exclusivement de fichiers statiques : pages HTML à la racine du dépôt,
deux feuilles de style (`css/base.css` pour la structure, `css/skin.css` pour l'habillage),
un seul fichier JavaScript (`js/frequences.js`), des images dans `assets/` et des fichiers de
référencement (`sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `site.webmanifest`).

Aucun framework front-end (React, Vue…), aucun générateur tiers (Jekyll, Hugo, Eleventy…),
aucun CMS (WordPress…), aucune étape de build côté serveur. La seule « machinerie » est un
script Python maison exécuté localement (voir ADR-0002), dont la sortie est du HTML pur.

## Conséquences

### Positives

- **POS-001** : Coût d'exploitation nul : des fichiers statiques se servent depuis GitHub Pages
  sans serveur applicatif, sans base de données, sans abonnement (voir ADR-0003).
- **POS-002** : Surface d'attaque minimale : pas de CMS à mettre à jour, pas d'injection SQL
  possible, pas de dépendances npm à surveiller.
- **POS-003** : Performance : pages légères, rendues sans JavaScript obligatoire, servies par le
  CDN de GitHub Pages ; favorable au référencement et aux visiteurs sur mobile.
- **POS-004** : Pérennité et portabilité : le site peut être déplacé chez n'importe quel
  hébergeur statique en copiant les fichiers, sans migration.
- **POS-005** : Lisibilité totale pour la maintenance par un humain ou par Claude Code : ce qui
  est dans le dépôt est exactement ce que le visiteur reçoit.

### Négatives

- **NEG-001** : Aucune fonction serveur possible : pas de formulaire traité en ligne, pas d'envoi
  d'e-mail depuis le site (contourné par un lien `mailto:`, voir ADR-0005), pas d'espace membre.
- **NEG-002** : Mélissa ne peut pas modifier le contenu elle-même : toute mise à jour passe par
  le script de génération et un commit, donc par Adrien (atténué par la simplicité du flux).
- **NEG-003** : Les éléments répétés (en-tête, pied de page, navigation) ne peuvent pas être
  inclus dynamiquement : sans générateur maison, chaque page devrait être modifiée à la main
  (c'est précisément ce que résout l'ADR-0002).
- **NEG-004** : Pas de statistiques côté serveur ; la mesure d'audience exigerait un outil tiers.

## Alternatives envisagées

### CMS hébergé ou auto-hébergé (WordPress, Wix, Squarespace)

- **ALT-001** : **Description** : plateforme avec interface d'édition, thèmes et formulaires
  intégrés, permettant à Mélissa d'éditer elle-même.
- **ALT-002** : **Raison du rejet** : coût récurrent (hébergement ou abonnement), maintenance de
  sécurité continue pour WordPress, rendu plus lourd, et dépendance à une plateforme fermée ;
  disproportionné pour six pages au contenu stable.

### Générateur de site statique tiers (Jekyll, Hugo, Eleventy)

- **ALT-003** : **Description** : génération de HTML à partir de Markdown et de gabarits ;
  Jekyll est même intégré nativement à GitHub Pages.
- **ALT-004** : **Raison du rejet** : apporte une chaîne d'outils, des conventions et des mises à
  jour à suivre pour un bénéfice faible à cette échelle ; le besoin réel (gabarit commun, données
  structurées, fichiers de référencement, cinq habillages à comparer) est couvert plus
  précisément par un script Python maison d'un seul fichier (ADR-0002).

### Framework JavaScript avec rendu statique (Next.js, Astro)

- **ALT-005** : **Description** : site généré par un framework moderne avec composants et
  écosystème npm.
- **ALT-006** : **Raison du rejet** : dépendances nombreuses à maintenir, complexité sans
  rapport avec le besoin, poids initial supérieur ; aucune interactivité du site ne le justifie.

## Notes de mise en œuvre

- **IMP-001** : Les pages publiées à la racine ne doivent jamais être modifiées à la main : elles
  sont écrasées à chaque génération (avertissement repris dans `README.md`).
- **IMP-002** : Toute nouvelle page doit être ajoutée dans le générateur (`PAGES` dans
  `build_site.py`), jamais créée directement en HTML.
- **IMP-003** : Critère de succès : le site reste intégralement fonctionnel avec JavaScript
  désactivé (le contenu et la navigation n'en dépendent pas, voir ADR-0007).

## Références

- **REF-001** : [ADR-0002](adr-0002-generation-par-script-python.md) — le générateur maison qui
  rend le statique tenable.
- **REF-002** : [ADR-0003](adr-0003-hebergement-github-pages-domaine.md) — l'hébergement choisi
  en conséquence.
- **REF-003** : `README.md` du dépôt — description du contenu publié et avertissement de ne pas
  éditer les pages à la main.
