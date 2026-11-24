# Architecture

Orbia est une application pédagogique francophone. Le frontend React/Vite est statique et le backend Hono tourne sur Netlify Server. Ne pas ajouter de framework SSR ni de réécriture globale qui intercepterait `/api/*`.

- `src/main.jsx` : tableau de bord, filtres, exemples, ressources, formulaires et modales.
- `src/styles.css` : identité visuelle, illustration orbitale en CSS, responsive et réduction des animations.
- `netlify/server/index.mjs` : session anonyme, création IA, liste et progression des projets.
- `db/schema.ts` et `db/index.ts` : schéma et connexion Drizzle / Netlify Database.
- `netlify/database/migrations` : migrations générées, appliquées par la plateforme.
- `public` : favicon.

# Conventions

Interface et erreurs en français. Couleurs indigo, sauge et citron désaturé ; polices Manrope et DM Sans. Conserver des états de chargement, d’erreur et de liste vide. Les exemples restent clairement identifiés et en lecture seule, avec création d’une version personnelle via l’IA. Les contenus générés sont affichés comme texte React, jamais en HTML brut.

# Décisions

L’espace est lié à un cookie HttpOnly sécurisé et SameSite=Lax, sans compte ni collaboration. Toutes les lectures et modifications sont filtrées par propriétaire côté serveur. Les mises à jour d’étapes utilisent une transaction et un verrou pour éviter les mises à jour concurrentes perdues. Ne jamais mettre de données persistantes en mémoire ou dans localStorage. Ne pas ajouter d’accès aux projets à partir d’un identifiant sans vérifier le propriétaire.

La création transmet immédiatement des en-têtes NDJSON avant l’appel IA pour respecter la limite de délai des en-têtes serveur. Le plan est validé puis enregistré avant d’être renvoyé. Le modèle `gpt-5.2` utilise le SDK officiel avec configuration automatique AI Gateway. Lire le guide AI Gateway avant tout changement de modèle. Ne pas afficher d’erreurs brutes du fournisseur.

Utiliser Drizzle ORM et Drizzle Kit avec le dist-tag beta pour leur adaptateur Netlify. Générer les migrations après toute modification du schéma et ne jamais les appliquer manuellement. Le runtime serveur nécessite Node 24. Les builds sont validés par la plateforme.
