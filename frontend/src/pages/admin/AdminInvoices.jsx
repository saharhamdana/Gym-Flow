// frontend/src/pages/admin/AdminInvoices.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  IconButton,
  Input,
  Select,
  Option,
} from '@material-tailwind/react';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import api from '@/api/axiosInstance';

export function AdminInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
  });

  useEffect(() => {
    fetchInvoices();
    fetchStatistics();
  }, [filters]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;

      const response = await api.get('/billing/invoices/', { params });
      
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      
      setInvoices(data);
    } catch (error) {
      console.error('Erreur chargement factures:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/billing/invoices/statistics/');
      setStatistics(response.data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: 'green',
      PENDING: 'amber',
      DRAFT: 'gray',
      CANCELLED: 'red',
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PAID: 'Payée',
      PENDING: 'En attente',
      DRAFT: 'Brouillon',
      CANCELLED: 'Annulée',
    };
    return labels[status] || status;
  };

  return (
    <AdminLayout>
      <div className="mt-12 mb-8 flex flex-col gap-12">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card style={{ backgroundColor: '#00357a' }}>
              <CardBody className="text-center">
                <Typography variant="h3" color="white">
                  {statistics.total}
                </Typography>
                <Typography color="white" className="mt-2">
                  Total Factures
                </Typography>
              </CardBody>
            </Card>

            <Card style={{ backgroundColor: '#10b981' }}>
              <CardBody className="text-center">
                <Typography variant="h3" color="white">
                  {statistics.paid}
                </Typography>
                <Typography color="white" className="mt-2">
                  Payées
                </Typography>
              </CardBody>
            </Card>

            <Card style={{ backgroundColor: '#f59e0b' }}>
              <CardBody className="text-center">
                <Typography variant="h3" color="white">
                  {statistics.pending}
                </Typography>
                <Typography color="white" className="mt-2">
                  En attente
                </Typography>
              </CardBody>
            </Card>

            <Card style={{ backgroundColor: '#ef4444' }}>
              <CardBody className="text-center">
                <Typography variant="h3" color="white">
                  {statistics.overdue}
                </Typography>
                <Typography color="white" className="mt-2">
                  En retard
                </Typography>
              </CardBody>
            </Card>

            <Card style={{ backgroundColor: '#8b5cf6' }}>
              <CardBody className="text-center">
                <Typography variant="h3" color="white">
                  {statistics.total_revenue?.toFixed(3)}
                </Typography>
                <Typography color="white" className="mt-2">
                  Revenus TND
                </Typography>
              </CardBody>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader
            variant="gradient"
            style={{
              background: 'linear-gradient(87deg, #00357a 0, #0056b3 100%)',
            }}
            className="mb-8 p-6"
          >
            <div className="flex items-center justify-between">
              <Typography variant="h6" color="white">
                Gestion des Factures
              </Typography>
              <Button
                size="sm"
                color="white"
                className="flex items-center gap-2"
                onClick={() => navigate('/admin/invoices/create')}
              >
                <DocumentTextIcon className="h-4 w-4" />
                Nouvelle Facture
              </Button>
            </div>
          </CardHeader>

          <CardBody className="px-0 pt-0 pb-2">
            {/* Filters */}
            <div className="px-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Rechercher (N° facture, client)"
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
              <Select
                label="Statut"
                value={filters.status}
                onChange={(value) => setFilters({ ...filters, status: value })}
              >
                <Option value="">Tous</Option>
                <Option value="PAID">Payées</Option>
                <Option value="PENDING">En attente</Option>
                <Option value="DRAFT">Brouillon</Option>
                <Option value="CANCELLED">Annulées</Option>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Typography>Chargement...</Typography>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <Typography color="gray">Aucune facture trouvée</Typography>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto">
                  <thead>
                    <tr>
                      {[
                        'N° Facture',
                        'Client',
                        'Date',
                        'Montant HT',
                        'Total TTC',
                        'Statut',
                        'Actions',
                      ].map((head) => (
                        <th
                          key={head}
                          className="border-b border-blue-gray-50 py-3 px-5 text-left"
                        >
                          <Typography
                            variant="small"
                            className="text-[11px] font-bold uppercase text-blue-gray-400"
                          >
                            {head}
                          </Typography>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            className="font-semibold"
                            style={{ color: '#00357a' }}
                          >
                            {invoice.invoice_number}
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography variant="small" className="font-medium">
                            {invoice.member_name}
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography variant="small">
                            {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography variant="small">
                            {parseFloat(invoice.amount).toFixed(3)} TND
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Typography
                            variant="small"
                            className="font-bold"
                            style={{ color: '#00357a' }}
                          >
                            {parseFloat(invoice.total_amount).toFixed(3)} TND
                          </Typography>
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <Chip
                            size="sm"
                            variant="gradient"
                            value={getStatusLabel(invoice.status)}
                            color={getStatusColor(invoice.status)}
                          />
                        </td>
                        <td className="py-3 px-5 border-b border-blue-gray-50">
                          <div className="flex gap-2">
                            <IconButton
                              variant="text"
                              size="sm"
                              onClick={() =>
                                navigate(`/admin/invoices/${invoice.id}`)
                              }
                            >
                              <EyeIcon
                                className="h-4 w-4"
                                style={{ color: '#00357a' }}
                              />
                            </IconButton>
                            <IconButton variant="text" size="sm">
                              <ArrowDownTrayIcon
                                className="h-4 w-4"
                                style={{ color: '#9b0e16' }}
                              />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AdminInvoices;