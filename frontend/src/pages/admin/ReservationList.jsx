import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axiosInstance";

// Fonction utilitaire pour formater la date pour <input type="datetime-local">
const formatForDateTimeLocal = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  // S'assurer que l'objet Date est valide
  if (isNaN(date)) return '';
  
  // Format YYYY-MM-DDTHH:MM, compatible avec l'input local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function ReservationList() {
  const [reservations, setReservations] = useState([]);
  const [members, setMembers] = useState([]); // Pour afficher le nom de l'utilisateur
  const [courseTypes, setCourseTypes] = useState([]); // Pour afficher le nom du type de cours
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Formulaire d'ajout/modification
  const [form, setForm] = useState({ 
    user: "", 
    course_type: "", 
    date: "", 
    status: "pending" 
  });
  // État pour la modification
  const [editingReservation, setEditingReservation] = useState(null);

  // Fonction pour charger toutes les données nécessaires
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Récupération des Réservations
      const resReservations = await api.get("/reservations/");
      setReservations(resReservations.data);

      // 2. Récupération des Membres (pour l'affichage des noms)
      const resMembers = await api.get("/members/");
      setMembers(resMembers.data);

      // 3. Récupération des Types de cours (pour l'affichage des noms)
      const resCourseTypes = await api.get("/course-types/");
      setCourseTypes(resCourseTypes.data);

    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data || err.message;
      setError("Erreur de chargement des données: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Récupérer le nom à partir de l'ID (pour l'affichage)
  const getMemberName = (id) => {
    const member = members.find(m => m.id === id);
    return member ? `${member.username} (ID: ${id})` : `Membre Inconnu (ID: ${id})`;
  };

  const getCourseTypeName = (id) => {
    const type = courseTypes.find(t => t.id === id);
    return type ? `${type.name} (ID: ${id})` : `Type Inconnu (ID: ${id})`;
  };

  // Gestion des changements de formulaire
  const handleChange = e => setForm({ 
    ...form, 
    [e.target.name]: e.target.value 
  });

  // Démarrer la modification
  const handleEditClick = (reservation) => {
    setEditingReservation(reservation);
    // Pré-remplir le formulaire avec les IDs (pour la soumission) et la date formatée
    setForm({
      user: reservation.user,
      course_type: reservation.course_type,
      // Utiliser la fonction de formatage pour l'input type="datetime-local"
      date: formatForDateTimeLocal(reservation.date), 
      status: reservation.status
    });
    setError(null);
  };

  // Annuler la modification
  const handleCancelEdit = () => {
    setEditingReservation(null);
    setForm({ user: "", course_type: "", date: "", status: "pending" });
    setError(null);
  };

  // Soumission du formulaire (Ajout ou Modification)
  const handleSubmit = e => {
    e.preventDefault();
    setError(null); 

    // Conversion des IDs en nombres si l'API les attend comme tels (bonne pratique)
    const dataToSend = {
      ...form,
      user: Number(form.user),
      course_type: Number(form.course_type)
    };

    const isUpdate = editingReservation !== null;
    const url = isUpdate ? `/reservations/${editingReservation.id}/` : "/reservations/";
    const method = isUpdate ? api.put : api.post; 
    const action = isUpdate ? "modification" : "ajout";

    method(url, dataToSend)
      .then(res => {
        if (isUpdate) {
          // Mise à jour : Remplacer l'élément
          setReservations(reservations.map(r => r.id === editingReservation.id ? res.data : r));
          setEditingReservation(null);
        } else {
          // Création : Ajouter le nouvel élément
          setReservations([...reservations, res.data]);
        }
        setForm({ user: "", course_type: "", date: "", status: "pending" }); // Réinitialiser
      })
      .catch(err => {
        const msg = err.response?.data?.detail || err.response?.data || err.message;
        alert(`Erreur de ${action} de la réservation: ` + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
        console.error(err);
      });
  };

  // Suppression
  const handleDelete = id => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette réservation ?")) return;
    
    if (editingReservation && editingReservation.id === id) {
      handleCancelEdit(); // Annuler l'édition si l'élément est supprimé
    }
    
    api.delete(`/reservations/${id}/`)
      .then(() => setReservations(reservations.filter(r => r.id !== id)))
      .catch(err => {
        const msg = err.response?.data?.detail || err.response?.data || err.message;
        alert("Erreur de suppression: " + (typeof msg === 'object' ? JSON.stringify(msg) : msg));
      });
  };

  if (loading) return <div style={{ padding: "20px" }}>Chargement des données...</div>;
  
  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Gestion des Réservations</h2>

      {/* Formulaire d'ajout/modification */}
      <h3>{editingReservation ? `Modifier la Réservation (ID: ${editingReservation.id})` : "Ajouter une nouvelle Réservation"}</h3>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px", display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
        
        {/* Champ Utilisateur (Sélection) */}
        <select 
          name="user" 
          value={form.user} 
          onChange={handleChange} 
          required 
          style={{ padding: "8px" }}
        >
          <option value="">-- Sélectionner un Membre --</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.username} ({m.id})</option>
          ))}
        </select>
        
        {/* Champ Type de Cours (Sélection) */}
        <select 
          name="course_type" 
          value={form.course_type} 
          onChange={handleChange} 
          required 
          style={{ padding: "8px" }}
        >
          <option value="">-- Sélectionner un Type de Cours --</option>
          {courseTypes.map(t => (
            <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
          ))}
        </select>

        {/* Champ Date/Heure */}
        <input 
          name="date" 
          type="datetime-local" 
          value={form.date} 
          onChange={handleChange} 
          required
          style={{ padding: "8px" }}
        />
        
        {/* Champ Statut (Sélection) */}
        <select 
          name="status" 
          value={form.status} 
          onChange={handleChange} 
          style={{ padding: "8px" }}
        >
          <option value="pending">En attente</option>
          <option value="confirmed">Confirmée</option>
          <option value="cancelled">Annulée</option>
        </select>

        <button type="submit" style={{ padding: "8px 15px" }}>
          {editingReservation ? "Sauvegarder" : "Ajouter"}
        </button>
        {editingReservation && (
          <button 
            type="button" 
            onClick={handleCancelEdit} 
            style={{ padding: "8px 15px", background: "#aaa", border: 'none', color: 'white' }}
          >
            Annuler
          </button>
        )}
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Liste des réservations */}
      <h3>Liste des Réservations ({reservations.length})</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {reservations.map(r => (
          <li 
            key={r.id} 
            style={{ 
              borderBottom: '1px dotted #eee', 
              padding: '10px 0', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: editingReservation && editingReservation.id === r.id ? '#f0f8ff' : 'transparent' 
            }}
          >
            <span>
                **ID: {r.id}** | 
                **Utilisateur:** {getMemberName(r.user)} | 
                **Type de cours:** {getCourseTypeName(r.course_type)} | 
                **Date:** {new Date(r.date).toLocaleString()} | 
                **Statut:** *{r.status}*
            </span>
            <span>
              {/* Bouton Modifier */}
              <button
                onClick={() => handleEditClick(r)} 
                disabled={editingReservation !== null} 
                style={{ 
                  marginLeft: '10px', 
                  background: 'teal', 
                  color: 'white', 
                  border: 'none', 
                  padding: '5px 10px',
                  cursor: editingReservation !== null ? 'not-allowed' : 'pointer'
                }}
              >
                Modifier
              </button>
              {/* Bouton Supprimer */}
              <button 
                onClick={() => handleDelete(r.id)} 
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