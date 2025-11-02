import React from "react";
// 🎯 Import de Card, CardHeader, CardBody, et Typography pour le style
import { Card, CardHeader, CardBody, Typography } from "@material-tailwind/react"; 
import UserCreate from "@/components/admin/UserCreate";

export function UserCreatePage() {
  return (
    // 🎯 Structure de layout cohérente
    <div className="mt-12 mb-8 flex flex-col gap-12">
        <Card className="mx-3">
            {/* 🎯 CardHeader stylisé pour la création */}
            <CardHeader
                variant="gradient"
                style={{ background: 'linear-gradient(87deg, #00357a 0, #0056b3 100%)' }}
                className="mb-8 p-6"
            >
                <Typography variant="h6" color="white">
                    Création d'un Nouvel Employé
                </Typography>
            </CardHeader>
            <CardBody className="p-6"> 
                <UserCreate /> 
            </CardBody>
        </Card>
    </div>
  );
}

export default UserCreatePage; // 🎯 Export du composant de page