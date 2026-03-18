import React, { useEffect, useState } from 'react';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { supabase, InvoiceWithDetails, CompanySettings } from '../lib/supabase';
import { formatCurrency, formatDate } from '../lib/invoiceUtils';
import { generateInvoicePDF } from '../lib/pdfGenerator';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

interface InvoiceDetailProps {
  invoiceId: string;
  onBack: () => void;
}

export default function InvoiceDetail({ invoiceId, onBack }: InvoiceDetailProps) {
  const [invoice, setInvoice] = useState<InvoiceWithDetails | null>(null);
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [invoiceId]);

  async function loadInvoice() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [invoiceResult, settingsResult] = await Promise.all([
        supabase
          .from('invoices')
          .select('*, client:clients(*), invoice_items(*)')
          .eq('id', invoiceId)
          .single(),
        supabase
          .from('company_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      if (invoiceResult.error) throw invoiceResult.error;
      setInvoice(invoiceResult.data as InvoiceWithDetails);

      if (settingsResult.data) {
        setCompanySettings(settingsResult.data);
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsPaid() {
    if (!invoice) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'Paid' })
        .eq('id', invoiceId);

      if (error) throw error;

      setInvoice({ ...invoice, status: 'Paid' });
      alert('Invoice marked as paid!');
    } catch (error) {
      console.error('Error updating invoice:', error);
      alert('Failed to update invoice status');
    } finally {
      setUpdatingStatus(false);
    }
  }

  function handleDownloadPDF() {
    if (invoice && companySettings) {
      generateInvoicePDF(invoice, companySettings);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading invoice...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Invoice not found</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Invoices
        </button>
        <div className="flex gap-3">
          {invoice.status !== 'Paid' && (
            <Button onClick={handleMarkAsPaid} disabled={updatingStatus} variant="success">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Paid
            </Button>
          )}
          <Button onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-orange-500">
        <div className="bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500 opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-orange-400 opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">INVOICE</h1>
              <p className="text-orange-300 text-lg font-semibold">#{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              {companySettings?.logo_url && (
                <img
                  src={companySettings.logo_url}
                  alt="Company Logo"
                  className="h-16 ml-auto mb-3 drop-shadow-lg"
                />
              )}
              <h2 className="text-2xl font-bold mb-2">{companySettings?.company_name || 'Your Company Name'}</h2>
              <p className="text-slate-300 text-sm">{companySettings?.company_address || '123 Business Street, City, State 12345'}</p>
              <p className="text-slate-300 text-sm">{companySettings?.company_email || 'contact@yourcompany.com'}</p>
              <p className="text-slate-300 text-sm">{companySettings?.company_phone || '(555) 123-4567'}</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gradient-to-b from-gray-50 to-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-slate-600">
              <h3 className="text-sm font-semibold text-slate-700 uppercase mb-3 flex items-center">
                <span className="w-2 h-2 bg-slate-600 rounded-full mr-2"></span>
                Bill To
              </h3>
              <p className="font-bold text-gray-900 text-lg">{invoice.client.name}</p>
              {invoice.client.address && (
                <p className="text-gray-600 text-sm mt-2">{invoice.client.address}</p>
              )}
              {invoice.client.email && (
                <p className="text-gray-600 text-sm mt-1">{invoice.client.email}</p>
              )}
              {invoice.client.phone && (
                <p className="text-gray-600 text-sm">{invoice.client.phone}</p>
              )}
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-teal-500">
              <h3 className="text-sm font-semibold text-teal-700 uppercase mb-3 flex items-center">
                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                Invoice Date
              </h3>
              <p className="text-gray-900 font-semibold text-lg">{formatDate(invoice.invoice_date)}</p>
            </div>

            <div className="bg-white p-5 rounded-lg shadow-sm border-l-4 border-orange-500">
              <h3 className="text-sm font-semibold text-orange-700 uppercase mb-3 flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                Due Date
              </h3>
              <p className="text-gray-900 font-semibold text-lg">{formatDate(invoice.due_date)}</p>
            </div>
          </div>

          <div className="mb-6">
            <StatusBadge status={invoice.status} />
          </div>

          <div className="overflow-x-auto mb-8 bg-white rounded-lg shadow-sm">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-700 to-slate-600 border-b-2 border-orange-400">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-orange-200 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {invoice.invoice_items.map((item, index) => (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.description}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700 font-medium">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-700 font-medium">
                      {formatCurrency(item.price, invoice.currency)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <div className="w-80 bg-gradient-to-br from-slate-50 to-orange-50 p-6 rounded-lg shadow-md border border-slate-200">
              <div className="space-y-3">
                <div className="flex justify-between text-gray-700 pb-2">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-gray-700 pb-3 border-b border-gray-300">
                  <span className="font-medium">Tax:</span>
                  <span className="font-semibold">{formatCurrency(invoice.tax, invoice.currency)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-800 text-white p-4 rounded-lg shadow-sm">
                  <span>Total:</span>
                  <span className="text-orange-300">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-amber-50 border-l-4 border-amber-400 p-5 rounded-r-lg">
                <h3 className="text-sm font-bold text-amber-900 uppercase mb-3 flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  Notes
                </h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
              </div>
            </div>
          )}

          {companySettings?.signature_url && (
            <div className="mt-10 flex justify-end">
              <div className="text-center">
                <img
                  src={companySettings.signature_url}
                  alt="Signature"
                  className="max-h-16 max-w-48 mb-2"
                />
                <div className="border-t-2 border-slate-800 pt-2 min-w-[200px]">
                  <p className="text-sm font-semibold text-slate-600">Authorized Signature</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center">
            <div className="bg-gradient-to-r from-slate-100 via-slate-50 to-orange-50 p-6 rounded-lg inline-block border border-slate-200">
              <p className="text-lg font-semibold text-slate-800">Thank you for your business!</p>
              <p className="mt-2 text-sm text-gray-600">
                Please make payment within {' '}
                <span className="font-bold text-orange-600">
                  {Math.ceil(
                    (new Date(invoice.due_date).getTime() - new Date(invoice.invoice_date).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}
                </span>
                {' '} days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
