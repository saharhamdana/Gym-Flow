// frontend/src/pages/superadmin/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardBody, 
  Typography, 
  Button, 
  Chip,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Textarea,
  Select,
  Option,
  IconButton,
  Spinner,
  Alert
} from "@material-tailwind/react";
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  CogIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/solid";
import api from '@/api/axiosInstance';

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("gyms");
  const [gyms, setGyms] = useState([]);
  const [staff, setStaff] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals
  const [gymModal, setGymModal] = useState(false);
  const [editingGym, setEditingGym] = useState(null);
  
  // Forms
  const [gymForm, setGymForm] = useState({
    name: '',
    subdomain: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    owner: '' // ID du propriétaire (Admin)
  });

  const [availableAdmins, setAvailableAdmins] = useState([]);

  useEffect(() => {
    fetchData();
    fetchAvailableAdmins();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // ✅ Appel API réel pour les salles
      const gymsResponse = await api.get('/superadmin/gyms/');
      const gymsData = Array.isArray(gymsResponse.data) 
        ? gymsResponse.data 
        : gymsResponse.data.results || [];
      setGyms(gymsData);
      
      // ✅ Appel API réel pour les statistiques
      const statsResponse = await api.get('/superadmin/gyms/statistics/');
      setStatistics(statsResponse.data);
      
      // ✅ Appel API réel pour le personnel
      const staffResponse = await api.get('/superadmin/staff/');
      const staffData = Array.isArray(staffResponse.data) 
        ? staffResponse.data 
        : staffResponse.data.results || [];
      setStaff(staffData);
      
      setError(null);
    } catch (err) {
      console.error('❌ Erreur chargement:', err);
      setError('Impossible de charger les données. Vérifiez que vous êtes connecté en tant que superadmin.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableAdmins = async () => {
    try {
      const response = await api.get('/auth/users/?role=ADMIN');
      const admins = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      setAvailableAdmins(admins);
    } catch (err) {
      console.error('❌ Erreur chargement admins:', err);
    }
  };

  const handleCreateGym = async () => {
    try {
      if (!gymForm.owner) {
        alert('⚠️ Veuillez sélectionner un propriétaire (Admin)');
        return;
      }

      // ✅ Appel API réel
      await api.post('/superadmin/gyms/', {
        ...gymForm,
        owner: parseInt(gymForm.owner)
      });
      
      setGymModal(false);
      setGymForm({
        name: '',
        subdomain: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        owner: ''
      });
      fetchData();
    } catch (err) {
      console.error('❌ Erreur création:', err);
      alert('Erreur lors de la création de la salle: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleEditGym = async () => {
    try {
      await api.patch(`/superadmin/gyms/${editingGym.id}/`, {
        ...gymForm,
        owner: parseInt(gymForm.owner)
      });
      
      setGymModal(false);
      setEditingGym(null);
      setGymForm({
        name: '',
        subdomain: '',
        email: '',
        phone: '',
        address: '',
        description: '',
        owner: ''
      });
      fetchData();
    } catch (err) {
      console.error('❌ Erreur modification:', err);
      alert('Erreur lors de la modification: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleDeleteGym = async (gymId) => {
    if (!window.confirm('⚠️ Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    
    try {
      await api.delete(`/superadmin/gyms/${gymId}/`);
      fetchData();
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (gymId, currentStatus) => {
    try {
      await api.post(`/superadmin/gyms/${gymId}/toggle_status/`);
      fetchData();
    } catch (err) {
      console.error('❌ Erreur changement statut:', err);
      alert('Erreur lors du changement de statut');
    }
  };

  const openEditModal = (gym) => {
    setEditingGym(gym);
    setGymForm({
      name: gym.name,
      subdomain: gym.subdomain,
      email: gym.email,
      phone: gym.phone,
      address: gym.address || '',
      description: gym.description || '',
      owner: gym.owner?.toString() || ''
    });
    setGymModal(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Spinner color="blue" className="h-12 w-12 mb-4" />
        <Typography variant="h5" color="blue-gray">Chargement du tableau de bord...</Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h3" color="blue-gray" className="font-bold mb-2">
              🎯 Super Admin Dashboard
            </Typography>
            <Typography variant="small" className="text-gray-600">
              Gestion centralisée de toutes les salles de sport
            </Typography>
          </div>
          <Button
            onClick={fetchData}
            variant="outlined"
            className="flex items-center gap-2"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Actualiser
          </Button>
        </div>
      </div>

      {error && (
        <Alert color="red" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Statistiques */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-700 shadow-xl">
            <CardBody className="text-center text-white">
              <Typography variant="h2" className="font-bold">
                {statistics.total_gyms || 0}
              </Typography>
              <Typography variant="small">
                Salles de Sport
              </Typography>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-700 shadow-xl">
            <CardBody className="text-center text-white">
              <Typography variant="h2" className="font-bold">
                {statistics.active_gyms || 0}
              </Typography>
              <Typography variant="small">
                Salles Actives
              </Typography>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-700 shadow-xl">
            <CardBody className="text-center text-white">
              <Typography variant="h2" className="font-bold">
                {staff.length || 0}
              </Typography>
              <Typography variant="small">
                Personnel Total
              </Typography>
            </CardBody>
          </Card>
          
          <Card className="bg-gradient-to-br from-orange-500 to-orange-700 shadow-xl">
            <CardBody className="text-center text-white">
              <Typography variant="h2" className="font-bold">
                {gyms.reduce((acc, gym) => acc + (gym.member_count || 0), 0)}
              </Typography>
              <Typography variant="small">
                Membres Total
              </Typography>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Card className="shadow-2xl">
        <CardBody>
          <Tabs value={activeTab}>
            <TabsHeader
              className="bg-blue-gray-50"
              indicatorProps={{
                className: "bg-blue-500 shadow-md",
              }}
            >
              <Tab 
                value="gyms" 
                onClick={() => setActiveTab("gyms")}
                className={activeTab === "gyms" ? "text-white" : ""}
              >
                <div className="flex items-center gap-2">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  Salles de Sport
                </div>
              </Tab>
              <Tab 
                value="staff" 
                onClick={() => setActiveTab("staff")}
                className={activeTab === "staff" ? "text-white" : ""}
              >
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="h-5 w-5" />
                  Personnel
                </div>
              </Tab>
              <Tab 
                value="services" 
                onClick={() => setActiveTab("services")}
                className={activeTab === "services" ? "text-white" : ""}
              >
                <div className="flex items-center gap-2">
                  <CogIcon className="h-5 w-5" />
                  Services
                </div>
              </Tab>
            </TabsHeader>

            <TabsBody>
              {/* Tab Salles de Sport */}
              <TabPanel value="gyms">
                <div className="flex justify-between items-center mb-6">
                  <Typography variant="h5" color="blue-gray">
                    Gestion des Salles de Sport
                  </Typography>
                  <Button
                    className="flex items-center gap-2"
                    color="blue"
                    onClick={() => {
                      setEditingGym(null);
                      setGymForm({
                        name: '',
                        subdomain: '',
                        email: '',
                        phone: '',
                        address: '',
                        description: '',
                        owner: ''
                      });
                      setGymModal(true);
                    }}
                  >
                    <PlusIcon className="h-5 w-5" />
                    Nouvelle Salle
                  </Button>
                </div>

                {gyms.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max table-auto">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="p-4 text-left">Nom</th>
                          <th className="p-4 text-left">Sous-domaine</th>
                          <th className="p-4 text-left">Propriétaire</th>
                          <th className="p-4 text-left">Membres</th>
                          <th className="p-4 text-left">Statut</th>
                          <th className="p-4 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gyms.map((gym) => (
                          <tr key={gym.id} className="border-b border-gray-100 hover:bg-blue-50">
                            <td className="p-4">
                              <Typography variant="small" className="font-bold">
                                {gym.name}
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Chip 
                                value={`${gym.subdomain}.gymflow.com`} 
                                size="sm" 
                                color="blue"
                                variant="ghost"
                              />
                            </td>
                            <td className="p-4">
                              <Typography variant="small">
                                {gym.owner_name || 'N/A'}
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Typography variant="small">
                                {gym.member_count || 0} membres
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Chip
                                value={gym.is_active ? "Active" : "Inactive"}
                                color={gym.is_active ? "green" : "gray"}
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => handleToggleStatus(gym.id, gym.is_active)}
                              />
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <IconButton 
                                  size="sm" 
                                  color="blue" 
                                  variant="text"
                                  onClick={() => navigate(`/superadmin/gyms/${gym.id}`)}
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </IconButton>
                                <IconButton 
                                  size="sm" 
                                  color="green" 
                                  variant="text"
                                  onClick={() => openEditModal(gym)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </IconButton>
                                <IconButton 
                                  size="sm" 
                                  color="red" 
                                  variant="text"
                                  onClick={() => handleDeleteGym(gym.id)}
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </IconButton>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Typography color="gray">
                      Aucune salle de sport enregistrée
                    </Typography>
                  </div>
                )}
              </TabPanel>

              {/* Tab Personnel */}
              <TabPanel value="staff">
                <div className="flex justify-between items-center mb-6">
                  <Typography variant="h5" color="blue-gray">
                    Gestion du Personnel
                  </Typography>
                </div>
                
                {staff.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-max table-auto">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="p-4 text-left">Nom</th>
                          <th className="p-4 text-left">Email</th>
                          <th className="p-4 text-left">Rôle</th>
                          <th className="p-4 text-left">Salle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staff.map((member) => (
                          <tr key={member.id} className="border-b border-gray-100">
                            <td className="p-4">
                              <Typography variant="small">
                                {member.first_name} {member.last_name}
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Typography variant="small">
                                {member.email}
                              </Typography>
                            </td>
                            <td className="p-4">
                              <Chip 
                                value={member.role} 
                                size="sm" 
                                color={member.role === 'ADMIN' ? 'red' : member.role === 'COACH' ? 'green' : 'blue'}
                              />
                            </td>
                            <td className="p-4">
                              <Typography variant="small">
                                {gyms.find(g => g.tenant_id === member.tenant_id)?.name || 'N/A'}
                              </Typography>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <Typography color="gray" className="text-center py-8">
                    Aucun personnel enregistré
                  </Typography>
                )}
              </TabPanel>

              {/* Tab Services */}
              <TabPanel value="services">
                <Typography variant="h5" color="blue-gray" className="mb-6">
                  Configuration des Services
                </Typography>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'Plans d\'abonnement', enabled: true },
                    { name: 'Cours collectifs', enabled: true },
                    { name: 'Réservations', enabled: true },
                    { name: 'Programmes d\'entraînement', enabled: false },
                    { name: 'Facturation', enabled: true },
                  ].map((service, index) => (
                    <Card key={index} className="shadow-md hover:shadow-lg transition-shadow">
                      <CardBody className="flex items-center justify-between">
                        <Typography variant="small" className="font-semibold">
                          {service.name}
                        </Typography>
                        <Chip
                          value={service.enabled ? "Activé" : "Désactivé"}
                          color={service.enabled ? "green" : "gray"}
                          size="sm"
                        />
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>

      {/* Modal Création/Modification Salle */}
      <Dialog open={gymModal} handler={() => setGymModal(false)} size="lg">
        <DialogHeader>
          {editingGym ? 'Modifier la Salle' : 'Créer une Nouvelle Salle'}
        </DialogHeader>
        <DialogBody divider className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input
            label="Nom de la Salle *"
            value={gymForm.name}
            onChange={(e) => setGymForm({...gymForm, name: e.target.value})}
          />
          <Input
            label="Sous-domaine *"
            value={gymForm.subdomain}
            onChange={(e) => setGymForm({...gymForm, subdomain: e.target.value})}
          />
          <Typography variant="small" className="text-gray-600 -mt-2">
            Ex: powerfit (sera accessible sur powerfit.gymflow.com)
          </Typography>
          
          <Select
            label="Propriétaire (Admin) *"
            value={gymForm.owner}
            onChange={(value) => setGymForm({...gymForm, owner: value})}
          >
            <Option value="">Sélectionner un admin</Option>
            {availableAdmins.map(admin => (
              <Option key={admin.id} value={admin.id.toString()}>
                {admin.first_name} {admin.last_name} ({admin.email})
              </Option>
            ))}
          </Select>
          
          <Input
            label="Email *"
            type="email"
            value={gymForm.email}
            onChange={(e) => setGymForm({...gymForm, email: e.target.value})}
          />
          <Input
            label="Téléphone *"
            value={gymForm.phone}
            onChange={(e) => setGymForm({...gymForm, phone: e.target.value})}
          />
          <Textarea
            label="Adresse"
            value={gymForm.address}
            onChange={(e) => setGymForm({...gymForm, address: e.target.value})}
          />
          <Textarea
            label="Description"
            value={gymForm.description}
            onChange={(e) => setGymForm({...gymForm, description: e.target.value})}
          />
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button variant="text" color="gray" onClick={() => setGymModal(false)}>
            Annuler
          </Button>
          <Button 
            color="blue" 
            onClick={editingGym ? handleEditGym : handleCreateGym}
          >
            {editingGym ? 'Sauvegarder' : 'Créer la Salle'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}