import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

const APIDebugTool = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name, url, method = 'GET') => {
    const token = localStorage.getItem('access_token');
    
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8000/api${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      setResults(prev => [...prev, {
        name,
        url,
        status: response.status,
        success: response.ok,
        data: data,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      console.log(`${name}:`, data);
    } catch (error) {
      setResults(prev => [...prev, {
        name,
        url,
        status: 'ERROR',
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      console.error(`${name} error:`, error);
    } finally {
      setLoading(false);
    }
  };

  const tests = [
    { name: 'Membres (tous)', url: '/members/' },
    { name: 'Coaching Members', url: '/coaching/members/' },
    { name: 'Programmes Coaching', url: '/coaching/programs/' },
    { name: 'Exercices', url: '/coaching/exercises/' },
    { name: 'Catégories Exercices', url: '/coaching/exercise-categories/' },
    { name: 'Dashboard Stats', url: '/coaching/dashboard/stats/' },
    { name: 'Sessions à venir', url: '/coaching/sessions/upcoming/' },
  ];

  const runAllTests = async () => {
    setResults([]);
    for (const test of tests) {
      await testEndpoint(test.name, test.url);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 API Debug Tool
          </h1>
          <p className="text-gray-600 mb-6">
            Testez vos endpoints backend pour identifier les problèmes
          </p>

          <div className="flex gap-4 mb-6">
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Test en cours...' : 'Lancer tous les tests'}
            </button>
            <button
              onClick={clearResults}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Effacer
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {tests.map((test, index) => (
              <button
                key={index}
                onClick={() => testEndpoint(test.name, test.url)}
                disabled={loading}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-left disabled:opacity-50"
              >
                <div className="font-medium text-gray-900">{test.name}</div>
                <div className="text-xs text-gray-600 mt-1">{test.url}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Résultats */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Résultats ({results.length})
            </h2>
            
            {results.map((result, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                  result.success ? 'border-green-200' : 'border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {result.name}
                      </h3>
                      <p className="text-sm text-gray-600">{result.url}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {result.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{result.timestamp}</p>
                  </div>
                </div>

                {result.data && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Données reçues:</h4>
                    <div className="bg-gray-50 rounded p-4 overflow-auto max-h-96">
                      <pre className="text-xs text-gray-800">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                    
                    {/* Analyse des données */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Array.isArray(result.data) && (
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-xs text-blue-600 font-medium">Type</p>
                          <p className="text-sm font-semibold text-blue-900">Array</p>
                        </div>
                      )}
                      {result.data?.results && (
                        <>
                          <div className="bg-purple-50 p-3 rounded">
                            <p className="text-xs text-purple-600 font-medium">Type</p>
                            <p className="text-sm font-semibold text-purple-900">Paginated</p>
                          </div>
                          <div className="bg-purple-50 p-3 rounded">
                            <p className="text-xs text-purple-600 font-medium">Count</p>
                            <p className="text-sm font-semibold text-purple-900">
                              {result.data.results.length}
                            </p>
                          </div>
                        </>
                      )}
                      {Array.isArray(result.data) && (
                        <div className="bg-blue-50 p-3 rounded">
                          <p className="text-xs text-blue-600 font-medium">Length</p>
                          <p className="text-sm font-semibold text-blue-900">
                            {result.data.length}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {result.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <h4 className="font-medium text-red-900 mb-2">Erreur:</h4>
                    <p className="text-sm text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">📋 Comment utiliser</h3>
          <ol className="space-y-2 text-sm text-blue-800">
            <li>1. Assurez-vous d'être connecté (token dans localStorage)</li>
            <li>2. Vérifiez que votre backend tourne sur localhost:8000</li>
            <li>3. Lancez tous les tests ou testez individuellement</li>
            <li>4. Vérifiez les données retournées dans la console et ci-dessus</li>
            <li>5. Corrigez les endpoints qui échouent côté backend</li>
          </ol>
        </div>

        {/* Solutions communes */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-3">⚠️ Problèmes courants</h3>
          <ul className="space-y-2 text-sm text-yellow-800">
            <li>• <strong>401 Unauthorized:</strong> Token expiré, reconnectez-vous</li>
            <li>• <strong>404 Not Found:</strong> L'endpoint n'existe pas côté backend</li>
            <li>• <strong>500 Server Error:</strong> Erreur côté backend, vérifiez les logs Django</li>
            <li>• <strong>CORS Error:</strong> Configurez CORS_ALLOWED_ORIGINS dans Django</li>
            <li>• <strong>Données vides []:</strong> Aucune donnée en base ou problème de permissions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default APIDebugTool;