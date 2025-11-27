// frontend/src/pages/member/MemberInvoices.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Chip, Progress } from "@material-tailwind/react";
import {
  DocumentTextIcon, ArrowDownTrayIcon, EyeIcon, CheckCircleIcon,
  XCircleIcon, ClockIcon, CalendarIcon, BanknotesIcon, ExclamationTriangleIcon
} from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const MemberInvoices = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [filter, setFilter] = useState('all'); // all, paid, pending

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      // ✅ CORRECTION: Utiliser my_invoices avec underscore
      const response = await api.get('/billing/invoices/my_invoices/');
      console.log('📄 Factures chargées:', response.data);
      setInvoices(response.data);
    } catch (error) {
      console.error('❌ Erreur chargement factures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      setDownloadingId(invoiceId);
      console.log('📥 Téléchargement facture:', invoiceId);

      const response = await api.get(`/billing/invoices/${invoiceId}/download_pdf/`, {
        responseType: 'blob'
      });

      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture_${invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      console.log('✅ Téléchargement réussi');
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PAID': 'green',
      'PENDING': 'amber',
      'DRAFT': 'gray',
      'CANCELLED': 'red',
      'REFUNDED': 'blue'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PAID': 'Payée',
      'PENDING': 'En attente',
      'DRAFT': 'Brouillon',
      'CANCELLED': 'Annulée',
      'REFUNDED': 'Remboursée'
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <ClockIcon className="h-5 w-5 text-amber-600" />;
      case 'CANCELLED':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filter === 'paid') return invoice.status === 'PAID';
    if (filter === 'pending') return invoice.status === 'PENDING';
    return true;
  });

  const totalPaid = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);

  const totalPending = invoices
    .filter(inv => inv.status === 'PENDING')
    .reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0);

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Typography className="text-gray-600">Chargement...</Typography>
          </div>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white">
          <Typography variant="h3" color="white" className="mb-2">
            Mes Factures
          </Typography>
          <Typography className="text-blue-100">
            Consultez et téléchargez vos factures
          </Typography>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-blue-500">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {invoices.length}
                </Typography>
                <Typography variant="small" color="gray">
                  Total factures
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-green-500">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {invoices.filter(inv => inv.status === 'PAID').length}
                </Typography>
                <Typography variant="small" color="gray">
                  Payées
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-amber-500">
            <CardBody className="flex items-center gap-4 p-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <ClockIcon className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <Typography variant="h4" color="blue-gray">
                  {invoices.filter(inv => inv.status === 'PENDING').length}
                </Typography>
                <Typography variant="small" color="gray">
                  En attente
                </Typography>
              </div>
            </CardBody>
          </Card>

          <Card className="border-l-4 border-purple-500">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BanknotesIcon className="h-6 w-6 text-purple-600" />
                <Typography variant="small" color="gray">
                  Total payé
                </Typography>
              </div>
              <Typography variant="h4" style={{ color: '#00357a' }}>
                {totalPaid.toFixed(3)} TND
              </Typography>
            </CardBody>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <Typography variant="h6" style={{ color: '#00357a' }}>
                Liste des factures
              </Typography>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'Toutes' },
                  { value: 'paid', label: 'Payées' },
                  { value: 'pending', label: 'En attente' }
                ].map(({ value, label }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={filter === value ? "filled" : "outlined"}
                    color={filter === value ? "blue" : "gray"}
                    onClick={() => setFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Liste des factures */}
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <Typography variant="h6" className="mb-2" style={{ color: '#00357a' }}>
                Aucune facture
              </Typography>
              <Typography className="text-gray-600">
                Vous n'avez pas encore de factures
              </Typography>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <Card key={invoice.id} className="border border-gray-200 hover:shadow-lg transition-shadow">
                <CardBody>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info facture */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          {getStatusIcon(invoice.status)}
                        </div>
                        <div>
                          <Typography variant="h6" color="blue-gray">
                            Facture {invoice.invoice_number}
                          </Typography>
                          <div className="flex items-center gap-2 mt-1">
                            <Chip
                              value={getStatusLabel(invoice.status)}
                              color={getStatusColor(invoice.status)}
                              size="sm"
                              icon={getStatusIcon(invoice.status)}
                            />
                            {invoice.is_overdue && invoice.status !== 'PAID' && (
                              <Chip
                                value="En retard"
                                color="red"
                                size="sm"
                                icon={<ExclamationTriangleIcon className="h-4 w-4" />}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Détails */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            Date d'émission
                          </Typography>
                          <Typography className="font-semibold">
                            {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            Date d'échéance
                          </Typography>
                          <Typography className="font-semibold">
                            {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <BanknotesIcon className="h-4 w-4" />
                            Montant HT
                          </Typography>
                          <Typography className="font-semibold">
                            {parseFloat(invoice.amount).toFixed(3)} TND
                          </Typography>
                        </div>

                        <div>
                          <Typography variant="small" className="text-gray-600 flex items-center gap-1">
                            <BanknotesIcon className="h-4 w-4" />
                            Total TTC
                          </Typography>
                          <Typography className="font-bold text-lg" style={{ color: '#00357a' }}>
                            {parseFloat(invoice.total_amount).toFixed(3)} TND
                          </Typography>
                        </div>
                      </div>

                      {/* Méthode de paiement */}
                      {invoice.payment_method && invoice.status === 'PAID' && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded">
                          <CheckCircleIcon className="h-4 w-4" />
                          <span>Payé par {invoice.payment_method}</span>
                          {invoice.payment_date && (
                            <span className="text-gray-600">
                              le {new Date(invoice.payment_date).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 md:w-48">
                      <Button
                        size="sm"
                        className="flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#00357a' }}
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoice_number)}
                        disabled={downloadingId === invoice.id}
                      >
                        {downloadingId === invoice.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Téléchargement...
                          </>
                        ) : (
                          <>
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Télécharger PDF
                          </>
                        )}
                      </Button>

                      <Button
                        size="sm"
                        variant="outlined"
                        className="flex items-center justify-center gap-2"
                        onClick={() => navigate(`/portal/invoices/${invoice.id}`)}
                      >
                        <EyeIcon className="h-4 w-4" />
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}

        {/* Informations légales */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardBody>
            <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
              📋 Informations importantes
            </Typography>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Les factures sont générées automatiquement après chaque paiement</p>
              <p>• Vous pouvez télécharger vos factures au format PDF à tout moment</p>
              <p>• Conservez vos factures pour votre comptabilité</p>
              <p>• En cas de question, contactez notre service administratif</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </MemberLayout>
  );
};

export default MemberInvoices;