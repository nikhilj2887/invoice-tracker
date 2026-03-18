import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { supabase, Client, Currency } from '../lib/supabase';
import {
  generateInvoiceNumber,
  calculateLineTotal,
  calculateSubtotal,
  calculateTax,
  calculateTotal,
  formatCurrency,
} from '../lib/invoiceUtils';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';

interface LineItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface CreateInvoiceProps {
  onSuccess: () => void;
}

export default function CreateInvoice({ onSuccess }: CreateInvoiceProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState<Currency>('USD');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, price: 0, total: 0 },
  ]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
  });

  useEffect(() => {
    loadClients();
    loadInvoiceNumber();
    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30);
    setDueDate(defaultDueDate.toISOString().split('T')[0]);
  }, []);

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('name');
    if (data) setClients(data);
  }

  async function loadInvoiceNumber() {
    const number = await generateInvoiceNumber();
    setInvoiceNumber(number);
  }

  function updateLineItem(index: number, field: keyof LineItem, value: string | number) {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    if (field === 'quantity' || field === 'price') {
      updatedItems[index].total = calculateLineTotal(
        Number(updatedItems[index].quantity),
        Number(updatedItems[index].price)
      );
    }

    setLineItems(updatedItems);
  }

  function addLineItem() {
    setLineItems([...lineItems, { description: '', quantity: 1, price: 0, total: 0 }]);
  }

  function removeLineItem(index: number) {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  }

  const subtotal = calculateSubtotal(lineItems);
  const tax = calculateTax(subtotal, taxRate / 100);
  const total = calculateTotal(subtotal, tax);

  async function handleCreateClient() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clients')
        .insert([{ ...newClient, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      setClients([...clients, data]);
      setSelectedClientId(data.id);
      setShowClientModal(false);
      setNewClient({ name: '', email: '', address: '', phone: '' });
    } catch (error) {
      console.error('Error creating client:', error);
      alert('Failed to create client');
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }

    if (lineItems.some((item) => !item.description)) {
      alert('Please fill in all line item descriptions');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('You must be logged in to create invoices');
        setLoading(false);
        return;
      }

      let invoice;
      let invoiceError;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        const freshInvoiceNumber = await generateInvoiceNumber();
        console.log(`Attempt ${attempt + 1}: Generating invoice number ${freshInvoiceNumber}`);

        const result = await supabase
          .from('invoices')
          .insert([
            {
              user_id: user.id,
              invoice_number: freshInvoiceNumber,
              client_id: selectedClientId,
              invoice_date: invoiceDate,
              due_date: dueDate,
              currency,
              subtotal,
              tax,
              total,
              status: 'Pending',
              notes,
            },
          ])
          .select()
          .single();

        invoice = result.data;
        invoiceError = result.error;

        if (!invoiceError) {
          console.log('Invoice created successfully');
          break;
        }

        if (!invoiceError.message.includes('duplicate key')) {
          break;
        }

        console.log(`Duplicate key error for ${freshInvoiceNumber}, retrying...`);

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
        }
      }

      if (invoiceError) throw invoiceError;

      const items = lineItems.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase.from('invoice_items').insert(items);

      if (itemsError) throw itemsError;

      await loadInvoiceNumber();

      alert('Invoice created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      const errorMessage = error?.message || 'Unknown error occurred';
      alert(`Failed to create invoice: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create Invoice</h1>
        <p className="text-gray-600 mt-1">Create a new invoice for your client</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Invoice Number" value={invoiceNumber} disabled />
          <div className="flex gap-2">
            <div className="flex-1">
              <Select
                label="Client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                options={[
                  { value: '', label: 'Select a client' },
                  ...clients.map((c) => ({ value: c.id, label: c.name })),
                ]}
                required
              />
            </div>
            <div className="pt-6">
              <Button type="button" onClick={() => setShowClientModal(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Input
            label="Invoice Date"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <Select
            label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            options={[
              { value: 'USD', label: 'USD - US Dollar ($)' },
              { value: 'EUR', label: 'EUR - Euro (€)' },
              { value: 'INR', label: 'INR - Indian Rupee (₹)' },
            ]}
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Line Items</h3>
            <Button type="button" onClick={addLineItem} variant="secondary">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-start">
                <div className="col-span-5">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={item.price}
                    onChange={(e) => updateLineItem(index, 'price', Number(e.target.value))}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Total" value={formatCurrency(item.total, currency)} disabled />
                </div>
                <div className="col-span-1 pt-2">
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="max-w-md ml-auto space-y-3">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span className="font-medium">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Tax:</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-20 text-right"
                  placeholder="0"
                />
                <span>%</span>
                <span className="font-medium w-24 text-right">{formatCurrency(tax, currency)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t">
              <span>Total:</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="Payment instructions or additional notes..."
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>

      <Modal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        title="Add New Client"
      >
        <div className="space-y-4">
          <Input
            label="Client Name"
            value={newClient.name}
            onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={newClient.email}
            onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
          />
          <Input
            label="Address"
            value={newClient.address}
            onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
          />
          <Input
            label="Phone"
            value={newClient.phone}
            onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
          />
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowClientModal(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateClient}>
              Add Client
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
