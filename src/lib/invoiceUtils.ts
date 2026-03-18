import { supabase, Currency } from './supabase';

export async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();

  const { data: invoices, error } = await supabase
    .from('invoices')
    .select('invoice_number')
    .ilike('invoice_number', `INV-${year}-%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    const timestamp = Date.now().toString().slice(-4);
    return `INV-${year}-${timestamp}`;
  }

  if (!invoices || invoices.length === 0) {
    return `INV-${year}-001`;
  }

  const numbers = invoices
    .map(inv => {
      const match = inv.invoice_number.match(/INV-\d{4}-(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter(num => num > 0);

  const maxNumber = numbers.length > 0 ? Math.max(...numbers) : 0;
  const nextNumber = maxNumber + 1;

  return `INV-${year}-${nextNumber.toString().padStart(3, '0')}`;
}

export function calculateLineTotal(quantity: number, price: number): number {
  return Number((quantity * price).toFixed(2));
}

export function calculateSubtotal(items: Array<{ quantity: number; price: number }>): number {
  const total = items.reduce((sum, item) => sum + calculateLineTotal(item.quantity, item.price), 0);
  return Number(total.toFixed(2));
}

export function calculateTax(subtotal: number, taxRate: number = 0): number {
  return Number((subtotal * taxRate).toFixed(2));
}

export function calculateTotal(subtotal: number, tax: number): number {
  return Number((subtotal + tax).toFixed(2));
}

export function isOverdue(dueDate: string, status: string): boolean {
  if (status === 'Paid') return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export function formatCurrency(amount: number, currency: Currency = 'USD'): string {
  const currencyConfig: Record<Currency, { locale: string; currency: string }> = {
    USD: { locale: 'en-US', currency: 'USD' },
    EUR: { locale: 'de-DE', currency: 'EUR' },
    INR: { locale: 'en-IN', currency: 'INR' },
  };

  const config = currencyConfig[currency];

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
  }).format(amount);
}

export function getCurrencySymbol(currency: Currency): string {
  const symbols: Record<Currency, string> = {
    USD: '$',
    EUR: '€',
    INR: '₹',
  };
  return symbols[currency];
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}
