// frontend/src/pages/member/MemberInvoiceDetail.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/member/MemberLayout';
import { Card, CardBody, Typography, Button, Chip } from "@material-tailwind/react";
import {
  ArrowLeftIcon, ArrowDownTrayIcon, CheckCircleIcon,
  CalendarIcon, BanknotesIcon, DocumentTextIcon
} from "@heroicons/react/24/solid";
import api from '../../api/axiosInstance';

const MemberInvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchInvoiceDetail();
  }, [id]);

  const fetchInvoiceDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/billing/invoices/${id}/`);
      console.log('📄 Facture détail:', response.data);
      setInvoice(response.data);
    } catch (error) {
      console.error('❌ Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const response = await api.get(`/billing/invoices/${id}/download_pdf/`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Facture_${invoice.invoice_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('❌ Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'PAID': 'green',
      'PENDING': 'amber',
      'DRAFT': 'gray',
      'CANCELLED': 'red'
    };
    return colors[status] || 'gray';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PAID': 'Payée',
      'PENDING': 'En attente',
      'DRAFT': 'Brouillon',
      'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <MemberLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </MemberLayout>
    );
  }

  if (!invoice) {
    return (
      <MemberLayout>
        <div className="text-center py-12">
          <Typography variant="h5" color="red">
            Facture introuvable
          </Typography>
          <Button
            className="mt-4"
            onClick={() => navigate('/portal/invoices')}
          >
            Retour aux factures
          </Button>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/portal/invoices')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Retour aux factures
          </button>
          <Button
            size="sm"
            className="flex items-center gap-2"
            style={{ backgroundColor: '#00357a' }}
            onClick={handleDownloadPDF}
            disabled={downloading}
          >
            {downloading ? (
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
        </div>

        {/* En-tête facture */}
        <Card>
          <CardBody>
            <div className="flex items-start justify-between mb-6">
              <div>
                <Typography variant="h3" style={{ color: '#00357a' }} className="mb-2">
                  Facture {invoice.invoice_number}
                </Typography>
                <Typography variant="small" className="text-gray-600">
                  Émise le {new Date(invoice.issue_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Typography>
              </div>
              <Chip
                value={getStatusLabel(invoice.status)}
                color={getStatusColor(invoice.status)}
                size="lg"
                icon={invoice.status === 'PAID' ? <CheckCircleIcon className="h-5 w-5" /> : null}
              />
            </div>

            {/* Infos société / client */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
                  De
                </Typography>
                <Typography className="font-semibold">{invoice.company_name}</Typography>
                <Typography variant="small" className="text-gray-600">
                  {invoice.company_address}
                </Typography>
                {invoice.company_tax_id && (
                  <Typography variant="small" className="text-gray-600">
                    TVA: {invoice.company_tax_id}
                  </Typography>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
                  À
                </Typography>
                <Typography className="font-semibold">{invoice.customer_name}</Typography>
                <Typography variant="small" className="text-gray-600">
                  {invoice.customer_email}
                </Typography>
                {invoice.customer_address && (
                  <Typography variant="small" className="text-gray-600">
                    {invoice.customer_address}
                  </Typography>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <CalendarIcon className="h-6 w-6" style={{ color: '#9b0e16' }} />
                <div>
                  <Typography variant="small" className="text-gray-600">
                    Date d'émission
                  </Typography>
                  <Typography className="font-semibold">
                    {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                  </Typography>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border rounded-lg">
                <CalendarIcon className="h-6 w-6" style={{ color: '#9b0e16' }} />
                <div>
                  <Typography variant="small" className="text-gray-600">
                    Date d'échéance
                  </Typography>
                  <Typography className="font-semibold">
                    {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                  </Typography>
                </div>
              </div>

              {invoice.payment_date && (
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <div>
                    <Typography variant="small" className="text-gray-600">
                      Date de paiement
                    </Typography>
                    <Typography className="font-semibold text-green-700">
                      {new Date(invoice.payment_date).toLocaleDateString('fr-FR')}
                    </Typography>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Lignes de facture */}
        <Card>
          <CardBody>
            <Typography variant="h6" className="mb-4" style={{ color: '#00357a' }}>
              Détails de la facture
            </Typography>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4">Description</th>
                    <th className="text-center py-3 px-4">Quantité</th>
                    <th className="text-right py-3 px-4">Prix Unit. (TND)</th>
                    <th className="text-right py-3 px-4">Total (TND)</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.line_items.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="py-3 px-4">{item.description}</td>
                      <td className="text-center py-3 px-4">{item.quantity || 1}</td>
                      <td className="text-right py-3 px-4">
                        {parseFloat(item.unit_price).toFixed(3)}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold">
                        {parseFloat(item.total).toFixed(3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totaux */}
            <div className="mt-6 flex justify-end">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <Typography variant="small" className="text-gray-600">
                    Sous-total HT:
                  </Typography>
                  <Typography className="font-semibold">
                    {parseFloat(invoice.amount).toFixed(3)} TND
                  </Typography>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <Typography variant="small" className="text-gray-600">
                    TVA ({invoice.tax_rate}%):
                  </Typography>
                  <Typography className="font-semibold">
                    {parseFloat(invoice.tax_amount).toFixed(3)} TND
                  </Typography>
                </div>

                <div className="flex justify-between py-3 bg-gray-100 px-4 rounded-lg">
                  <Typography variant="h6" style={{ color: '#00357a' }}>
                    TOTAL TTC:
                  </Typography>
                  <Typography variant="h5" style={{ color: '#00357a' }}>
                    {parseFloat(invoice.total_amount).toFixed(3)} TND
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Paiement */}
        {invoice.status === 'PAID' && (
          <Card className="bg-green-50 border border-green-200">
            <CardBody>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <Typography variant="h6" className="text-green-700 mb-1">
                    Facture payée
                  </Typography>
                  <Typography variant="small" className="text-gray-700">
                    Méthode: {invoice.payment_method}
                    {invoice.payment_date && (
                      <> • Payé le {new Date(invoice.payment_date).toLocaleDateString('fr-FR')}</>
                    )}
                  </Typography>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <CardBody>
              <Typography variant="h6" className="mb-3" style={{ color: '#00357a' }}>
                Notes
              </Typography>
              <Typography className="text-gray-700 whitespace-pre-wrap">
                {invoice.notes}
              </Typography>
            </CardBody>
          </Card>
        )}
      </div>
    </MemberLayout>
  );
};

export default MemberInvoiceDetail;