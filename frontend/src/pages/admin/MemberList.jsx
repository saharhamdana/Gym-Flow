import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/axiosInstance"; 
import { useNavigate } from "react-router-dom"; 

export default function MemberList() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({
    username: "",
    email: "",
    role: "member",
    first_name: "",
    last_name: "",
    password: "",
  });
  const [userInfo, setUserInfo] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  const isAdmin = () => {
    if (!userInfo) return false;
    return userInfo.is_superuser === true || userInfo.role === "admin";
  };

  const initData = useCallback(async () => {
    setLoading(true);
    setError(null);
    let fetchedUserInfo = null;
    
    // 1. VÉRIFICATION DU STATUT DE L'UTILISATEUR (/me/)
    try {
        const userRes = await api.get("/me/");
        fetchedUserInfo = userRes.data;
        setUserInfo(fetchedUserInfo);
        
        // Si l'utilisateur est connecté mais non admin, on arrête ici
        if (!fetchedUserInfo.is_superuser && fetchedUserInfo.role !== "admin") {
             setError("Accès non autorisé. Vous n'êtes pas un administrateur.");
             setLoading(false);
             return;
        }
    } catch (err) {
        setUserInfo(null); 
        setMembers([]);
        setLoading(false);
        // Si l'appel /me/ échoue avec 401, on considère la session expirée
        if (err.response && err.response.status === 401) {
            // L'alerte que vous avez vue
            alert("Session expirée. Veuillez vous reconnecter.");
            navigate('/login');
        }
        return; 
    }

    // 2. TENTATIVE DE CHARGEMENT DE LA LISTE DES MEMBRES (si admin)
    try {
        const membersRes = await api.get("/members/");
        setMembers(membersRes.data);
    } catch (err) {
        setMembers([]);
        // Si l'erreur est 403, le token est valide, mais la permission IsAdmin est refusée
        setError("Erreur de chargement des membres. Problème de permission côté Django.");
        console.error("Erreur de l'API /members/", err);
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    initData(); 
  }, [initData]);


  // --- Fonctions CRUD (à conserver ou à compléter) ---
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleEditChange = e => { setEditingMember({ ...editingMember, [e.target.name]: e.target.value }); };
  
  const handleSubmit = e => {
    e.preventDefault();
    if (!form.password) { alert("Le mot de passe est obligatoire."); return; }
    api.post("/members/", form)
      .then(res => { setMembers([...members, res.data]); setForm({ username: "", email: "", role: "member", first_name: "", last_name: "", password: "" }); })
      .catch(err => { alert("Erreur lors de l'ajout : " + JSON.stringify(err.response?.data || err.message)); });
  };

  const handleUpdate = e => {
    e.preventDefault();
    const dataToUpdate = { ...editingMember };
    if (!dataToUpdate.password) { delete dataToUpdate.password; }
    delete dataToUpdate.id;
    api.patch(`/members/${editingMember.id}/`, dataToUpdate)
      .then(res => { setMembers(members.map(m => (m.id === res.data.id ? res.data : m))); setEditingMember(null); alert(`Membre ${res.data.username} mis à jour.`); })
      .catch(err => { alert("Erreur lors de la mise à jour : " + JSON.stringify(err.response?.data || err.message)); });
  };
  
  const handleDelete = id => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce membre ?")) return;
    api.delete(`/members/${id}/`)
      .then(() => setMembers(members.filter(m => m.id !== id)))
      .catch(err => { alert("Erreur suppression : " + (err.response?.data || err.message)); });
  };

  const handleEditClick = member => {
    setEditingMember({ ...member, password: '' }); 
    setForm({ username: "", email: "", role: "member", first_name: "", last_name: "", password: "" });
  };

  // AFFICHAGE
  return (
    <div style={{ padding: '20px', fontFamily: "sans-serif" }}>
      <h2>Gestion des Membres</h2>
      <div>Rôle : <b>{userInfo ? (userInfo.role + (userInfo.is_superuser ? " (superuser)" : "")) : "non authentifié"}</b></div>
      
      {loading && <div style={{ color: 'blue' }}>Chargement en cours...</div>}
      {error && <div style={{ color: 'red', fontWeight: 'bold' }}>ERREUR : {error}</div>}
      
      {/* 1. Formulaire d'AJOUT */}
      {isAdmin() && !editingMember && !loading && (
        <>
          <h3>Ajouter un Membre</h3>
          <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <input name="username" placeholder="Nom d'utilisateur" value={form.username} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <input name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />
            <input name="first_name" placeholder="Prénom" value={form.first_name} onChange={handleChange} />
            <input name="last_name" placeholder="Nom" value={form.last_name} onChange={handleChange} />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="member">Membre</option>
            </select>
            <button type="submit">Ajouter</button>
          </form>
        </>
      )}

      {/* 2. Formulaire de MODIFICATION */}
      {editingMember && isAdmin() && (
        <>
          <h3>Modifier Membre : {editingMember.username} (ID: {editingMember.id})</h3>
          <form onSubmit={handleUpdate} style={{ marginBottom: '20px', border: '1px solid #4CAF50', padding: '15px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <input name="username" placeholder="Nom d'utilisateur" value={editingMember.username} onChange={handleEditChange} required />
            <input name="email" type="email" placeholder="Email" value={editingMember.email} onChange={handleEditChange} />
            <input name="password" type="password" placeholder="Nouveau Mot de passe (Laisser vide pour ne pas changer)" value={editingMember.password} onChange={handleEditChange} />
            <input name="first_name" placeholder="Prénom" value={editingMember.first_name} onChange={handleEditChange} />
            <input name="last_name" placeholder="Nom" value={editingMember.last_name} onChange={handleEditChange} />
            <select name="role" value={editingMember.role} onChange={handleEditChange}>
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="member">Membre</option>
            </select>
            <button type="submit">Sauvegarder</button>
            <button type="button" onClick={() => setEditingMember(null)} style={{ marginLeft: '10px' }}>Annuler</button>
          </form>
        </>
      )}

      {/* 3. LISTE DES MEMBRES */}
      <h3>Liste des Membres ({members.length})</h3>
      {!isAdmin() && userInfo && !loading && !error && <div style={{ color: "red" }}>Seul un administrateur peut voir et gérer la liste.</div>}
      
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {members.map(m => (
          <li key={m.id} style={{ borderBottom: '1px dotted #eee', padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ flexGrow: 1 }}>
                **{m.username}** ({m.role}) - *{m.first_name} {m.last_name}*
            </span>
            {isAdmin() && (
                <span style={{ flexShrink: 0 }}>
                    <button onClick={() => handleEditClick(m)} disabled={editingMember != null} style={{ marginLeft: '10px' }}>Modifier</button>
                    <button onClick={() => handleDelete(m.id)} style={{ marginLeft: '10px', color: 'red' }}>Supprimer</button>
                </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}