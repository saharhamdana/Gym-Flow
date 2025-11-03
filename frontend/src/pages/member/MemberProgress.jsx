import React from 'react';
import { Card, CardBody, Typography } from "@material-tailwind/react";

const MemberProgress = () => {
    return (
        <Card>
            <CardBody>
                <Typography variant="h4" style={{ color: "#00357a" }} className="mb-4">
                    Mon Progrès
                </Typography>
                {/* Ici vous pouvez ajouter des graphiques, tableaux de progression, etc. */}
                <Typography style={{ color: "#9b0e16" }}>
                    Suivez votre évolution et vos performances.
                </Typography>
            </CardBody>
        </Card>
    );
};

export default MemberProgress;