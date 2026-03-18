import { supabase, Invoice, InvoiceWithClient } from './supabase';
import { isOverdue } from './invoiceUtils';

export interface DashboardStats {
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageInvoiceValue: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface StatusDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopClient {
  name: string;
  revenue: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*');

  if (error || !invoices) {
    return {
      totalInvoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageInvoiceValue: 0,
    };
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = invoices.reduce(
    (acc, invoice) => {
      acc.totalInvoices++;

      if (invoice.status === 'Paid') {
        acc.paidInvoices++;
        acc.totalRevenue += Number(invoice.total);
      } else if (isOverdue(invoice.due_date, invoice.status)) {
        acc.overdueInvoices++;
      } else {
        acc.pendingInvoices++;
      }

      const invoiceDate = new Date(invoice.invoice_date);
      if (
        invoice.status === 'Paid' &&
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear
      ) {
        acc.monthlyRevenue += Number(invoice.total);
      }

      return acc;
    },
    {
      totalInvoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0,
      overdueInvoices: 0,
      totalRevenue: 0,
      monthlyRevenue: 0,
      averageInvoiceValue: 0,
    }
  );

  stats.averageInvoiceValue =
    stats.paidInvoices > 0 ? stats.totalRevenue / stats.paidInvoices : 0;

  return stats;
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('status', 'Paid')
    .order('invoice_date', { ascending: true });

  if (error || !invoices) {
    return [];
  }

  const revenueByMonth: { [key: string]: number } = {};

  invoices.forEach((invoice) => {
    const date = new Date(invoice.invoice_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!revenueByMonth[monthKey]) {
      revenueByMonth[monthKey] = 0;
    }

    revenueByMonth[monthKey] += Number(invoice.total);
  });

  const monthlyData = Object.entries(revenueByMonth)
    .map(([month, revenue]) => ({
      month,
      revenue: Number(revenue.toFixed(2)),
    }))
    .slice(-6);

  return monthlyData;
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  const { data: invoices, error } = await supabase.from('invoices').select('*');

  if (error || !invoices) {
    return [];
  }

  const distribution = invoices.reduce(
    (acc, invoice) => {
      if (invoice.status === 'Paid') {
        acc.paid++;
      } else if (isOverdue(invoice.due_date, invoice.status)) {
        acc.overdue++;
      } else {
        acc.pending++;
      }
      return acc;
    },
    { paid: 0, pending: 0, overdue: 0 }
  );

  return [
    { name: 'Paid', value: distribution.paid, color: '#10b981' },
    { name: 'Pending', value: distribution.pending, color: '#f59e0b' },
    { name: 'Overdue', value: distribution.overdue, color: '#ef4444' },
  ];
}

export async function getTopClients(limit: number = 5): Promise<TopClient[]> {
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('*, client:clients(*)')
    .eq('status', 'Paid');

  if (error || !invoices) {
    return [];
  }

  const clientRevenue: { [key: string]: { name: string; revenue: number } } = {};

  (invoices as InvoiceWithClient[]).forEach((invoice) => {
    const clientId = invoice.client_id;
    const clientName = invoice.client?.name || 'Unknown';

    if (!clientRevenue[clientId]) {
      clientRevenue[clientId] = { name: clientName, revenue: 0 };
    }

    clientRevenue[clientId].revenue += Number(invoice.total);
  });

  return Object.values(clientRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map((client) => ({
      name: client.name,
      revenue: Number(client.revenue.toFixed(2)),
    }));
}
