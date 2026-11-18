---
title: "ADR-0003: Hébergement sur GitHub Pages avec le domaine anahataprajna.be"
status: "Acceptée"
date: "2026-11-17"
authors: "Adrien Clerbois (développement, avec Claude Code) ; Mélissa Letenre (commanditaire)"
tags: ["architecture", "decision", "hebergement", "github-pages", "dns"]
supersedes: ""
superseded_by: ""
---

# ADR-0003 : Hébergement sur GitHub Pages avec le domaine anahataprajna.be

## Statut

**Acceptée** — 17 novembre 2026 (commit `cfb8de4`, « Ajout du domaine personnalisé
anahataprajna.be »).

## Contexte

Le site est entièrement statique (ADR-0001) et doit être hébergé sans coût récurrent, avec un
nom de domaine propre et crédible pour une activité professionnelle belge. Le dépôt Git existait
déjà comme support de travail ; l'hébergeur devait :

- servir des fichiers statiques avec HTTPS et un CDN correct ;
- se mettre à jour automatiquement à chaque publication (commit) ;
- accepter un domaine personnalisé ;
- ne rien coûter en fonctionnement (seul le domaine est payant).

## Décision

Le site est hébergé sur **GitHub Pages**, servi depuis la **racine de la branche `main`** du
dépôt. Le domaine personnalisé **`anahataprajna.be`** est déclaré dans le fichier `CNAME` à la
racine ; les adresses canoniques, le sitemap et toutes les URL absolues du site pointent vers
`https://anahataprajna.be/`.

Au moment de la mise en ligne (18 novembre 2026), le certificat HTTPS n'était pas encore émis
par GitHub : son activation (« Enforce HTTPS ») est une étape de suivi bloquante, consignée dans
`maquettes/referencement.md`.

## Conséquences

### Positives

- **POS-001** : Coût nul hors domaine ; pas de serveur à administrer, HTTPS fourni par GitHub
  (Let's Encrypt) une fois le certificat émis.
- **POS-002** : Déploiement confondu avec la gestion de version : publier = pousser sur `main` ;
  l'historique Git est aussi l'historique des mises en ligne, avec retour arrière trivial.
- **POS-003** : Fiabilité et diffusion : GitHub Pages sert via un CDN mondial, largement
  suffisant pour un site vitrine local.
- **POS-004** : Le domaine `.be` ancre l'activité en Belgique (cohérent avec `lang="fr-BE"` et
  les balises géographiques des pages).

### Négatives

- **NEG-001** : Le dépôt doit rester public (ou le compte payant) et tout son contenu est servi
  tel quel : c'est ce qui impose d'exclure sources et brouillons du dépôt (voir ADR-0002,
  `.gitignore`).
- **NEG-002** : Dépendance à un service propriétaire gratuit, sans garantie contractuelle de
  disponibilité ; atténué par la portabilité totale des fichiers statiques (POS-004 de
  l'ADR-0001).
- **NEG-003** : Aucune configuration serveur possible : pas d'en-têtes HTTP personnalisés, pas de
  redirections 301 (la page 404 générée sert de filet, avec `noindex`).
- **NEG-004** : HTTPS non actif à la mise en ligne : tant que le certificat n'est pas émis et
  forcé, les URL canoniques en `https://` ne sont pas servies de façon sûre — point bloquant
  pour le référencement.

## Alternatives envisagées

### Hébergeur mutualisé classique (OVH, Combell…)

- **ALT-001** : **Description** : hébergement web payant avec FTP, PHP et messagerie.
- **ALT-002** : **Raison du rejet** : coût annuel récurrent pour des capacités (PHP, base de
  données) dont le site n'a pas besoin ; déploiement manuel moins traçable que Git.

### Netlify ou Cloudflare Pages

- **ALT-003** : **Description** : plateformes statiques gratuites, avec redirections, en-têtes
  personnalisés et formulaires (Netlify Forms).
- **ALT-004** : **Raison du rejet** : capacités supplémentaires sans besoin identifié (le contact
  se fait par e-mail, ADR-0005) ; GitHub Pages évite un service de plus alors que le dépôt est
  déjà sur GitHub. Reste une option de repli documentée si les limites de Pages (NEG-003)
  devenaient gênantes.

### Sous-domaine gratuit (username.github.io) sans domaine propre

- **ALT-005** : **Description** : utiliser l'adresse GitHub par défaut, sans frais de domaine.
- **ALT-006** : **Raison du rejet** : crédibilité insuffisante pour une activité professionnelle,
  adresse impossible à communiquer oralement, et référencement local pénalisé ; le domaine `.be`
  est le seul coût assumé du projet.

## Notes de mise en œuvre

- **IMP-001** : DNS du domaine pointé vers GitHub Pages ; le fichier `CNAME` à la racine est
  régénéré/conservé à chaque publication (ne pas le supprimer lors d'un nettoyage).
- **IMP-002** : Activer « Enforce HTTPS » dans les réglages GitHub Pages dès que le certificat
  est émis (point bloquant n° 1 de `maquettes/referencement.md`).
- **IMP-003** : Déclarer le site dans Google Search Console et Bing Webmaster Tools, et y
  soumettre `sitemap.xml` (suivi du référencement, voir ADR-0006).
- **IMP-004** : Critère de succès : `https://anahataprajna.be/` servi avec certificat valide et
  redirection depuis `http://` et depuis l'adresse `*.github.io`.

## Références

- **REF-001** : [ADR-0001](adr-0001-site-statique-sans-framework.md) — le statique qui rend cet
  hébergement possible.
- **REF-002** : [ADR-0006](adr-0006-referencement-seo-et-llms.md) — stratégie de référencement
  s'appuyant sur ce domaine.
- **REF-003** : `CNAME`, `maquettes/referencement.md` (section « Bloquant ») — état et étapes
  restantes au 17 novembre 2026.
