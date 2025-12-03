// Fichier: frontend/src/pages/receptionist/members/MembersList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Chip,
  Avatar,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  QrCodeIcon,
} from "@heroicons/react/24/solid";
import api from '@/api/axiosInstance';

const MembersList = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showQRDialog, setShowQRDialog] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('members/');
      setMembers(response.data);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member =>
    member.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.member_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'PENDING': return 'amber';
      default: return 'gray';
    }
  };

  const handleShowQR = (member) => {
    setSelectedMember(member);
    setShowQRDialog(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Typography variant="h3" color="blue-gray" className="font-bold">
            Gestion des Membres
          </Typography>
          <Typography className="text-gray-600">
            {members.length} membre(s) au total
          </Typography>
        </div>
        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={() => navigate('/receptionist/members/create')}
        >
          <PlusIcon className="h-5 w-5" />
          Nouveau Membre
        </Button>
      </div>

      {/* Barre de recherche */}
      <Card>
        <CardBody className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                label="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Button
              variant="outlined"
              onClick={() => setSearchTerm('')}
            >
              Effacer
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Liste des membres */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      Membre
                    </Typography>
                  </th>
                  <th className="p-4 text-left">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      ID
                    </Typography>
                  </th>
                  <th className="p-4 text-left">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      Statut
                    </Typography>
                  </th>
                  <th className="p-4 text-left">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      Abonnement
                    </Typography>
                  </th>
                  <th className="p-4 text-left">
                    <Typography variant="small" color="blue-gray" className="font-bold">
                      Actions
                    </Typography>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member, index) => (
                  <tr
                    key={member.id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={member.photo || '/img/default-avatar.png'}
                          alt={member.first_name}
                          size="sm"
                        />
                        <div>
                          <Typography variant="small" color="blue-gray" className="font-bold">
                            {member.first_name} {member.last_name}
                          </Typography>
                          <Typography variant="small" className="text-gray-600">
                            {member.email}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" className="font-mono">
                        {member.member_id}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Chip
                        value={member.status}
                        color={getStatusColor(member.status)}
                        size="sm"
                      />
                    </td>
                    <td className="p-4">
                      {member.has_active_subscription ? (
                        <Chip value="Actif" color="green" size="sm" />
                      ) : (
                        <Chip value="Aucun" color="red" size="sm" />
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="text"
                          color="blue"
                          onClick={() => navigate(`/receptionist/members/${member.id}`)}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="text"
                          color="purple"
                          onClick={() => handleShowQR(member)}
                        >
                          <QrCodeIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <Typography variant="h6" color="gray" className="mb-2">
                Aucun membre trouvé
              </Typography>
              <Typography variant="small" color="gray">
                {searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par ajouter un membre'}
              </Typography>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Dialog QR Code */}
      <Dialog open={showQRDialog} handler={setShowQRDialog}>
        <DialogHeader>QR Code du Membre</DialogHeader>
        <DialogBody>
          {selectedMember && (
            <div className="text-center space-y-4">
              <Avatar
                src={selectedMember.photo || '/img/default-avatar.png'}
                alt={selectedMember.first_name}
                size="xl"
                className="mx-auto"
              />
              <Typography variant="h5">
                {selectedMember.first_name} {selectedMember.last_name}
              </Typography>
              <Typography variant="small" className="text-gray-600">
                {selectedMember.member_id}
              </Typography>

              {/* Placeholder pour QR Code - À implémenter avec une librairie QR */}
              <div className="bg-gray-100 p-8 rounded-lg inline-block">
                <Typography variant="small" className="text-gray-500">
                  QR Code: {selectedMember.member_id}
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="red" onClick={() => setShowQRDialog(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MembersList;