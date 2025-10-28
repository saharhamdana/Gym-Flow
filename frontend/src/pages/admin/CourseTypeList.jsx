import React, { useEffect, useState } from "react";
// 🎯 CORRECTION : Chemin correct vers axiosInstance.js
import api from "../../api/axiosInstance";

export default function CourseTypeList() {
  const [types, setTypes] = useState([]);
  // Le formulaire sera utilisé pour l'ajout (POST) et la modification (PUT/PATCH)
  const [form, setForm] = useState({ name: "", description: "" });
  // Nouvelle variable d'état pour le mode édition
  const [editingType, setEditingType] = useState(null); // Stocke le type de cours en cours de modification (ou null)
  const [error, setError] = useState(null);

  const fetchCourseTypes = () => {
    setError(null);
    api.get("/course-types/")
      .then(res => setTypes(res.data))
      .catch(err => {
        // Gestion des erreurs de lecture (accès refusé, etc.)
        const msg = err.response?.data?.detail || err.response?.data || err.message;
        setError("Erreur de chargement des types de cours: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
      });
  };

  useEffect(() => {
    fetchCourseTypes();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // Nouvelle fonction pour démarrer la modification
  const handleEditClick = (courseType) => {
    setEditingType(courseType); // Enregistrer l'objet en cours de modification
    setForm({ name: courseType.name, description: courseType.description }); // Pré-remplir le formulaire
    setError(null); // Réinitialiser l'erreur
  };

  // Nouvelle fonction pour annuler la modification
  const handleCancelEdit = () => {
    setEditingType(null);
    setForm({ name: "", description: "" });
    setError(null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError(null); // Réinitialiser l'erreur avant la soumission

    const isUpdate = editingType !== null;
    const url = isUpdate ? `/course-types/${editingType.id}/` : "/course-types/";
    // Utilisez PUT pour la mise à jour complète (si votre API supporte PATCH pour une mise à jour partielle, vous pouvez changer)
    const method = isUpdate ? api.put : api.post; 

    // Données à envoyer (nom et description)
    const dataToSend = { name: form.name, description: form.description };

    method(url, dataToSend)
      .then(res => {
        if (isUpdate) {
          // Mise à jour : Remplacer l'élément dans la liste avec les nouvelles données renvoyées par l'API
          setTypes(types.map(t => t.id === editingType.id ? res.data : t));
          setEditingType(null); // Arrêter le mode d'édition
        } else {
          // Création : Ajouter le nouvel élément
          setTypes([...types, res.data]);
        }
        setForm({ name: "", description: "" }); // Réinitialiser le formulaire
      })
      .catch(err => {
        // 💡 Afficher l'erreur API en cas d'échec
        const action = isUpdate ? "modification" : "ajout";
        const msg = err.response?.data?.detail || err.response?.data || err.message;
        alert(`Erreur de ${action} du type de cours: ` + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
        console.error(err);
      });
  };

  const handleDelete = id => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce type de cours ?")) return;
    
    // Si l'élément en cours d'édition est supprimé, désactiver le mode édition
    if (editingType && editingType.id === id) {
        setEditingType(null);
        setForm({ name: "", description: "" });
    }
    
    api.delete(`/course-types/${id}/`)
      .then(() => setTypes(types.filter(t => t.id !== id)))
      .catch(err => {
        const msg = err.response?.data?.detail || err.response?.data || err.message;
        alert("Erreur de suppression: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
      });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Gestion des Types de cours</h2>

      {/* Formulaire d'ajout/modification */}
      <h3>{editingType ? `Modifier : ${editingType.name}` : "Ajouter un nouveau type"}</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input 
          name="name" 
          placeholder="Nom du cours (ex: Yoga)" 
          value={form.name} 
          onChange={handleChange} 
          required 
          style={{ marginRight: "10px", padding: "8px" }} 
        />
        <input 
          name="description" 
          placeholder="Description" 
          value={form.description} 
          onChange={handleChange} 
          style={{ marginRight: "10px", padding: "8px" }} 
        />
        <button type="submit" style={{ padding: "8px 15px" }}>
          {/* Texte du bouton adapté au mode */}
          {editingType ? "Sauvegarder les modifications" : "Ajouter"}
        </button>
        {/* Bouton Annuler en mode édition */}
        {editingType && (
          <button 
            type="button" 
            onClick={handleCancelEdit} 
            style={{ padding: "8px 15px", marginLeft: "10px", background: "#aaa", border: 'none', color: 'white' }}
          >
            Annuler
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Liste des types de cours */}
      <h3>Liste des Types ({types.length})</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {types.map(t => (
          <li 
            key={t.id} 
            style={{ 
              borderBottom: '1px dotted #eee', 
              padding: '10px 0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              // Mettre en évidence l'élément en cours d'édition
              backgroundColor: editingType && editingType.id === t.id ? '#f0f8ff' : 'transparent' 
            }}
          >
            <span>
              **{t.name}** - *{t.description}*
            </span>
            <span>
              {/* Bouton Modifier */}
              <button
                onClick={() => handleEditClick(t)} 
                // Désactiver si un autre élément est déjà en cours d'édition
                disabled={editingType !== null} 
                style={{ 
                  marginLeft: '10px', 
                  background: 'teal', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px',
                  cursor: editingType !== null ? 'not-allowed' : 'pointer'
                }}
              >
                Modifier
              </button>
              {/* Bouton Supprimer */}
              <button 
                onClick={() => handleDelete(t.id)} 
                style={{ marginLeft: '10px', background: 'salmon', color: 'white', border: 'none', padding: '5px 10px' }}
              >
                Supprimer
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}