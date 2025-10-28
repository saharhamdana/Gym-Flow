// filename: ExerciseList.jsx

import React from 'react';
import { Typography } from "@material-tailwind/react";

// 💡 EXPORT PAR DÉFAUT pour résoudre l'erreur "does not provide an export named 'default'"
export default function ExerciseList() {
    return (
        <div className="p-8 container mx-auto">
            <Typography variant="h3" color="blue-gray" className="mb-6">
                Administration des Exercices (Sprint 3)
            </Typography>
            <Typography variant="paragraph" color="gray">
                Ici, vous implémenterez le tableau CRUD pour ajouter, modifier et supprimer les exercices de base ({`Training.Exercise`}).
            </Typography>
        </div>
    );
}