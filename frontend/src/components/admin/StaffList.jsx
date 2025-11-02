import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  Typography,
  CardBody,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Input,
  Button,
} from "@material-tailwind/react";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axiosInstance from "../../api/axiosInstance";

const TABLE_HEAD = ["Membre", "Email", "Rôle", "Actions"];

const ROLE_COLORS = {
  ADMIN: "blue",
  COACH: "green",
  RECEPTIONIST: "amber",
  MEMBER: "gray",
};

export function StaffList() {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    const filtered = staff.filter(
      (member) =>
        member.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStaff(filtered);
  }, [searchQuery, staff]);

  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get("/api/auth/users/");
      setStaff(response.data);
      setFilteredStaff(response.data);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.patch(`/api/auth/users/${userId}/`, {
        role: newRole,
      });
      fetchStaff(); // Refresh the list after update
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const getRoleOptions = (currentRole) => {
    const roles = ["ADMIN", "COACH", "RECEPTIONIST"];
    return roles.filter(role => role !== currentRole);
  };

  return (
    <div className="px-6 py-4">
      <div className="mb-8 flex items-center justify-between gap-8">
        <div>
          <Typography variant="h5" color="blue-gray">
            Liste du Personnel
          </Typography>
          <Typography color="gray" className="mt-1 font-normal">
            Voir et gérer les membres du personnel
          </Typography>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <div className="w-full md:w-72">
            <Input
              label="Rechercher"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            className="flex items-center gap-3"
            color="blue"
            onClick={() => window.location.href = '/admin/users/create'}
          >
            <UserPlusIcon strokeWidth={2} className="h-4 w-4" /> Ajouter un utilisateur
          </Button>
        </div>
      </div>
      <CardBody className="overflow-scroll px-0">
        <table className="mt-4 w-full min-w-max table-auto text-left">
          <thead>
            <tr>
              {TABLE_HEAD.map((head) => (
                <th
                  key={head}
                  className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                >
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal leading-none opacity-70"
                  >
                    {head}
                  </Typography>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStaff.map(
              ({ id, first_name, last_name, email, role, profile_picture }, index) => {
                const isLast = index === filteredStaff.length - 1;
                const classes = isLast
                  ? "p-4"
                  : "p-4 border-b border-blue-gray-50";

                return (
                  <tr key={id}>
                    <td className={classes}>
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={profile_picture || "/img/default-avatar.png"}
                          alt={first_name}
                          size="sm"
                        />
                        <div className="flex flex-col">
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-normal"
                          >
                            {first_name} {last_name}
                          </Typography>
                        </div>
                      </div>
                    </td>
                    <td className={classes}>
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-normal"
                      >
                        {email}
                      </Typography>
                    </td>
                    <td className={classes}>
                      <div className="w-max">
                        <Chip
                          variant="ghost"
                          size="sm"
                          value={role}
                          color={ROLE_COLORS[role]}
                        />
                      </div>
                    </td>
                    <td className={classes}>
                      <div className="flex gap-2">
                        {getRoleOptions(role).map((newRole) => (
                          <Tooltip key={newRole} content={`Changer en ${newRole}`}>
                            <IconButton
                              variant="text"
                              color={ROLE_COLORS[newRole]}
                              onClick={() => handleRoleChange(id, newRole)}
                            >
                              <Chip
                                variant="ghost"
                                size="sm"
                                value={newRole.charAt(0)}
                                color={ROLE_COLORS[newRole]}
                              />
                            </IconButton>
                          </Tooltip>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </CardBody>
    </div>
  );
}