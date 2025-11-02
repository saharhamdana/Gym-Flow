import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import axiosInstance from "../../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export function UserCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "MEMBER",
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

    try {
      // First register the user
      const registerResponse = await axiosInstance.post("/api/auth/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name,
        last_name: formData.last_name,
      });

      // If registration successful, update the role
      if (registerResponse.status === 201) {
        const userId = registerResponse.data.id;
        // Update the user's role if it's not MEMBER
        if (formData.role !== "MEMBER") {
          await axiosInstance.patch(`/api/auth/users/${userId}/`, {
            role: formData.role,
          });
        }
        navigate("/admin/staff");
      }
    } catch (error) {
      console.error("Error:", error.response?.data);
      setError(
        error.response?.data?.email?.[0] || 
        error.response?.data?.username?.[0] || 
        error.response?.data?.message ||
        "Une erreur est survenue lors de la création du compte"
      );
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
            label="Nom d'utilisateur"
            name="username"
            value={formData.username}
            onChange={handleChange}
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
            size="lg"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
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
            <Option value="MEMBER">Membre</Option>
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