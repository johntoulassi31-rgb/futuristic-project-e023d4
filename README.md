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


## Application Android (APK et AAB)

Le projet Android est préparé automatiquement par GitHub Actions depuis Capacitor. Depuis l'onglet **Actions**, lancer le workflow **Build Android APK and AAB** (ou attendre son déclenchement après une modification concernée). Les fichiers générés sont disponibles dans les artefacts du workflow pendant 30 jours.

Le workflow produit toujours un APK de test. Pour obtenir les fichiers de version signés destinés à la distribution, configurer dans **Settings → Secrets and variables → Actions** les quatre secrets suivants :

- `ANDROID_KEYSTORE_BASE64` : contenu Base64 du fichier keystore de publication.
- `ANDROID_KEYSTORE_PASSWORD` : mot de passe du keystore.
- `ANDROID_KEY_ALIAS` : alias de la clé.
- `ANDROID_KEY_PASSWORD` : mot de passe de la clé.

Conserver une copie hors ligne et sécurisée du keystore. La même clé doit être réutilisée pour toutes les mises à jour de l'application. Ne jamais ajouter le keystore ni ses mots de passe au dépôt.

**Important :** la configuration Capacitor actuelle ouvre le site Netlify distant afin de conserver les routes API et le cookie sécurisé existants. L'application nécessite donc une connexion Internet. Le workflow construit l'enveloppe Android ; il ne transforme pas encore le backend Netlify en backend Supabase et ne rend pas l'application utilisable hors ligne.


## Comptes et profils pédagogiques

Les inscriptions publiques proposent les profils étudiant et enseignant. Les mots de passe sont hachés avec scrypt et les sessions utilisent un cookie HttpOnly, Secure et SameSite=Lax ; les données des anciens espaces invités sont transférées au compte lors de la création du compte. Les rôles administrateur ne sont jamais attribuables depuis le formulaire public et doivent être provisionnés par une procédure réservée à l'exploitation. Les sessions durent 30 jours. La vérification d'adresse e-mail et la récupération autonome de mot de passe restent à mettre en place avant une ouverture à grande échelle.

Le profil pédagogique enregistre le pays, l'établissement, la filière, le niveau et le rôle. Le premier catalogue propose une taxonomie évolutive, avec un démarrage au Togo et des domaines universitaires transversaux. Les établissements et matières listés sont des points de départ de navigation, pas une déclaration d'exhaustivité ni des maquettes officielles validées. Les contenus réglementaires et les programmes officiels devront être accompagnés de références institutionnelles et d'une date de vérification avant d'être signalés comme officiels.

Mentora reçoit le contexte académique du compte et utilise un niveau de raisonnement renforcé, une consigne de vérification des calculs et de relecture linguistique, ainsi que des règles explicites contre l'invention de références et de faits. Cela réduit les erreurs attendues sans garantir l'absence totale d'erreurs ; les réponses doivent rester vérifiées par les supports pédagogiques et les sources officielles.

Les tests automatisés sont lancés avec `npm test`. Le workflow GitHub Actions vérifie les tests et la compilation de production à chaque push sur `main`.

Pour créer le premier administrateur : créer d'abord un compte normal, définir temporairement une variable Netlify `MENTORATPLUS_ADMIN_SETUP_TOKEN` avec une valeur longue et aléatoire, puis appeler une seule fois `POST /api/auth/bootstrap-admin` avec l'en-tête `x-admin-setup-token` et le JSON `{"email":"adresse-du-compte" }`. La route refuse toute promotion dès qu'un administrateur existe. Retirer ensuite la variable Netlify. Ne jamais exposer ce jeton dans le frontend ou dans le dépôt.
