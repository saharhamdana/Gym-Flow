import React from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";

const MemberBookings = () => {
    return (
        <Card>
            <CardBody>
                <Typography variant="h4" style={{ color: "#00357a" }} className="mb-4">
                    Mes Réservations
                </Typography>
                {/* Ici vous pouvez ajouter la liste des réservations */}
                <Typography style={{ color: "#9b0e16" }}>
                    Gérez vos réservations de cours et sessions.
                </Typography>
            </CardBody>
        </Card>
    );
};

export default MemberBookings;