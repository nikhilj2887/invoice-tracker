import React, { useEffect, useState } from 'react';
import { FileText, DollarSign, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import { formatCurrency, formatDateShort } from '../lib/invoiceUtils';
import { supabase, InvoiceWithClient } from '../lib/supabase';
import {
  getDashboardStats,
  getMonthlyRevenue,
  getStatusDistribution,
  getTopClients,
  DashboardStats,
  MonthlyRevenue,
  StatusDistribution,
  TopClient,
} from '../lib/analytics';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [statusDistribution, setStatusDistribution] = useState<StatusDistribution[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [recentInvoices, setRecentInvoices] = useState<InvoiceWithClient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [statsData, monthlyData, distributionData, clientsData, invoicesData] = await Promise.all([
        getDashboardStats(),
        getMonthlyRevenue(),
        getStatusDistribution(),
        getTopClients(),
        supabase
          .from('invoices')
          .select('*, client:clients(*)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      setStats(statsData);
      setMonthlyRevenue(monthlyData);
      setStatusDistribution(distributionData);
      setTopClients(clientsData);
      if (invoicesData.data) {
        setRecentInvoices(invoicesData.data as InvoiceWithClient[]);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your invoice activity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={FileText}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />
        <StatsCard
          title="Paid Invoices"
          value={stats.paidInvoices}
          icon={DollarSign}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />
        <StatsCard
          title="Pending Invoices"
          value={stats.pendingInvoices}
          icon={Clock}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
        />
        <StatsCard
          title="Overdue Invoices"
          value={stats.overdueInvoices}
          icon={AlertCircle}
          iconColor="text-red-600"
          iconBgColor="bg-red-100"
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBgColor="bg-emerald-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue (Last 6 Months)</h2>
          <div className="space-y-3">
            {monthlyRevenue.length > 0 ? (
              monthlyRevenue.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(item.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No revenue data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Distribution</h2>
          <div className="space-y-3">
            {statusDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h2>
        <div className="space-y-3">
          {topClients.length > 0 ? (
            topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                  <span className="text-sm text-gray-900">{client.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(client.revenue)}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No client data available</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Invoices</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-y border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentInvoices.length > 0 ? (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{invoice.client?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDateShort(invoice.invoice_date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatCurrency(invoice.total, invoice.currency)}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'Paid'
                            ? 'bg-green-100 text-green-800'
                            : invoice.status === 'Overdue'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No invoices found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
