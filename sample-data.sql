-- Sample data for Invoice Tracker
-- Run this in the Supabase SQL Editor to populate your database with example data

-- Insert sample clients
INSERT INTO clients (id, name, email, address, phone) VALUES
('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', 'Acme Corporation', 'billing@acmecorp.com', '123 Business Ave, New York, NY 10001', '(555) 123-4567'),
('b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', 'TechStart Inc', 'accounts@techstart.io', '456 Innovation Drive, San Francisco, CA 94102', '(555) 234-5678'),
('c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', 'Global Consulting Group', 'finance@globalcg.com', '789 Executive Blvd, Chicago, IL 60601', '(555) 345-6789'),
('d4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', 'Creative Studios Ltd', 'admin@creativestudios.com', '321 Design Street, Austin, TX 78701', '(555) 456-7890'),
('e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', 'Northwest Manufacturing', 'payables@nwmfg.com', '654 Industry Parkway, Seattle, WA 98101', '(555) 567-8901');

-- Insert sample invoices
INSERT INTO invoices (id, invoice_number, client_id, invoice_date, due_date, subtotal, tax, total, status, notes) VALUES
('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'INV-2026-001', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2026-03-01', '2026-03-31', 5000.00, 400.00, 5400.00, 'Paid', 'Payment received via wire transfer. Thank you!'),
('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'INV-2026-002', 'b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e', '2026-03-05', '2026-04-04', 3500.00, 280.00, 3780.00, 'Paid', 'Monthly retainer for March 2026'),
('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'INV-2026-003', 'c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f', '2026-03-10', '2026-04-09', 7500.00, 600.00, 8100.00, 'Pending', 'Consulting services for Q1 2026'),
('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'INV-2026-004', 'd4e5f6a7-b8c9-7d8e-1f2a-3b4c5d6e7f8a', '2026-03-15', '2026-04-14', 4200.00, 336.00, 4536.00, 'Pending', 'Website redesign project - Phase 1'),
('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'INV-2026-005', 'e5f6a7b8-c9d0-8e9f-2a3b-4c5d6e7f8a9b', '2026-02-20', '2026-03-22', 2800.00, 224.00, 3024.00, 'Overdue', 'Payment terms: Net 30 days'),
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'INV-2026-006', 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d', '2026-02-15', '2026-03-17', 6500.00, 520.00, 7020.00, 'Paid', 'Annual support contract renewal');

-- Insert sample invoice items for INV-2026-001
INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES
('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'Web Development Services', 40, 100.00, 4000.00),
('f6a7b8c9-d0e1-9f0a-3b4c-5d6e7f8a9b0c', 'UI/UX Design Consultation', 10, 100.00, 1000.00);

-- Insert sample invoice items for INV-2026-002
INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES
('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'Monthly Retainer - Development', 1, 3000.00, 3000.00),
('a7b8c9d0-e1f2-0a1b-4c5d-6e7f8a9b0c1d', 'Additional Support Hours', 5, 100.00, 500.00);

-- Insert sample invoice items for INV-2026-003
INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES
('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'Business Strategy Consulting', 30, 150.00, 4500.00),
('b8c9d0e1-f2a3-1b2c-5d6e-7f8a9b0c1d2e', 'Market Research & Analysis', 20, 150.00, 3000.00);

-- Insert sample invoice items for INV-2026-004
INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES
('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'Homepage Redesign', 1, 2000.00, 2000.00),
('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'Custom Graphics & Illustrations', 8, 150.00, 1200.00),
('c9d0e1f2-a3b4-2c3d-6e7f-8a9b0c1d2e3f', 'Responsive Implementation', 10, 100.00, 1000.00);

-- Insert sample invoice items for INV-2026-005
INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES
('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'Product Photography', 20, 75.00, 1500.00),
('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'Image Editing & Retouching', 10, 80.00, 800.00),
('d0e1f2a3-b4c5-3d4e-7f8a-9b0c1d2e3f4a', 'Studio Rental', 1, 500.00, 500.00);

-- Insert sample invoice items for INV-2026-006
INSERT INTO invoice_items (invoice_id, description, quantity, price, total) VALUES
('e1f2a3b4-c5d6-4e5f-8a9b-0c1d2e3f4a5b', 'Annual Technical Support Contract', 1, 6500.00, 6500.00);
