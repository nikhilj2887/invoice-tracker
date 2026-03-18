/*
  # Add Currency Support to Invoices

  1. Changes
    - Add `currency` column to `invoices` table
    - Default currency is 'USD'
    - Supported currencies: USD, EUR, INR
  
  2. Notes
    - Existing invoices will default to USD
    - Currency is stored as a 3-letter code (ISO 4217)
*/

-- Add currency column to invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'currency'
  ) THEN
    ALTER TABLE invoices ADD COLUMN currency text DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR', 'INR'));
  END IF;
END $$;

-- Update existing invoices to use USD as default currency
UPDATE invoices SET currency = 'USD' WHERE currency IS NULL;
