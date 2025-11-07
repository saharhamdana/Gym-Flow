import React, { useState, useEffect } from 'react';
import { Search, User, Mail, Phone, CheckCircle } from 'lucide-react';
import coachingService from '../../services/coachingService';

const Step2SelectMember = ({ formData, updateFormData }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await coachingService.getMembers(); // 
      // Gérer la pagination Django comme dans ProgramList
      const membersData = response.data?.results || response.data || [];
      setMembers(membersData);
    } catch (err) {
      console.error('Erreur lors du chargement des membres:', err);
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

  const selectMember = (member) => {
    updateFormData('member', member);
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
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Sélectionner un membre
      </h2>

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

      {/* Membre sélectionné */}
      {formData.member && (
        <div className="p-4 bg-green-50 border-2 border-green-500 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="font-semibold text-green-900">Membre sélectionné</h3>
              </div>
              <p className="text-green-800 mt-1">{formData.member.full_name}</p>
              <p className="text-sm text-green-700">{formData.member.email}</p>
            </div>
            <button
              onClick={() => updateFormData('member', null)}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
            >
              Changer
            </button>
          </div>
        </div>
      )}

      {/* Liste des membres */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>Aucun membre trouvé</p>
          </div>
        ) : (
          filteredMembers.map(member => {
            const isSelected = formData.member?.id === member.id;
            
            return (
              <div
                key={member.id}
                onClick={() => selectMember(member)}
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
        {filteredMembers.length} membre(s) disponible(s)
      </div>
    </div>
  );
};

export default Step2SelectMember;