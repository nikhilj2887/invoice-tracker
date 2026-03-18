# Invoice Tracker

A complete, production-ready invoice tracking web application for solo business owners. Built with React, TypeScript, TailwindCSS, and Supabase.

## Features

- **Dashboard Analytics** - View key metrics including total invoices, revenue, pending payments, and overdue invoices
- **Invoice Management** - Create, view, and manage professional invoices with automatic numbering
- **Client Management** - Store and manage client information
- **PDF Generation** - Download beautifully designed, branded invoice PDFs
- **Status Tracking** - Automatic detection of overdue invoices
- **Search & Filter** - Easily find invoices by client name, invoice number, or status
- **Revenue Analytics** - Track monthly revenue and top clients

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **PDF Generation**: Browser-based print functionality

## Database Schema

### Clients Table
- `id` - UUID primary key
- `name` - Client name
- `email` - Client email
- `address` - Client address
- `phone` - Client phone number
- `created_at` - Record creation timestamp

### Invoices Table
- `id` - UUID primary key
- `invoice_number` - Auto-generated (format: INV-YYYY-001)
- `client_id` - Foreign key to clients
- `invoice_date` - Invoice creation date
- `due_date` - Payment due date
- `subtotal` - Sum of line items
- `tax` - Tax amount
- `total` - Total amount (subtotal + tax)
- `status` - Payment status (Paid, Pending, Overdue)
- `payment_method` - How payment was received
- `notes` - Additional notes
- `created_at` - Record creation timestamp

### Invoice Items Table
- `id` - UUID primary key
- `invoice_id` - Foreign key to invoices
- `description` - Item description
- `quantity` - Quantity
- `price` - Unit price
- `total` - Line item total

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables:
   - Copy `.env` and add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. The database schema is already created via Supabase migrations

5. (Optional) Load sample data:
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `sample-data.sql`
   - Run the query

6. Start the development server:
   ```bash
   npm run dev
   ```

## Customization

### Company Branding

To customize your company information on invoices, edit the following files:

1. **Invoice Detail Page** (`src/pages/InvoiceDetail.tsx`):
   - Update company name, address, and contact information in the header section

2. **PDF Generator** (`src/lib/pdfGenerator.ts`):
   - Update company details in the `company-details` section
   - Modify colors by changing the gradient values
   - Adjust styling to match your brand

### Tax Rate

The default tax rate is 0%. To set a different default:
- Edit `src/pages/CreateInvoice.tsx`
- Modify the initial state: `const [taxRate, setTaxRate] = useState(0);`
- Change `0` to your desired default percentage (e.g., `8.5` for 8.5%)

### Invoice Number Format

To change the invoice number format:
- Edit `src/lib/invoiceUtils.ts`
- Modify the `generateInvoiceNumber()` function
- Current format: `INV-YYYY-001`

## Usage Guide

### Creating an Invoice

1. Navigate to "Create Invoice"
2. Select a client or create a new one
3. Set invoice and due dates
4. Add line items with descriptions, quantities, and prices
5. Set tax rate if applicable
6. Add any notes
7. Click "Create Invoice"

### Managing Clients

1. Navigate to "Clients"
2. Click "Add Client" to create a new client
3. Click the edit icon to update client information
4. Click the trash icon to delete a client (this will also delete their invoices)

### Viewing Invoice Details

1. Navigate to "Invoices"
2. Click "View" on any invoice
3. From the detail page you can:
   - Download the invoice as a PDF
   - Mark the invoice as paid
   - View all line items and calculations

### Downloading PDFs

1. Open any invoice detail page
2. Click "Download PDF"
3. A new window will open with the formatted invoice
4. Use your browser's print dialog to save as PDF or print

## Deployment

### Deploy to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Visit [vercel.com](https://vercel.com) and sign in

3. Click "Add New Project" and import your repository

4. Configure your environment variables:
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

5. Deploy

Your application will be available at a Vercel URL (e.g., `your-app.vercel.app`)

### Deploy to Netlify

1. Push your code to a Git repository

2. Visit [netlify.com](https://netlify.com) and sign in

3. Click "Add new site" and import your repository

4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

5. Add environment variables:
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`

6. Deploy

## Security Notes

This application is designed for **single-user use**. The database policies allow public access since there's only one user.

For production use with multiple users, you should:
1. Implement Supabase authentication
2. Update Row Level Security policies to restrict access by user
3. Add user ownership to all tables

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Layout.tsx
│   ├── Modal.tsx
│   ├── Select.tsx
│   ├── StatsCard.tsx
│   └── StatusBadge.tsx
├── lib/             # Utilities and configurations
│   ├── analytics.ts     # Analytics calculations
│   ├── invoiceUtils.ts  # Invoice helper functions
│   ├── pdfGenerator.ts  # PDF generation
│   └── supabase.ts      # Supabase client & types
├── pages/           # Main application pages
│   ├── ClientManagement.tsx
│   ├── CreateInvoice.tsx
│   ├── Dashboard.tsx
│   ├── InvoiceDetail.tsx
│   └── InvoiceList.tsx
├── App.tsx          # Main app with routing
└── main.tsx         # Application entry point
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Support

For issues or questions:
1. Check the database schema in Supabase
2. Review the browser console for errors
3. Ensure environment variables are set correctly

## License

MIT License - feel free to use this for your business!

## Acknowledgments

Built with modern web technologies:
- React & TypeScript for type-safe development
- TailwindCSS for beautiful, responsive design
- Supabase for instant backend and database
- Vite for lightning-fast development
