// Dans votre service API
const memberService = {
  getMemberProfile: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:8000/api/members/profile/', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.json();
  },

  updateMemberProfile: async (profileData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:8000/api/members/profile/update/', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    return response.json();
  },
};