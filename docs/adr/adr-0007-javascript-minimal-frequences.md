---
title: "ADR-0007: JavaScript minimal : un seul fichier d'agrément, sans dépendance, jamais indispensable"
status: "Acceptée"
date: "2026-11-18"
authors: "Adrien Clerbois (développement, avec Claude Code)"
tags: ["architecture", "decision", "javascript", "accessibilite", "web-audio"]
supersedes: ""
superseded_by: ""
---

# ADR-0007 : JavaScript minimal — un seul fichier d'agrément, sans dépendance, jamais indispensable

## Statut

**Acceptée** — 18 novembre 2026 (mise en ligne du site complet).

## Contexte

Le thème du site — le son, la vibration, les fréquences — se prête à une illustration
interactive : montrer le son plutôt que seulement le décrire. Mais le site reste une vitrine
d'information dont le contenu doit être accessible à tous, y compris sans JavaScript, sur des
appareils modestes, et pour des personnes sensibles aux animations. Il fallait donc fixer la
place exacte du JavaScript : un agrément thématique, jamais une condition d'accès au contenu.

## Décision

Tout le JavaScript du site tient dans **un seul fichier**, `js/frequences.js` (~420 lignes,
vanilla, aucune bibliothèque), chargé en `defer` et identique pour tous les modèles graphiques.
Il est organisé autour des fréquences : chaque page porte un `data-freq` qui pilote ses
animations. Ses rôles, tous progressifs :

- **Figures de Chladni** : sur chaque page, un canvas où des grains de « sable » migrent vers
  les lignes nodales de la fréquence de la page ; toucher la plaque disperse le sable.
- **Ondes décoratives** (SVG) entre les sections, dont le nombre de cycles suit la fréquence.
- **Curseur de fréquences et bol chantant** (accueil) : sept fréquences sélectionnables ; le bol
  est synthétisé en Web Audio (partiels inharmoniques doublés pour créer le battement, « toc »
  du maillet filtré), sonne une octave plus bas et s'éteint seul en ~22 secondes.
- **Formulaire de demande** : composition locale d'un lien `mailto:` pré-rédigé (voir ADR-0005).
- **Confort** : apparition des sections au défilement (`IntersectionObserver`), menu mobile.

Garde-fous intégrés : respect de `prefers-reduced-motion` (figures rendues statiques, pas
d'animation de défilement), arrêt des animations hors écran (`IntersectionObserver`) et quand
l'onglet est masqué, nombre de grains réduit sur petit écran, `aria-valuetext` et zone
`role="status"` pour le curseur et le bol, son coupé au départ de la page (`pagehide`). Sans
JavaScript : contenu, navigation et formulaire (via `action="mailto:"`) restent fonctionnels ;
le curseur reste masqué (`hidden` levé par le script).

## Conséquences

### Positives

- **POS-001** : Aucune dépendance : pas de framework ni de bibliothèque à mettre à jour, pas de
  chaîne de build ; le fichier se relit et se modifie directement.
- **POS-002** : Amélioration progressive stricte : tout le contenu est servi en HTML ; le script
  peut échouer ou être bloqué sans rien casser d'essentiel.
- **POS-003** : Accessibilité et sobriété : animations coupées pour qui les refuse
  (`prefers-reduced-motion`), arrêtées hors écran, audio uniquement à la demande de
  l'utilisateur et à volume modéré.
- **POS-004** : Le bol chantant et les figures de Chladni servent le propos commercial : faire
  éprouver au visiteur un avant-goût de la séance (« Le bol n'est qu'un avant-goût »),
  différenciant pour un site de praticienne.

### Négatives

- **NEG-001** : La synthèse Web Audio est un son de bol approximatif, pas un enregistrement
  réel : il illustre, il ne documente pas le soin.
- **NEG-002** : Les animations sur canvas consomment du CPU sur les appareils anciens ; atténué
  (grains réduits sur mobile, arrêt hors écran) mais pas nul.
- **NEG-003** : Un seul fichier regroupant six rôles : il grossira si l'interactivité s'étend, et
  son découpage éventuel demandera une décision (nouvel ADR).
- **NEG-004** : Pas de tests automatisés sur ce script : la vérification est manuelle, navigateur
  par navigateur.

## Alternatives envisagées

### Aucun JavaScript

- **ALT-001** : **Description** : site purement HTML/CSS, sans figures ni bol.
- **ALT-002** : **Raison du rejet** : le site perdait sa démonstration sensorielle, précieuse
  pour expliquer un soin par le son ; le menu mobile et la présélection du soin dans le
  formulaire auraient aussi été dégradés. Le coût du script (un fichier, zéro dépendance) est
  faible devant ce bénéfice.

### Bibliothèques spécialisées (p5.js pour le canvas, Tone.js pour l'audio, GSAP pour le reveal)

- **ALT-003** : **Description** : s'appuyer sur des bibliothèques éprouvées pour chaque effet.
- **ALT-004** : **Raison du rejet** : des centaines de kilo-octets et des versions à suivre pour
  des effets réalisables en API natives (Canvas 2D, Web Audio, IntersectionObserver) ; contraire
  à l'ADR-0001.

### Sons enregistrés (fichiers audio d'un vrai bol)

- **ALT-005** : **Description** : lire des enregistrements plutôt que synthétiser.
- **ALT-006** : **Raison du rejet** : sept fréquences × un fichier de ~20 secondes pèseraient
  plus que tout le reste du site, pour un rendu figé ; la synthèse permet d'accorder le bol
  exactement sur chaque fréquence et de superposer les frappes. Option réévaluable si de vrais
  enregistrements des séances deviennent disponibles.

## Notes de mise en œuvre

- **IMP-001** : La source de `frequences.js` vit avec le générateur
  (`maquettes/site/js/frequences.js`) et est copiée dans chaque modèle à la génération : ne pas
  modifier la copie publiée directement.
- **IMP-002** : Les paramètres visuels par page (fréquence, mode m/n/signe de la figure, palette)
  sont déclarés dans `build_site.py` et transmis par attributs `data-*` : toute nouvelle page
  doit les définir.
- **IMP-003** : Vérifier à chaque évolution : comportement avec `prefers-reduced-motion`,
  navigation complète sans JavaScript, absence de son au chargement.
- **IMP-004** : Critère de succès : aucune erreur console sur les six pages, contenu intégral
  visible sans script, bol audible uniquement après action de l'utilisateur.

## Références

- **REF-001** : [ADR-0001](adr-0001-site-statique-sans-framework.md) — le principe de sobriété
  que ce fichier applique au JavaScript.
- **REF-002** : [ADR-0005](adr-0005-contact-email-sans-backend.md) — le formulaire `mailto:`
  implémenté par ce script.
- **REF-003** : `js/frequences.js` — le fichier lui-même, commenté section par section.
