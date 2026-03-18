import { useState } from 'react';
import { AuthProvider, useAuth } from './lib/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/InvoiceList';
import CreateInvoice from './pages/CreateInvoice';
import InvoiceDetail from './pages/InvoiceDetail';
import ClientManagement from './pages/ClientManagement';
import CompanySettings from './pages/CompanySettings';
import Auth from './pages/Auth';

type Page = 'dashboard' | 'invoices' | 'clients' | 'create' | 'invoice-detail' | 'settings';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  function handleNavigate(page: 'dashboard' | 'invoices' | 'clients' | 'create' | 'settings') {
    setCurrentPage(page);
    setSelectedInvoiceId(null);
  }

  function handleViewInvoice(invoiceId: string) {
    setSelectedInvoiceId(invoiceId);
    setCurrentPage('invoice-detail');
  }

  function handleInvoiceCreated() {
    setCurrentPage('invoices');
  }

  function handleBackToInvoices() {
    setCurrentPage('invoices');
    setSelectedInvoiceId(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth onAuthSuccess={() => window.location.reload()} />;
  }

  return (
    <Layout currentPage={currentPage === 'invoice-detail' ? 'invoices' : currentPage} onNavigate={handleNavigate}>
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'invoices' && <InvoiceList onViewInvoice={handleViewInvoice} />}
      {currentPage === 'create' && <CreateInvoice onSuccess={handleInvoiceCreated} />}
      {currentPage === 'invoice-detail' && selectedInvoiceId && (
        <InvoiceDetail invoiceId={selectedInvoiceId} onBack={handleBackToInvoices} />
      )}
      {currentPage === 'clients' && <ClientManagement />}
      {currentPage === 'settings' && <CompanySettings />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
