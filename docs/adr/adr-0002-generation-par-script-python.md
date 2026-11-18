---
title: "ADR-0002: Génération des pages par un script Python maison (build_site.py)"
status: "Acceptée"
date: "2026-11-18"
authors: "Adrien Clerbois (développement, avec Claude Code) ; Mélissa Letenre (commanditaire)"
tags: ["architecture", "decision", "generation", "python", "build"]
supersedes: ""
superseded_by: ""
---

# ADR-0002 : Génération des pages par un script Python maison (`build_site.py`)

## Statut

**Acceptée** — 18 novembre 2026 (mise en ligne du site complet généré, commit `1723a56`).

## Contexte

Le site est statique (ADR-0001), mais six pages partagent le même squelette : en-tête, navigation,
pied de page, balises de référencement, données structurées JSON-LD, figure de Chladni dans le
héros. Les écrire à la main poserait trois problèmes :

- toute modification transverse (une ligne dans le pied de page, une balise `meta`) devrait être
  répétée sur chaque page de chaque modèle graphique, source d'incohérences ;
- cinq habillages graphiques devaient être produits et comparés à partir du même contenu
  (ADR-0004) : impossible à tenir à la main ;
- les fichiers dérivés (`sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`,
  `site.webmanifest`, JSON-LD) doivent rester strictement cohérents avec le contenu des pages.

Par ailleurs, certaines informations n'étaient pas encore validées par Mélissa au moment de la
mise en ligne (tarifs, adresse postale complète, dates) : il fallait pouvoir travailler sur des
brouillons annotés sans risquer de publier ces mentions.

## Décision

Les pages sont produites par un script Python unique et sans dépendance externe,
`maquettes/build_site.py` (bibliothèque standard uniquement) :

- le contenu de chaque page est déclaré en Python (dictionnaire `PAGES`), injecté dans un gabarit
  commun (`TEMPLATE`) par remplacement de jalons `@@…@@` ;
- le script génère les six pages, la 404, le JSON-LD (entreprise, praticienne, services, FAQ,
  fil d'Ariane), `robots.txt`, `sitemap.xml`, `llms.txt`, `llms-full.txt` (texte extrait du HTML
  par un `HTMLParser` maison) et `site.webmanifest`, pour chacun des cinq modèles ;
- des garde-fous bloquent la génération en cas d'écart : titre de plus de 65 caractères,
  description hors de 110–160 caractères, jalon `@@` restant dans le document ;
- l'option `--publier` écrit le modèle retenu (« lin ») à la racine du dépôt, après avoir
  retiré tout ce qui relève du brouillon : encadrés « à confirmer », informations marquées
  d'un « ? », emplacements de photo vides, adresse postale complète non validée. Des assertions
  vérifient qu'aucun reste de brouillon ni l'adresse ne subsistent dans la sortie publiée.

Le générateur et ses sources (`maquettes/`, `content/`) sont volontairement exclus du dépôt
publié (`.gitignore`), car le dépôt est servi tel quel par GitHub Pages depuis la racine de
`main` : seul le résultat généré est versionné et public.

## Conséquences

### Positives

- **POS-001** : Une seule source de vérité : contenu, navigation, métadonnées, JSON-LD et
  fichiers de référencement sont dérivés des mêmes constantes Python, sans divergence possible.
- **POS-002** : Les garde-fous (longueur des titres et descriptions, assertions de publication)
  rendent impossibles les erreurs de référencement les plus courantes et la fuite d'informations
  non validées (adresse, tarifs « à confirmer »).
- **POS-003** : Aucune dépendance à installer : Python standard suffit ; le script restera
  exécutable tel quel pendant des années.
- **POS-004** : Les cinq modèles graphiques partagent HTML et contenu à l'identique : la
  comparaison porte uniquement sur l'habillage (ADR-0004), et changer de modèle publié se fait
  en modifiant une constante (`PUBLISHED_MODEL`).
- **POS-005** : La publication est un geste unique et reproductible :
  `python build_site.py --publier`, puis commit.

### Négatives

- **NEG-001** : Le générateur et les sources de contenu ne sont pas versionnés dans ce dépôt
  (exclus par `.gitignore` parce que la racine est servie en public) : sans sauvegarde
  extérieure, la perte du poste de travail ferait perdre l'outil de génération. Risque identifié
  et à traiter (sauvegarde ou dépôt privé séparé).
- **NEG-002** : Le contenu éditorial vit dans des chaînes Python au milieu du code : l'édition
  demande de l'attention (échappement, HTML dans les chaînes) et reste hors de portée de Mélissa.
- **NEG-003** : Outil maison : pas de documentation communautaire ni d'écosystème ; la
  connaissance du script repose sur ses commentaires et sur les ADR.
- **NEG-004** : Un oubli de régénération après modification du script laisserait la racine
  désynchronisée ; inversement, une édition manuelle des HTML serait écrasée (averti dans le
  `README.md`).

## Alternatives envisagées

### Écriture et maintenance des pages HTML à la main

- **ALT-001** : **Description** : éditer directement les six fichiers HTML publiés.
- **ALT-002** : **Raison du rejet** : duplication de l'en-tête, du pied de page et des
  métadonnées sur six pages et cinq modèles ; incohérences garanties à terme ; production des
  fichiers dérivés (JSON-LD, llms-full.txt, sitemap) fastidieuse et fragile.

### Générateur tiers (Jekyll, Hugo, Eleventy) ou moteur de gabarits (Jinja2)

- **ALT-003** : **Description** : déléguer gabarits et génération à un outil établi.
- **ALT-004** : **Raison du rejet** : déjà écarté au niveau du principe en ADR-0001 ; de plus,
  aucun de ces outils ne couvre nativement les besoins spécifiques du projet (publication
  filtrée des brouillons, llms.txt/llms-full.txt dérivés du HTML, cinq habillages comparés,
  garde-fous de longueur SEO), qu'il aurait fallu développer de toute façon en greffons.

### Versionner le générateur dans le dépôt publié

- **ALT-005** : **Description** : inclure `maquettes/` et `content/` dans le dépôt Git pour les
  sauvegarder avec le site.
- **ALT-006** : **Raison du rejet** : le dépôt est servi intégralement par GitHub Pages ; les
  brouillons contiennent des informations non validées ou privées (adresse postale, tarifs en
  discussion, notes d'entretien) qui deviendraient publiques. Le confort de sauvegarde ne vaut
  pas cette exposition ; une sauvegarde séparée est préférable.

## Notes de mise en œuvre

- **IMP-001** : Flux de mise à jour : modifier le contenu dans `build_site.py` (jamais dans les
  `.html`), exécuter `python maquettes/build_site.py --publier`, vérifier le diff Git, committer.
- **IMP-002** : Sans `--publier`, le script régénère les cinq maquettes dans `maquettes/site/` et
  `maquettes/modeles/<nom>/` pour comparaison, sans toucher à la racine.
- **IMP-003** : Mettre en place une sauvegarde du dossier `maquettes/` et `content/` hors du
  dépôt public (répond à NEG-001).
- **IMP-004** : Critère de succès : `git status` propre après régénération sans changement de
  contenu ; assertions du script silencieuses à chaque publication.

## Références

- **REF-001** : [ADR-0001](adr-0001-site-statique-sans-framework.md) — le choix du statique que
  ce script rend tenable.
- **REF-002** : [ADR-0004](adr-0004-choix-graphique-maquettes-lin.md) — le processus de maquettes
  multiples permis par ce générateur.
- **REF-003** : `maquettes/build_site.py` (hors dépôt publié) — source unique du site ;
  `README.md` — avertissement contre l'édition manuelle.
