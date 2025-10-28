// filename: ProgramBuilder.jsx

import React from 'react';
import { Typography } from "@material-tailwind/react";

// 💡 EXPORT PAR DÉFAUT pour résoudre l'erreur "does not provide an export named 'default'"
export default function ProgramBuilder() {
    return (
        <div className="p-8 container mx-auto">
            <Typography variant="h3" color="blue-gray" className="mb-6">
                Création de Programme d'Entraînement (Sprint 3)
            </Typography>
            <Typography variant="paragraph" color="gray">
                Ici, vous implémenterez le formulaire complexe pour assigner un programme à un membre, 
                définir ses dates et ajouter/modifier les séances ({`Training.ProgramDetail`}).
            </Typography>
        </div>
    );
}