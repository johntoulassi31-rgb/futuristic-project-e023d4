# Mentoratplus

Mentoratplus est un assistant de projets pédagogique en français destiné aux étudiants et aux enseignants. Il transforme une idée en objectif et en étapes réalisables avec l’IA, puis permet de suivre les étapes et d’exporter le plan en texte. Des exemples interdisciplinaires et des fiches méthodologiques accompagnent la découverte.

## Technologies

React 19, Vite, Lucide, CSS responsive, Hono sur Netlify Server, OpenAI via Netlify AI Gateway, Netlify Database et Drizzle ORM (version beta).

## Développement local

Utiliser Node.js 24 ou supérieur, puis `npm install`. Avec le projet Netlify lié et la CLI disponible, lancer `netlify dev --port 8889`. Le frontend utilise Vite et les routes `/api/*` sont servies par Netlify Server. Une première mise en production est nécessaire pour activer AI Gateway. Aucun secret ne doit être ajouté au code ou au navigateur.

`npm run build` prépare le frontend dans `dist`. Le déploiement Netlify détecte le serveur et applique les migrations présentes dans `netlify/database/migrations`. Après une modification de `db/schema.ts`, générer une migration avec `npx drizzle-kit generate --name description_de_la_modification` ; ne pas appliquer les migrations manuellement.

## Fonctionnement

Les projets sont isolés par un identifiant aléatoire conservé dans un cookie sécurisé HttpOnly. Cet espace personnel n’est pas un compte utilisateur et ne se synchronise pas entre appareils. Effacer ce cookie fait perdre l’accès à l’espace. Les exemples sont identifiés et ne modifient pas les projets personnels. Les plans de l’IA doivent être relus et vérifiés. Ne pas y inclure d’informations personnelles d’élèves.


## Apprentissage et parcours métier

Mentora accepte un cours collé ou un fichier `.txt` (30 à 24 000 caractères). Les explications, questions-réponses, quiz à cinq questions et simulations de journées types utilisent la connexion IA existante avec `gpt-5.2`, sans clé à saisir dans le navigateur. Les réponses sont envoyées en NDJSON et enregistrées avant affichage. Le PDF n’est pas pris en charge.

L’Académie propose cinq cours de finance et gestion avec exercices corrigés. La fin de lecture est déclarée par la personne : elle valide la compétence associée dans les parcours analyste financier, comptable ou contrôleur de gestion. Ces validations sont pédagogiques et ne sont pas des certifications. L’accueil montre la progression du métier sélectionné. Le bouton d’ajout au portfolio enregistre un instantané du parcours ; un nouvel ajout actualise cet instantané. Une exportation texte est disponible.

Les cours, réponses, quiz, trente derniers scores par cours, vingt derniers échanges, progression et portfolio sont stockés dans Netlify Database, filtrés par propriétaire. Ils ne sont pas stockés dans localStorage. Le cookie d’espace existant est conservé pour préserver l’accès aux anciens projets. Aucun compte ni communauté partagée n’a été ajouté. La nouvelle migration est appliquée par la plateforme au déploiement.

Les tests de routes avec base et IA simulées se lancent avec `node --experimental-vm-modules --test tests/learning.test.mjs`.
