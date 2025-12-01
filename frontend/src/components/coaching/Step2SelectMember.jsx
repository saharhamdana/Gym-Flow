import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, CheckCircle, X } from 'lucide-react';
import coachingService from '../../services/coachingService';

const Step2SelectMember = ({ formData, updateFormData }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // Initialiser avec un tableau vide si pas de membres sélectionnés
  const selectedMembers = Array.isArray(formData.members) ? formData.members : [];

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await coachingService.getMembers();
      console.log('🔍 Réponse complète:', response);
      console.log('📦 Données:', response.data);

      const membersData = response.data?.results || response.data || [];
      console.log('✅ Membres extraits:', membersData);
      
      setMembers(membersData);
    } catch (err) {
      console.error('❌ Erreur lors du chargement des membres:', err);
      console.error('❌ Détails:', err.response?.data);
      setError('Impossible de charger la liste des membres');
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const search = searchTerm.toLowerCase();
    return (
      member.full_name?.toLowerCase().includes(search) ||
      member.email?.toLowerCase().includes(search) ||
      member.phone?.includes(search)
    );
  });

  const toggleMember = (member) => {
    const isSelected = selectedMembers.some(m => m.id === member.id);
    
    let newSelection;
    if (isSelected) {
      // Retirer le membre
      newSelection = selectedMembers.filter(m => m.id !== member.id);
    } else {
      // Ajouter le membre
      newSelection = [...selectedMembers, member];
    }
    
    updateFormData('members', newSelection);
  };

  const removeMember = (memberId) => {
    const newSelection = selectedMembers.filter(m => m.id !== memberId);
    updateFormData('members', newSelection);
  };

  const clearSelection = () => {
    updateFormData('members', []);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        {error}
        <button 
          onClick={fetchMembers}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sélectionner les membres
      </h2>

      {/* Debug info - À RETIRER EN PRODUCTION */}
      {members.length === 0 && !loading && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">⚠️ Aucun membre trouvé dans la base de données</p>
          <p className="text-sm text-yellow-700 mt-1">
            Vérifiez que des membres avec status ACTIVE existent
          </p>
        </div>
      )}

      {/* Membres sélectionnés */}
      {selectedMembers.length > 0 && (
        <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-blue-900">
                {selectedMembers.length} membre(s) sélectionné(s)
              </h3>
            </div>
            <button
              onClick={clearSelection}
              className="text-sm text-red-600 hover:text-red-700 hover:underline"
            >
              Tout désélectionner
            </button>
          </div>
          
          {/* Liste des membres sélectionnés */}
          <div className="space-y-2">
            {selectedMembers.map(member => (
              <div 
                key={member.id}
                className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.full_name}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
                <button
                  onClick={() => removeMember(member.id)}
                  className="ml-4 p-1 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Retirer ce membre"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher un membre par nom, email ou téléphone..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Liste des membres */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun membre trouvé</p>
            {searchTerm && (
              <p className="text-sm mt-2">Essayez un autre terme de recherche</p>
            )}
          </div>
        ) : (
          filteredMembers.map(member => {
            const isSelected = selectedMembers.some(m => m.id === member.id);
            
            return (
              <div
                key={member.id}
                onClick={() => toggleMember(member)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-2" />
                      <h3 className="font-semibold text-gray-900">
                        {member.full_name}
                      </h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600 ml-2" />
                      )}
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {member.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {member.email}
                        </div>
                      )}
                      
                      {member.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {member.phone}
                        </div>
                      )}
                      
                      <div className="text-xs text-gray-500 mt-1">
                        ID: {member.member_id}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-500 text-center pt-4 border-t">
        {filteredMembers.length} membre(s) disponible(s) • {selectedMembers.length} sélectionné(s)
      </div>
    </div>
  );
};

export default Step2SelectMember;