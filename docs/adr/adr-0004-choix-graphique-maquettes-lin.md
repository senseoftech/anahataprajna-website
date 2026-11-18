---
title: "ADR-0004: Choix graphique par maquettes multiples, modèle « Lin » retenu"
status: "Acceptée"
date: "2026-11-18"
authors: "Adrien Clerbois (développement, avec Claude Code) ; Mélissa Letenre (décideuse)"
tags: ["architecture", "decision", "design", "maquettes", "css"]
supersedes: ""
superseded_by: ""
---

# ADR-0004 : Choix graphique par maquettes multiples, modèle « Lin » retenu

## Statut

**Acceptée** — 18 novembre 2026 (commit `1723a56`, « Mise en ligne du site complet, modèle
Lin »).

## Contexte

L'identité visuelle du site devait être choisie par Mélissa, qui n'est pas du métier : lui
présenter une seule proposition, ou des descriptions abstraites, aurait rendu le choix difficile
et le résultat arbitraire. Il fallait un moyen de comparer des directions graphiques réelles,
sur le vrai contenu, sans multiplier le travail de développement.

Le générateur (ADR-0002) séparant structure et habillage, produire plusieurs habillages du même
site était peu coûteux : même HTML, même `base.css` (structure), une feuille `skin.css` propre à
chaque modèle (couleurs, polices, formes), plus la palette du curseur de fréquences et la
`theme-color` du navigateur.

## Décision

Cinq modèles complets ont été générés par `build_site.py`, chacun avec ses polices et son
habillage, sur un contenu strictement identique :

| Modèle | Caractère | Polices principales |
| --- | --- | --- |
| Terre (« Terre & Résonance ») | premier modèle, feuille écrite à la main | Newsreader, Nunito Sans |
| Lotus | clair, pétales | Quicksand, Mulish |
| Spectre | blanc, technique | Instrument Serif, IBM Plex Sans/Mono |
| Nuit | fond sombre, étoiles | Marcellus, Mulish |
| **Lin** | **beige et taupe, retenu** | Cormorant Garamond, DM Sans |

Après comparaison des maquettes, **le modèle « Lin »** (beige et taupe, palette terreuse pour
les sept fréquences) a été retenu et inscrit dans le générateur
(`PUBLISHED_MODEL = "lin"`) : c'est lui que `--publier` écrit à la racine. Le site publié
utilise ainsi `css/base.css` + `css/skin.css` (habillage Lin) et une palette dédiée pour le
curseur de fréquences.

## Conséquences

### Positives

- **POS-001** : Le choix graphique a été fait par la commanditaire sur des sites réels et
  complets, pas sur des promesses : décision éclairée et assumée.
- **POS-002** : La séparation structure/habillage (`base.css` / `skin.css`) survit au choix :
  retouches graphiques localisées dans une seule feuille, sans toucher au HTML.
- **POS-003** : Changer de direction graphique plus tard reste bon marché : les quatre autres
  modèles existent et se régénèrent d'une commande ; basculer se résume à changer
  `PUBLISHED_MODEL`.
- **POS-004** : Les contraintes transverses (accessibilité, `prefers-reduced-motion`,
  responsive) ont été implémentées une fois, dans la structure commune, et profitent à tous les
  modèles.

### Négatives

- **NEG-001** : Produire et entretenir cinq habillages a un coût : toute évolution structurelle
  doit être vérifiée sur les cinq modèles tant qu'ils sont conservés.
- **NEG-002** : Les polices des modèles sont servies par Google Fonts : dépendance externe et
  question RGPD identifiée ; l'auto-hébergement des polices est une amélioration prévue
  (`maquettes/referencement.md`).
- **NEG-003** : Les maquettes non retenues vieilliront sans entretien ; elles devront être
  considérées comme des archives, non comme des options prêtes à publier telles quelles.

## Alternatives envisagées

### Une seule proposition graphique, affinée par retours successifs

- **ALT-001** : **Description** : concevoir un seul design et itérer avec Mélissa.
- **ALT-002** : **Raison du rejet** : sans point de comparaison, difficile pour une
  non-spécialiste de dire ce qui ne convient pas ; risque d'itérations longues et d'un résultat
  par défaut plutôt que choisi.

### Thème ou gabarit tout fait (ThemeForest, template Jekyll…)

- **ALT-003** : **Description** : partir d'un thème existant et l'adapter.
- **ALT-004** : **Raison du rejet** : identité générique pour une activité très personnelle
  (chant de guérison, symbolique du lotus et des fréquences) ; code tiers à comprendre et à
  nettoyer ; incompatible avec le générateur maison et ses éléments propres (figures de
  Chladni, curseur de fréquences).

### Prestation d'un graphiste

- **ALT-005** : **Description** : confier la direction artistique à un professionnel.
- **ALT-006** : **Raison du rejet** : coût incompatible avec le budget du projet ; l'identité
  visuelle existante (logo réalisé sur Canva, symbolique fournie par Mélissa) suffisait comme
  base de déclinaison.

## Notes de mise en œuvre

- **IMP-001** : Le modèle publié est fixé par `PUBLISHED_MODEL` dans `build_site.py` ; les
  habillages vivent dans `maquettes/modeles/_src/` (`base.css` + `<nom>.css`).
- **IMP-002** : Les quatre modèles non retenus restent régénérables dans
  `maquettes/modeles/<nom>/` pour mémoire et comparaisons futures ; ne pas les publier sans les
  réviser.
- **IMP-003** : Améliorations graphiques prévues : auto-héberger les polices (RGPD, rapidité) et
  remplacer les emplacements de photos par de vraies photos avec textes alternatifs.
- **IMP-004** : Critère de succès : Mélissa reconnaît le site comme le sien ; aucune régression
  visuelle lors des régénérations (diff Git limité au contenu modifié).

## Références

- **REF-001** : [ADR-0002](adr-0002-generation-par-script-python.md) — le générateur qui a rendu
  les cinq maquettes possibles.
- **REF-002** : [ADR-0007](adr-0007-javascript-minimal-frequences.md) — les animations communes
  aux modèles (figures de Chladni, curseur de fréquences).
- **REF-003** : `maquettes/referencement.md` (section « Technique, une fois le modèle choisi »)
  — suites graphiques prévues (polices auto-hébergées, logo haute définition).
