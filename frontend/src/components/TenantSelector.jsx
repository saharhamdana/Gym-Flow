// frontend/src/components/TenantSelector.jsx
import { useState, useEffect } from 'react';
import { Building2, Loader2, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import api from '../api/axiosInstance';

const TenantSelector = ({ onCenterSelect }) => {
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Récupération des centres...');
      
      // Appel API public pour récupérer tous les centres actifs
      const response = await api.get('auth/centers/');
      
      console.log('✅ Centres récupérés:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setCenters(response.data);
        
        // Vérifier si un centre est déjà sélectionné dans localStorage
        const savedSubdomain = localStorage.getItem('test_subdomain');
        if (savedSubdomain) {
          const savedCenter = response.data.find(c => c.subdomain === savedSubdomain);
          if (savedCenter) {
            console.log('📍 Centre précédemment sélectionné:', savedCenter.name);
            setSelectedCenter(savedCenter);
          }
        }
      }
    } catch (err) {
      console.error('❌ Erreur lors de la récupération des centres:', err);
      setError(
        err.response?.data?.detail || 
        'Impossible de charger les centres. Vérifiez que le serveur Django est démarré.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCenter = (center) => {
    console.log('🏢 Sélection du centre:', center.name, `(${center.subdomain})`);
    
    setSelectedCenter(center);
    
    // Sauvegarder le sous-domaine dans localStorage pour la simulation
    localStorage.setItem('test_subdomain', center.subdomain);
    
    // Callback optionnel
    if (onCenterSelect) {
      onCenterSelect(center);
    }
    
    // Afficher un message de confirmation
    alert(`✅ Centre sélectionné: ${center.name}\n\nLa page va se recharger pour appliquer le sous-domaine: ${center.subdomain}`);
    
    // Recharger la page pour appliquer le nouveau sous-domaine
    window.location.reload();
  };

  const handleClearSelection = () => {
    console.log('🗑️ Suppression de la sélection du centre');
    setSelectedCenter(null);
    localStorage.removeItem('test_subdomain');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-700 font-medium">Chargement des centres...</p>
          <p className="text-gray-500 text-sm mt-2">Connexion à l'API Django</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Erreur de connexion</h2>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
          <div className="space-y-3">
            <button
              onClick={fetchCenters}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Réessayer
            </button>
            <p className="text-xs text-gray-500 text-center">
              Assurez-vous que Django est démarré sur http://127.0.0.1:8000
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex items-start gap-4">
            <Building2 className="w-10 h-10 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">
                Sélecteur de Centre
              </h2>
              <p className="text-blue-100 text-sm">
                {selectedCenter 
                  ? `Actuellement: ${selectedCenter.name} (${selectedCenter.subdomain})`
                  : `${centers.length} centre${centers.length > 1 ? 's' : ''} disponible${centers.length > 1 ? 's' : ''}`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Centre actuellement sélectionné */}
          {selectedCenter && (
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-900 text-lg">
                      {selectedCenter.name}
                    </p>
                    <p className="text-green-700 text-sm">
                      {selectedCenter.subdomain}.gymflow.com
                    </p>
                    <p className="text-green-600 text-xs mt-1">
                      Tenant ID: {selectedCenter.tenant_id}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearSelection}
                  className="text-sm bg-white text-green-700 hover:text-green-900 hover:bg-green-100 px-4 py-2 rounded-lg font-medium border border-green-300 transition"
                >
                  Changer
                </button>
              </div>
            </div>
          )}

          {/* Message d'information */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1 text-sm">
                <p className="font-semibold text-amber-900 mb-1">
                  Mode développement
                </p>
                <p className="text-amber-800">
                  Ce composant simule le système multi-tenant par sous-domaine. 
                  En production, le sous-domaine sera détecté automatiquement depuis l'URL.
                </p>
              </div>
            </div>
          </div>

          {/* Liste des centres disponibles */}
          {centers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-2">Aucun centre disponible</p>
              <p className="text-gray-500 text-sm mb-4">
                Créez des centres via le Django admin ou le shell
              </p>
              <code className="text-xs bg-gray-100 px-3 py-1 rounded">
                python create_test_centers.py
              </code>
            </div>
          ) : (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Centres disponibles ({centers.length})
              </h3>
              <div className="grid gap-3">
                {centers.map((center) => (
                  <button
                    key={center.id}
                    onClick={() => handleSelectCenter(center)}
                    className={`
                      text-left p-4 rounded-lg border-2 transition-all hover:shadow-md
                      ${selectedCenter?.id === center.id
                        ? 'border-blue-600 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-bold text-gray-900 text-lg">
                            {center.name}
                          </h3>
                          {center.is_active && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                              Actif
                            </span>
                          )}
                        </div>
                        
                        {center.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {center.description}
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-xs">
                              {center.subdomain}.gymflow.com
                            </span>
                          </div>
                          {center.email && (
                            <div className="flex items-center gap-2">
                              <span>📧</span>
                              <span className="truncate">{center.email}</span>
                            </div>
                          )}
                          {center.phone && (
                            <div className="flex items-center gap-2">
                              <span>📞</span>
                              <span>{center.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span>👤</span>
                            <span className="truncate">{center.owner_name}</span>
                          </div>
                        </div>
                      </div>
                      
                      {selectedCenter?.id === center.id ? (
                        <CheckCircle className="w-7 h-7 text-blue-600 flex-shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full border-2 border-gray-300 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              📝 Comment créer un nouveau centre de test
            </p>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Ouvrez un terminal dans le dossier <code className="bg-gray-200 px-1 rounded text-xs">backend/</code></li>
              <li>Exécutez: <code className="bg-gray-200 px-1 rounded text-xs">python create_test_centers.py</code></li>
              <li>Cliquez sur le bouton "Rafraîchir" ci-dessous</li>
            </ol>
            <button
              onClick={fetchCenters}
              className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm font-medium"
            >
              <RefreshCw className="w-4 h-4" />
              Rafraîchir la liste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantSelector;