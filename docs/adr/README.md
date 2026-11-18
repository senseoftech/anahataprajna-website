# Architectural Decision Records — Anahata Prajñā

Ce dossier rassemble les décisions d'architecture du site <https://anahataprajna.be/>, site
vitrine de l'activité de chant d'ancrage et de chant vibratoire de Mélissa Letenre (Thuin et
Beaumont, Belgique). Chaque ADR décrit une décision, son contexte, ses conséquences et les
alternatives écartées.

## Index des ADR

| N° | Décision | Statut | Date |
| --- | --- | --- | --- |
| [ADR-0001](adr-0001-site-statique-sans-framework.md) | Site 100 % statique, sans framework ni générateur tiers | Acceptée | 2026-11-17 |
| [ADR-0002](adr-0002-generation-par-script-python.md) | Génération des pages par un script Python maison (`build_site.py`) | Acceptée | 2026-11-18 |
| [ADR-0003](adr-0003-hebergement-github-pages-domaine.md) | Hébergement sur GitHub Pages avec le domaine anahataprajna.be | Acceptée | 2026-11-17 |
| [ADR-0004](adr-0004-choix-graphique-maquettes-lin.md) | Choix graphique par maquettes multiples, modèle « Lin » retenu | Acceptée | 2026-11-18 |
| [ADR-0005](adr-0005-contact-email-sans-backend.md) | Contact par e-mail uniquement, sans backend ni traitement de formulaire | Acceptée | 2026-11-18 |
| [ADR-0006](adr-0006-referencement-seo-et-llms.md) | Référencement : données structurées, fichiers classiques et `llms.txt` pour les assistants IA | Acceptée | 2026-11-17 |
| [ADR-0007](adr-0007-javascript-minimal-frequences.md) | JavaScript minimal : un seul fichier d'agrément, sans dépendance, jamais indispensable | Acceptée | 2026-11-18 |

## En une phrase chacune

- **ADR-0001** — Des fichiers HTML/CSS/JS purs, sans CMS ni framework : coût nul, sécurité,
  pérennité.
- **ADR-0002** — Un script Python unique (hors dépôt publié) génère pages, JSON-LD, sitemap,
  `llms.txt` et publie le modèle retenu via `--publier`, avec garde-fous anti-brouillon.
- **ADR-0003** — GitHub Pages sert la racine de `main` sous `anahataprajna.be` (fichier `CNAME`) ;
  publier = pousser un commit.
- **ADR-0004** — Cinq maquettes complètes (terre, lotus, spectre, nuit, lin) sur le même contenu ;
  Mélissa a retenu « Lin » (beige et taupe).
- **ADR-0005** — Contact par e-mail uniquement, pas de téléphone ; le « formulaire » compose un
  `mailto:` dans le navigateur, rien ne transite par le site.
- **ADR-0006** — Référencement généré : balises contrôlées, JSON-LD, `robots.txt` ouvert aux
  robots IA, `sitemap.xml`, `llms.txt`/`llms-full.txt`.
- **ADR-0007** — Un seul fichier JavaScript (`js/frequences.js`), vanilla : figures de Chladni,
  bol chantant Web Audio, formulaire `mailto:`, le tout en amélioration progressive.

## Conventions

- Fichiers nommés `adr-NNNN-sujet-en-bref.md`, numérotation séquentielle.
- Statuts possibles : Proposée, Acceptée, Rejetée, Remplacée, Obsolète.
- Une décision ne se modifie pas après acceptation : une nouvelle décision la remplace
  (champs `supersedes` / `superseded_by` du front matter).
- Les ADR sont rédigées en français, langue du projet.

> Note : le dossier `docs/` est publié avec le reste du dépôt par GitHub Pages ; ces ADR sont
> donc publiques. Ne pas y consigner d'information privée (coordonnées non validées, notes
> d'entretien).
