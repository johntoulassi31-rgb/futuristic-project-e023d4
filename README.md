# Mentoratplus

Mentoratplus est une plateforme pédagogique francophone pour étudiants et enseignants. Elle associe création de projets, tuteur IA Mentora, cours privés, quiz, parcours métier et bibliothèque universitaire partagée.

## Architecture

- **Frontend :** React 19, Vite, Lucide et CSS responsive.
- **Authentification :** Supabase Auth (e-mail / mot de passe).
- **Données :** Supabase PostgreSQL avec Row Level Security (RLS).
- **API privée et IA :** Supabase Edge Function `mentoratplus-api`.
- **IA :** OpenAI `gpt-5.2`, appelée uniquement depuis la fonction Supabase.
- **Application Android :** Capacitor, frontend intégré dans l'APK/AAB et appels réseau vers Supabase.

Le navigateur et l'application Android ne contiennent que l'URL du projet et la clé Supabase **publishable**. Aucune clé secrète Supabase ni clé OpenAI ne doit être ajoutée au code client.

## Développement local

Utiliser Node.js 24 ou supérieur, puis :

```bash
npm install
npm run dev
```

Le frontend utilise le client `@supabase/supabase-js`. Le fichier `src/lib/supabase.js` contient l'URL du projet et sa clé publishable. Les appels métier protégés passent par `supabase.functions.invoke('mentoratplus-api')`.

Pour vérifier le frontend et les règles de sécurité documentées :

```bash
npm run check:server
npm test
npm run build
```

La fonction Edge est dans `supabase/functions/mentoratplus-api/index.ts`. Son déploiement et les migrations SQL sont conservés dans le dépôt.

## Supabase : projet et sécurité

Projet utilisé : `sxarzvozpjyujmyvyqeo` (région eu-west-1).

Migrations versionnées :
- `supabase/migrations/20261124212000_mentoratplus_initial_schema.sql`
- `supabase/migrations/20261124213000_optimize_library_rls_and_indexes.sql`

Tables :
- `profiles` : profil utilisateur et rôle ;
- `projects` : projets créés ;
- `learning_spaces` : parcours et progression ;
- `courses` : cours privés, explications, quiz, tentatives et échanges ;
- `academic_resources` : bibliothèque partagée et modération.

Toutes les tables activent RLS. Les projets, cours et parcours sont limités au compte propriétaire. Les ressources publiées sont consultables publiquement ; les propositions en attente ou refusées ne sont pas visibles dans la bibliothèque. Les propositions et les décisions de modération passent par la fonction Edge, qui vérifie le JWT Supabase et le rôle enregistré dans `profiles`.

Le rôle est défini par le déclencheur SQL à l'inscription. Le formulaire public ne peut attribuer que les rôles étudiant ou enseignant. Le rôle administrateur ne peut pas être choisi par l'utilisateur et doit être attribué par une opération d'administration sécurisée.

## Configuration nécessaire dans Supabase

1. Dans **Authentication → URL Configuration**, définir le Site URL et ajouter l'URL finale du frontend dans les Redirect URLs. Ajouter aussi l'URL locale de développement si nécessaire.
2. Dans **Edge Functions → Secrets**, ajouter `OPENAI_API_KEY` avec la clé API OpenAI du propriétaire du compte. Ne jamais la mettre dans GitHub, dans le frontend ou dans Capacitor.
3. Vérifier que le schéma `public` est exposé à la Data API et que les autorisations SQL de la migration sont conservées.
4. Créer un compte étudiant ou enseignant via l'application. Si la confirmation e-mail est activée, confirmer l'adresse avant la connexion.
5. Pour attribuer le premier rôle administrateur, après inscription du compte concerné, exécuter dans le SQL Editor une commande ciblée de ce type en remplaçant l'adresse :
   `UPDATE public.profiles SET role = 'admin' WHERE email = 'adresse-du-compte';`
   Ne jamais autoriser cette modification depuis l'interface publique.

La fonction Edge est déployée avec la vérification JWT de la passerelle désactivée afin de prendre en charge la clé publishable moderne ; **elle vérifie elle-même le jeton de session avec Supabase Auth avant chaque opération**. Elle utilise une clé secrète côté serveur pour les opérations privilégiées. Ne pas retirer cette vérification manuelle.

## Fonctionnalités

### Projets
Les utilisateurs connectés peuvent transformer une idée en plan d'action, suivre les étapes et exporter le résultat en texte. Les projets sont isolés par propriétaire.

### Mentora
Mentora accepte un cours collé ou un fichier `.txt` (30 à 24 000 caractères), produit une explication, répond aux questions et crée un quiz de cinq questions. Les réponses et scores sont conservés dans le compte. Le PDF n'est pas pris en charge. Les réponses IA doivent être vérifiées avec les supports et références pédagogiques : les consignes de vérification réduisent les erreurs sans garantir leur absence.

### Académie et parcours métier
L'Académie propose des cours de finance et gestion avec exercices corrigés. Les validations de lecture alimentent les parcours analyste financier, comptable et contrôleur de gestion. Ces validations sont pédagogiques et ne sont pas des certifications.

### Bibliothèque universitaire
Les étudiants et visiteurs consultent les ressources publiées et filtrent par pays, établissement, filière, niveau, matière et mot-clé. Les enseignants proposent des ressources qui restent en attente jusqu'à leur validation. Les administrateurs peuvent approuver ou refuser une ressource et signaler une source officielle après vérification effective. Une simple URL ne suffit pas. Les cours importés dans Mentora restent privés et séparés de cette bibliothèque.

Le catalogue académique actuel est une taxonomie de départ, non une liste exhaustive de formations ni un référentiel officiel. Les programmes nationaux devront être enrichis et contrôlés à partir de documents institutionnels datés.

## Hébergement du frontend

Supabase fournit le backend mais n'héberge pas directement l'application React statique. Le dépôt GitHub actuel est privé. Le choix du service de publication du frontend doit donc tenir compte de cette confidentialité : GitHub Pages pour ce dépôt peut nécessiter un plan GitHub compatible ou le rendre public ; un hébergeur statique externe peut conserver le dépôt privé. Ne pas rendre le dépôt public sans autorisation explicite.

## Application Android (APK et AAB)

Capacitor embarque désormais le frontend compilé dans l'application ; le backend est Supabase. L'application nécessite Internet pour l'authentification, les données et les réponses de Mentora. Le workflow Android produit un APK de test. Pour signer une version de distribution, configurer dans **Settings → Secrets and variables → Actions** :
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Conserver une copie sécurisée hors ligne du keystore et réutiliser la même clé pour les mises à jour. Ne jamais déposer le keystore ni ses mots de passe dans le dépôt.

## Migration des anciennes données

Le projet Supabase utilisé pour cette migration était vide avant l'installation du nouveau schéma. Les anciens comptes, cours et progressions enregistrés dans l'ancienne base Netlify ne sont donc pas importés automatiquement. Il faut exporter les données de cette base et effectuer une migration contrôlée si leur conservation est souhaitée. Les anciens mots de passe hachés ne sont pas directement réutilisables par Supabase Auth : les utilisateurs devront créer un nouveau mot de passe ou suivre une procédure de réinitialisation.
