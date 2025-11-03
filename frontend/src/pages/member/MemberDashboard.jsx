import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Typography } from "@material-tailwind/react";

const MemberDashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Vérifier si l'utilisateur est un membre
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'MEMBER') {
            navigate('/sign-in');
        }
    }, [navigate]);

    return (
        <Card>
            <CardBody>
                <Typography variant="h4" style={{ color: "#00357a" }} className="mb-4">
                    Bienvenue sur votre espace membre
                </Typography>
                <Typography style={{ color: "#9b0e16" }}>
                    Accédez à vos programmes, réservations et suivez vos progrès.
                </Typography>
            </CardBody>
        </Card>
    );
};

export default MemberDashboard;