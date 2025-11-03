import {
  UsersIcon,       // Pour la Gestion des Membres et Rôles
  CalendarDaysIcon, // Pour l'Agenda et les Réservations
  ChartBarIcon,     // Pour le Suivi de Performance et Coaching
  CreditCardIcon,   // Pour les Abonnements et Paiements
  FingerPrintIcon, // Nouvelle icône pour l'accès/le mobile
} from "@heroicons/react/24/solid";

// Données des fonctionnalités de la page d'accueil, orientées utilisateur
export const featuresData = [
  {
    color: "blue",
    title: "Portail Membre 100% Mobile",
    icon: FingerPrintIcon, 
    description:
      "Accès sécurisé et simple à votre planning, vos programmes d'entraînement et votre historique de performance, directement sur smartphone.",
  },
  {
    color: "red",
    title: "Agenda & Réservations en Temps Réel",
    icon: CalendarDaysIcon,
    description:
      "Planification, modification et annulation faciles des cours collectifs et sessions de coaching. Calendrier visible par coach et par salle.",
  },
  {
    color: "teal",
    title: "Coaching Personnalisé & Suivi",
    icon: ChartBarIcon,
    description:
      "Création de programmes d'entraînement sur mesure par les coachs, fiches de progrès détaillées et possibilité d'export PDF pour les membres.",
  },
  {
    color: "orange",
    title: "Abonnements & Paiement en Ligne",
    icon: CreditCardIcon,
    description:
      "Renouvelez vos abonnements et consultez votre historique de facturation directement depuis votre espace. Intégration de Stripe pour le paiement sécurisé.",
  },
];

export default featuresData;