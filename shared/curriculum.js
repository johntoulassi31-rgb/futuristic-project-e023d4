export const studyLevels = [
  { id: 'bts', label: 'BTS / DUT' },
  { id: 'licence-1', label: 'Licence 1 (L1)' },
  { id: 'licence-2', label: 'Licence 2 (L2)' },
  { id: 'licence-3', label: 'Licence 3 (L3)' },
  { id: 'master-1', label: 'Master 1 (M1)' },
  { id: 'master-2', label: 'Master 2 (M2)' },
  { id: 'doctorat', label: 'Doctorat' },
  { id: 'formation-pro', label: 'Formation professionnelle' },
  { id: 'enseignant', label: 'Enseignant' },
];

export const countries = [
  { id: 'TG', label: 'Togo', institutions: ['Université de Lomé', 'Université de Kara', 'Autre établissement'] },
  { id: 'BJ', label: 'Bénin', institutions: ['Université d’Abomey-Calavi', 'Université de Parakou', 'Autre établissement'] },
  { id: 'CI', label: "Côte d’Ivoire", institutions: ['Université Félix Houphouët-Boigny', 'Université Nangui Abrogoua', 'Autre établissement'] },
  { id: 'SN', label: 'Sénégal', institutions: ['Université Cheikh Anta Diop', 'Université Gaston Berger', 'Autre établissement'] },
  { id: 'FR', label: 'France', institutions: ['Autre établissement'] },
  { id: 'OTHER', label: 'Autre pays', institutions: ['Autre établissement'] },
];

export const studyFields = [
  { id: 'gestion-marketing', label: 'Gestion, économie et marketing', subjects: ['Comptabilité générale', 'Économie générale', 'Microéconomie', 'Macroéconomie', 'Marketing fondamental', 'Management', 'Statistiques', 'Mathématiques financières', 'Droit des affaires', 'Finance', 'Contrôle de gestion'] },
  { id: 'droit-sciences-politiques', label: 'Droit et sciences politiques', subjects: ['Introduction au droit', 'Droit constitutionnel', 'Droit civil', 'Droit administratif', 'Droit pénal', 'Droit des affaires', 'Relations internationales', 'Science politique'] },
  { id: 'sante-medecine', label: 'Santé et médecine', subjects: ['Anatomie', 'Physiologie', 'Biologie cellulaire', 'Biochimie', 'Santé publique', 'Pharmacologie', 'Sémiologie'] },
  { id: 'sciences-vie-terre', label: 'Sciences de la vie et de la Terre', subjects: ['Biologie cellulaire', 'Génétique', 'Écologie', 'Géologie', 'Biochimie', 'Physiologie végétale'] },
  { id: 'sciences-physiques', label: 'Sciences physiques et mathématiques', subjects: ['Analyse', 'Algèbre', 'Probabilités', 'Statistiques', 'Mécanique', 'Électricité', 'Thermodynamique', 'Optique'] },
  { id: 'informatique-numerique', label: 'Informatique et numérique', subjects: ['Algorithmique', 'Programmation', 'Bases de données', 'Réseaux', 'Systèmes', 'Développement web', 'Cybersécurité', 'Intelligence artificielle'] },
  { id: 'lettres-langues', label: 'Lettres, langues et communication', subjects: ['Littérature', 'Linguistique', 'Grammaire', 'Expression écrite', 'Communication', 'Traduction', 'Méthodologie universitaire'] },
  { id: 'sciences-humaines', label: 'Sciences humaines et sociales', subjects: ['Sociologie', 'Psychologie', 'Histoire', 'Géographie', 'Anthropologie', 'Démographie', 'Méthodes de recherche'] },
  { id: 'ingenierie', label: 'Ingénierie et technologie', subjects: ['Mathématiques appliquées', 'Mécanique', 'Électronique', 'Électricité', 'Résistance des matériaux', 'Automatique', 'Gestion de projet'] },
  { id: 'arts-design', label: 'Arts, design et audiovisuel', subjects: ['Histoire de l’art', 'Dessin', 'Design graphique', 'Culture visuelle', 'Photographie', 'Production audiovisuelle'] },
  { id: 'agronomie', label: 'Agronomie et environnement', subjects: ['Agronomie générale', 'Pédologie', 'Phytotechnie', 'Zootechnie', 'Économie rurale', 'Gestion environnementale'] },
  { id: 'education', label: 'Sciences de l’éducation', subjects: ['Psychologie de l’éducation', 'Pédagogie', 'Didactique', 'Évaluation des apprentissages', 'Gestion de classe', 'Ingénierie pédagogique'] },
];

export const getCountry = id => countries.find(item => item.id === id);
export const getField = id => studyFields.find(item => item.id === id);
