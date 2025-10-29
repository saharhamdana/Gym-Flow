// Fichier: frontend/src/routes.jsx

import { Home, Profile, SignIn, SignUp } from "@/pages";
import MyPrograms from "./pages/MyPrograms";
// 💡 Composants à créer pour les routes Admin/Coach
import ProgramBuilder from "./pages/admin/ProgramBuilder"; 
import ExerciseList from "./pages/admin/ExerciseList"; 
// 🌟 NOUVEAUX IMPORTS POUR MEMBERS
import MemberList from "./pages/admin/MemberList";
import MemberDetail from "./pages/admin/MemberDetail"; 


export const routes = [
  {
    name: "home",
    path: "/", 
    element: <Home />,
  },
  {
    name: "profile",
    path: "/profile",
    element: <Profile />,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },
  { 
    name: "Mes Programmes",
    path: "/my-programs",
    element: <MyPrograms />,
  },
  // 🌟 NOUVELLES ROUTES ADMIN/COACH/RÉCEPTIONNISTE POUR LA GESTION DES MEMBRES
  { 
    name: "Gestion Membres",
    path: "/admin/members",
    element: <MemberList />,
  },
  { 
    name: "Détails Membre",
    // Route dynamique : le paramètre correspond à MemberProfile.user.pk
    path: "/admin/members/:userId", 
    element: <MemberDetail />,
    hidden: true 
  },
  // AUTRES ROUTES ADMIN/COACH (existantes)
  { 
    name: "Créer Programme",
    path: "/admin/programs/create",
    element: <ProgramBuilder />,
  },
  { 
    name: "Gérer Exercices",
    path: "/admin/exercises",
    element: <ExerciseList />,
  },
  {
    name: "Docs",
    href: "https://www.material-tailwind.com/docs/react/installation",
    target: "_blank",
    element: "",
  },
];

export default routes;