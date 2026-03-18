/*
  # Invoice Tracking System Database Schema

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `name` (text) - Client's full name or company name
      - `email` (text) - Client's email address
      - `address` (text) - Client's physical address
      - `phone` (text) - Client's phone number
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `invoices`
      - `id` (uuid, primary key)
      - `invoice_number` (text, unique) - Auto-generated invoice number (INV-YYYY-001)
      - `client_id` (uuid, foreign key to clients)
      - `invoice_date` (date) - Date invoice was created
      - `due_date` (date) - Payment due date
      - `subtotal` (numeric) - Sum of all line items
      - `tax` (numeric) - Tax amount
      - `total` (numeric) - Final total (subtotal + tax)
      - `status` (text) - Payment status: 'Paid', 'Pending', or 'Overdue'
      - `payment_method` (text) - How payment was received (optional)
      - `notes` (text) - Additional notes or payment instructions
      - `created_at` (timestamptz) - Record creation timestamp
    
    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key to invoices)
      - `description` (text) - Item/service description
      - `quantity` (numeric) - Quantity of items
      - `price` (numeric) - Price per unit
      - `total` (numeric) - Line item total (quantity × price)

  2. Security
    - Enable RLS on all tables
    - Since this is a single-user app, policies allow public access
    - In production, you would add authentication and restrict to the owner

  3. Indexes
    - Index on invoice_number for fast lookups
    - Index on client_id for relationship queries
    - Index on invoice_date and status for filtering and analytics
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  address text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number text UNIQUE NOT NULL,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  invoice_date date NOT NULL DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  subtotal numeric(10, 2) DEFAULT 0,
  tax numeric(10, 2) DEFAULT 0,
  total numeric(10, 2) DEFAULT 0,
  status text DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric(10, 2) NOT NULL,
  price numeric(10, 2) NOT NULL,
  total numeric(10, 2) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for single-user app (allow all operations)
-- Note: In a production multi-user app, you would add authentication checks

CREATE POLICY "Allow public read access to clients"
  ON clients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to clients"
  ON clients FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to clients"
  ON clients FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from clients"
  ON clients FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to invoices"
  ON invoices FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to invoices"
  ON invoices FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to invoices"
  ON invoices FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from invoices"
  ON invoices FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to invoice_items"
  ON invoice_items FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert to invoice_items"
  ON invoice_items FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update to invoice_items"
  ON invoice_items FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from invoice_items"
  ON invoice_items FOR DELETE
  TO public
  USING (true);