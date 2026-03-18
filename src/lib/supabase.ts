import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  created_at: string;
}

export interface CompanySettings {
  id: string;
  user_id: string;
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  logo_url: string | null;
  signature_url: string | null;
  created_at: string;
  updated_at: string;
}

export type Currency = 'USD' | 'EUR' | 'INR';

export interface Invoice {
  id: string;
  user_id: string;
  invoice_number: string;
  client_id: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  currency: Currency;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceWithClient extends Invoice {
  client: Client;
}

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  invoice_items: InvoiceItem[];
}
