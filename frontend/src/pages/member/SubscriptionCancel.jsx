// frontend/src/pages/member/SubscriptionCancel.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { 
  XCircleIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/solid";

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <MemberLayout>
      <div className="max-w-2xl mx-auto py-8">
        {/* Icon */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <XCircleIcon className="h-16 w-16 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Message principal */}
        <Card className="mb-6">
          <CardBody className="text-center py-8">
            <Typography variant="h3" className="mb-4" style={{ color: '#00357a' }}>
              Paiement Annulé
            </Typography>
            <Typography variant="lead" color="gray" className="mb-2">
              Votre paiement n'a pas été effectué
            </Typography>
            <Typography variant="small" color="gray">
              Aucun montant n'a été débité de votre compte
            </Typography>
          </CardBody>
        </Card>

        {/* Informations */}
        <Card className="mb-6 bg-orange-50">
          <CardBody>
            <div className="flex items-start gap-4">
              <QuestionMarkCircleIcon className="h-8 w-8 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
                  Que s'est-il passé ?
                </Typography>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Vous avez annulé le paiement volontairement</p>
                  <p>• Le délai de paiement a expiré</p>
                  <p>• Une erreur technique s'est produite</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Raisons communes */}
        <Card className="mb-6">
          <CardBody>
            <Typography variant="h6" className="mb-4" style={{ color: '#00357a' }}>
              💡 Besoin d'aide ?
            </Typography>
            
            <div className="space-y-4">
              <div>
                <Typography variant="small" className="font-semibold mb-2">
                  Problème avec votre carte bancaire ?
                </Typography>
                <Typography variant="small" color="gray">
                  Vérifiez que votre carte est valide et possède suffisamment de fonds. 
                  Contactez votre banque si le problème persiste.
                </Typography>
              </div>

              <div>
                <Typography variant="small" className="font-semibold mb-2">
                  Vous préférez un autre moyen de paiement ?
                </Typography>
                <Typography variant="small" color="gray">
                  Contactez notre réception pour effectuer un paiement en espèces, 
                  par chèque ou virement bancaire.
                </Typography>
              </div>

              <div>
                <Typography variant="small" className="font-semibold mb-2">
                  Questions sur les abonnements ?
                </Typography>
                <Typography variant="small" color="gray">
                  Notre équipe est disponible pour vous aider à choisir le plan 
                  qui vous convient le mieux.
                </Typography>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            className="flex items-center justify-center gap-2"
            style={{ backgroundColor: '#00357a' }}
            onClick={() => navigate('/portal/subscription/plans')}
          >
            <CreditCardIcon className="h-5 w-5" />
            Réessayer le paiement
          </Button>
          
          <Button
            size="lg"
            variant="outlined"
            className="flex items-center justify-center gap-2"
            onClick={() => navigate('/portal/dashboard')}
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Retour au tableau de bord
          </Button>
        </div>

        {/* Contact */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <Typography variant="small" color="gray">
            📞 Besoin d'assistance ? Contactez-nous au{' '}
            <span className="font-semibold" style={{ color: '#00357a' }}>
              +216 XX XXX XXX
            </span>
          </Typography>
        </div>
      </div>
    </MemberLayout>
  );
};

export default SubscriptionCancel;