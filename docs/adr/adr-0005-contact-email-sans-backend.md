---
title: "ADR-0005: Contact par e-mail uniquement, sans backend ni traitement de formulaire"
status: "Acceptée"
date: "2026-11-18"
authors: "Adrien Clerbois (développement, avec Claude Code) ; Mélissa Letenre (décideuse)"
tags: ["architecture", "decision", "contact", "vie-privee", "mailto"]
supersedes: ""
superseded_by: ""
---

# ADR-0005 : Contact par e-mail uniquement, sans backend ni traitement de formulaire

## Statut

**Acceptée** — 18 novembre 2026 (entretien avec Mélissa Letenre du même jour).

## Contexte

Le site doit permettre de réserver un soin ou de poser une question. Trois contraintes se
croisent :

- **souhait de la praticienne** : lors de l'entretien du 18 novembre 2026, Mélissa a demandé à
  être contactée **par e-mail uniquement** ; son numéro de téléphone ne doit pas figurer sur le
  site ;
- **architecture** : le site est statique et sans serveur (ADR-0001, ADR-0003) : aucun
  traitement de formulaire n'est possible côté site ;
- **vie privée et maintenance** : un service tiers de formulaires (Formspree, Netlify Forms…)
  ferait transiter les données des demandeurs par un intermédiaire, ajouterait un compte à gérer
  et un maillon qui peut casser ou devenir payant.

## Décision

Le contact passe exclusivement par l'adresse e-mail de Mélissa, affichée en clair sur le site
(pied de page, page contact, barre mobile). Aucun numéro de téléphone n'est publié.

La page `contact.html` propose néanmoins un **formulaire de confort sans backend** : ses champs
(nom, e-mail, soin souhaité, message) servent uniquement à composer localement, dans le
navigateur, un lien `mailto:` avec sujet et corps pré-rédigés (`js/frequences.js`,
`initRequestForm`). Le bouton « Envoyer ma demande » ouvre la messagerie du visiteur avec le
message prêt ; rien n'est transmis ni stocké par le site. Le paramètre d'URL `?soin=…` présélectionne
le soin demandé depuis les boutons des autres pages. Sans JavaScript, le formulaire retombe sur
son attribut `action="mailto:…"` natif.

## Conséquences

### Positives

- **POS-001** : Respect strict du souhait de la praticienne : un seul canal, l'e-mail, pas de
  téléphone exposé au démarchage.
- **POS-002** : Vie privée maximale pour les visiteurs : aucune donnée de formulaire ne transite
  par le site ni par un tiers ; le message part de la messagerie du visiteur vers celle de
  Mélissa, sans intermédiaire.
- **POS-003** : Zéro maintenance et zéro coût : pas de service de formulaires à surveiller, pas
  de quota, pas de spam de formulaire à filtrer côté site.
- **POS-004** : Le formulaire guide tout de même la demande (choix du soin, coordonnées de
  réponse), ce qui structure les e-mails reçus par Mélissa.

### Négatives

- **NEG-001** : Le lien `mailto:` dépend d'une messagerie configurée sur l'appareil du visiteur :
  sur un poste sans client mail (navigateur d'un lieu public, webmail non associé), le bouton
  peut ne rien ouvrir et le visiteur doit copier l'adresse à la main.
- **NEG-002** : L'adresse e-mail affichée en clair est exposée à la collecte par les robots
  spammeurs ; assumé pour rester joignable simplement.
- **NEG-003** : Aucun accusé de réception ni suivi des demandes côté site : si le visiteur
  n'envoie pas l'e-mail ouvert, la demande n'existe nulle part.
- **NEG-004** : L'adresse actuelle (`hotmail.com`) n'est pas au nom du domaine ; une adresse
  `@anahataprajna.be` est envisagée et impliquera une régénération du site.

## Alternatives envisagées

### Service tiers de formulaires (Formspree, Netlify Forms, Web3Forms…)

- **ALT-001** : **Description** : le formulaire poste vers un service externe qui relaie par
  e-mail.
- **ALT-002** : **Raison du rejet** : données des demandeurs (parfois sensibles : état
  émotionnel, santé) confiées à un tiers ; compte et quota à gérer ; gratuité non garantie dans
  le temps. Contraire à l'objectif « vie privée et zéro maintenance ».

### Afficher aussi un numéro de téléphone

- **ALT-003** : **Description** : canal téléphonique classique pour une clientèle locale.
- **ALT-004** : **Raison du rejet** : refus explicite de Mélissa (entretien du 18 novembre
  2026) ; décision réversible si elle change d'avis (le générateur centralise les coordonnées).

### Simple adresse e-mail sans formulaire

- **ALT-005** : **Description** : ne publier que le lien `mailto:` nu.
- **ALT-006** : **Raison du rejet** : demandes reçues sans structure (soin souhaité, coordonnées
  oubliées) ; le formulaire de composition locale apporte cette structure sans rien coûter en
  architecture — il a donc été ajouté en plus, pas à la place.

## Notes de mise en œuvre

- **IMP-001** : L'adresse e-mail est centralisée dans le générateur (`EMAIL` dans
  `build_site.py`) : la future adresse au nom du domaine ne demandera qu'un changement de
  constante et une republication.
- **IMP-002** : Les données structurées (JSON-LD `HealthAndBeautyBusiness`) publient l'e-mail
  mais aucun téléphone, en cohérence avec les pages.
- **IMP-003** : Surveiller le bon fonctionnement du `mailto:` sur mobile (barre mobile
  « Écrire ») ; si le taux de demandes paraît anormalement bas, reconsidérer un service de
  formulaire respectueux de la vie privée.
- **IMP-004** : Critère de succès : Mélissa reçoit des demandes structurées (nom, e-mail de
  réponse, soin souhaité) sans aucune intervention technique.

## Références

- **REF-001** : [ADR-0001](adr-0001-site-statique-sans-framework.md) — l'absence de backend qui
  cadre cette décision.
- **REF-002** : [ADR-0007](adr-0007-javascript-minimal-frequences.md) — `initRequestForm`, la
  partie du script unique qui compose le `mailto:`.
- **REF-003** : Entretien avec Mélissa Letenre du 18 novembre 2026 (contact par e-mail
  uniquement, pas de téléphone sur le site).
