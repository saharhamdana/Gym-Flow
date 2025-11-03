import { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";

function UserCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",  // Will be generated from email
    first_name: "",
    last_name: "",
    role: "RECEPTIONIST", // Default role for staff
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Submitting data:", formData);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError("L'email et le mot de passe sont requis.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (!formData.email.includes('@')) {
      setError("Veuillez entrer une adresse email valide.");
      return;
    }

    // Prepare registration data
    const registrationData = {
      email: formData.email,
      username: formData.email.split('@')[0],  // Default username from email
      password: formData.password,
      first_name: formData.first_name || '',
      last_name: formData.last_name || '',
      role: formData.role,  // Include role in initial registration
    };

    try {
      console.log("Sending registration data:", registrationData);
      const registerResponse = await axiosInstance.post("auth/register/", registrationData);
      console.log("Registration response:", registerResponse.data);

      if (registerResponse.status === 201) {
        const userId = registerResponse.data.id;

        try {
          console.log("Updating role for user:", userId);
          const roleResponse = await axiosInstance.put(`auth/users/${userId}/`, {
            ...registerResponse.data,
            role: formData.role
          });
          console.log("Role update response:", roleResponse.data);

          // Success - redirect to staff list
          navigate("/admin/staff");
        } catch (roleError) {
          console.error("Error updating role:", roleError.response?.data);
          setError("L'utilisateur a été créé mais la mise à jour du rôle a échoué.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      
      if (error.response?.data?.errors) {
        const errorData = error.response.data.errors;
        const errorMessages = [];
        
        if (errorData.username) errorMessages.push(`Nom d'utilisateur: ${errorData.username.join(', ')}`);
        if (errorData.email) errorMessages.push(`Email: ${errorData.email.join(', ')}`);
        if (errorData.password) errorMessages.push(`Mot de passe: ${errorData.password.join(', ')}`);
        
        setError(errorMessages.join(' '));
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError("Une erreur est survenue lors de la création de l'utilisateur.");
      }
    }
  };

  return (
    <Card color="transparent" shadow={false} className="p-6">
      <Typography variant="h4" color="blue-gray">
        Créer un Nouveau Compte
      </Typography>
      <Typography color="gray" className="mt-1 font-normal">
        Entrez les informations pour créer un nouveau compte.
      </Typography>
      <form onSubmit={handleSubmit} className="mt-8 mb-2 w-80 max-w-screen-lg sm:w-96">
        <div className="mb-4 flex flex-col gap-6">
          <Input
            size="lg"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => {
              const email = e.target.value;
              setFormData(prev => ({
                ...prev,
                email,
                username: email.split('@')[0]  // Generate username from email
              }));
            }}
            required
          />
          <Input
            size="lg"
            label="Prénom"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <Input
            size="lg"
            label="Nom"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <Input
            type="password"
            size="lg"
            label="Mot de passe"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <Select
            label="Rôle"
            value={formData.role}
            onChange={handleRoleChange}
          >
            <Option value="RECEPTIONIST">Réceptionniste</Option>
            <Option value="COACH">Coach</Option>
            <Option value="ADMIN">Administrateur</Option>
          </Select>
        </div>
        {error && (
          <Typography
            variant="small"
            color="red"
            className="mt-2 flex items-center gap-1 font-normal"
          >
            {error}
          </Typography>
        )}
        <Button className="mt-6" fullWidth type="submit">
          Créer le compte
        </Button>
      </form>
    </Card>
  );
}

export default UserCreate;