import React, { useEffect, useState } from 'react';
import { Building2, Upload, Save } from 'lucide-react';
import { supabase, CompanySettings } from '../lib/supabase';
import Button from '../components/Button';
import Input from '../components/Input';

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState(false);

  const [formData, setFormData] = useState({
    company_name: '',
    company_address: '',
    company_email: '',
    company_phone: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setFormData({
          company_name: data.company_name,
          company_address: data.company_address,
          company_email: data.company_email,
          company_phone: data.company_phone,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('company_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      alert('Company settings updated successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('company_settings')
        .update({
          logo_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      alert('Logo uploaded successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo. Please make sure the storage bucket is configured.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSignatureUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1 * 1024 * 1024) {
      alert('Signature file size must be less than 1MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingSignature(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-signature-${Date.now()}.${fileExt}`;
      const filePath = `signatures/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('company-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('company-assets')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('company_settings')
        .update({
          signature_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      alert('Signature uploaded successfully!');
      loadSettings();
    } catch (error) {
      console.error('Error uploading signature:', error);
      alert('Failed to upload signature. Please make sure the storage bucket is configured.');
    } finally {
      setUploadingSignature(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Company Settings</h1>
        <p className="text-gray-600 mt-1">Manage your business information and branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Business Information
              </h2>
              <div className="space-y-4">
                <Input
                  label="Company Name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                />

                <Input
                  label="Address"
                  value={formData.company_address}
                  onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  value={formData.company_email}
                  onChange={(e) => setFormData({ ...formData, company_email: e.target.value })}
                  required
                />

                <Input
                  label="Phone"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Company Logo
            </h2>

            {settings?.logo_url && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={settings.logo_url}
                  alt="Company Logo"
                  className="max-h-32 mx-auto object-contain"
                />
              </div>
            )}

            <div>
              <label className="block">
                <span className="sr-only">Choose logo file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-slate-50 file:text-slate-700
                    hover:file:bg-slate-100
                    disabled:opacity-50"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG up to 2MB. Recommended: 500x200px
              </p>
              {uploading && (
                <p className="mt-2 text-sm text-slate-600">Uploading...</p>
              )}
            </div>

            <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
              <p className="text-xs text-teal-800">
                <strong>Note:</strong> Your logo will appear on all generated invoice PDFs.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Signature
            </h2>

            {settings?.signature_url && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={settings.signature_url}
                  alt="Signature"
                  className="max-h-24 mx-auto object-contain"
                />
              </div>
            )}

            <div>
              <label className="block">
                <span className="sr-only">Choose signature file</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  disabled={uploadingSignature}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-orange-50 file:text-orange-700
                    hover:file:bg-orange-100
                    disabled:opacity-50"
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">
                PNG, JPG up to 1MB. Recommended: transparent background
              </p>
              {uploadingSignature && (
                <p className="mt-2 text-sm text-orange-600">Uploading...</p>
              )}
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-xs text-orange-800">
                <strong>Note:</strong> Your signature will appear at the bottom of invoice PDFs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
