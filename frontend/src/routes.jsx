// Fichier: frontend/src/routes.jsx

import { Home, Profile, SignIn, SignUp } from "@/pages";
import MyPrograms from "./pages/MyPrograms";
import ProgramBuilder from "./pages/admin/ProgramBuilder"; 
import ExerciseList from "./pages/admin/ExerciseList"; 

// Imports pour les Membres
import MemberCreate from "@/pages/admin/MemberCreate";
import MemberDetail from "@/pages/admin/MemberDetail";
import MemberEdit from "@/pages/admin/MemberEdit";
import MemberList from "@/pages/admin/MemberList";

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
  // Routes Admin/Coach
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
  // Routes Membres
  {
    path: "/admin/members",
    element: <MemberList />,
    hidden: true
  },
  {
    path: "/admin/members/create", 
    element: <MemberCreate />,
    hidden: true
  },
  {
    path: "/admin/members/:userId",
    element: <MemberDetail />,
    hidden: true
  },
  {
    path: "/admin/members/:userId/edit",
    element: <MemberEdit />,
    hidden: true
  },
  // Docs
  {
    name: "Docs",
    href: "https://www.material-tailwind.com/docs/react/installation",
    target: "_blank",
    element: "",
  }
];

export default routes;