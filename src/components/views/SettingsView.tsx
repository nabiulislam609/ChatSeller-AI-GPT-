import React, { useState, useEffect } from 'react';
import { Settings, Save, Truck, DollarSign, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { ShippingSettings } from '../../types/index.ts';

export const SettingsView: React.FC = () => {
  const { showToast } = useApp();
  const [settings, setSettings] = useState<ShippingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getShippingSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await api.saveShippingSettings(settings);
      showToast('Delivery zones and payment settings saved!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !settings) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading store settings...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">Bangladesh Delivery & Payment Rules</h2>
          <p className="text-xs text-slate-500">
            Set delivery charges for inside/outside Dhaka, advance COD requirements, and bKash / Nagad verification merchant numbers.
          </p>
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center space-x-1.5 px-4 py-2 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Grid: Delivery Zones & Advance Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Delivery Zones */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-blue-900" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              Delivery Zone Fees (BDT ৳)
            </h3>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Inside Dhaka Metro Area (৳)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                required
                value={settings.insideDhakaFee}
                onChange={(e) => setSettings({ ...settings, insideDhakaFee: Number(e.target.value) })}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
              <input
                type="text"
                value={settings.insideDhakaDeliveryDays}
                onChange={(e) => setSettings({ ...settings, insideDhakaDeliveryDays: e.target.value })}
                placeholder="24-48 Hours"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Dhaka Suburbs (Savar, Gazipur, Keraniganj) (৳)</label>
            <input
              type="number"
              required
              value={settings.dhakaSuburbsFee}
              onChange={(e) => setSettings({ ...settings, dhakaSuburbsFee: Number(e.target.value) })}
              className="w-32 px-3 py-2 border border-slate-300 rounded-lg font-bold"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Outside Dhaka (Pathao / Steadfast) (৳)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                required
                value={settings.outsideDhakaFee}
                onChange={(e) => setSettings({ ...settings, outsideDhakaFee: Number(e.target.value) })}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg font-bold"
              />
              <input
                type="text"
                value={settings.outsideDhakaDeliveryDays}
                onChange={(e) => setSettings({ ...settings, outsideDhakaDeliveryDays: e.target.value })}
                placeholder="2-4 Days"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Free Shipping Threshold (৳)</label>
            <input
              type="number"
              required
              value={settings.freeShippingThreshold}
              onChange={(e) => setSettings({ ...settings, freeShippingThreshold: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-emerald-700"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Orders equal to or exceeding this subtotal qualify for free delivery automatically.
            </p>
          </div>
        </div>

        {/* Payment & Security Rules */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-blue-900" />
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
              bKash / Nagad & COD Safety
            </h3>
          </div>

          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200 flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="advance-check"
              checked={settings.requireAdvanceForCodOutsideDhaka}
              onChange={(e) =>
                setSettings({ ...settings, requireAdvanceForCodOutsideDhaka: e.target.checked })
              }
              className="w-4 h-4 text-blue-900 rounded focus:ring-blue-600 border-slate-300 mt-0.5"
            />
            <label htmlFor="advance-check" className="text-amber-950 font-semibold cursor-pointer">
              Require Delivery Fee in Advance for Outside Dhaka COD
              <span className="block text-[11px] text-amber-900 font-normal mt-0.5">
                AI will collect ৳{settings.advanceAmount} advance delivery fee via bKash/Nagad before confirming parcel dispatch to prevent courier return losses.
              </span>
            </label>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">bKash Merchant Account Number</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={settings.bkashMerchantNumber}
                onChange={(e) => setSettings({ ...settings, bkashMerchantNumber: e.target.value })}
                placeholder="017xxxxxxxx"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-2 rounded-lg font-medium">
                {settings.bkashType}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Nagad Merchant Account Number</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={settings.nagadMerchantNumber}
                onChange={(e) => setSettings({ ...settings, nagadMerchantNumber: e.target.value })}
                placeholder="018xxxxxxxx"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-2 rounded-lg font-medium">
                {settings.nagadType}
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Bank Account Transfer Details</label>
            <input
              type="text"
              value={settings.bankDetails}
              onChange={(e) => setSettings({ ...settings, bankDetails: e.target.value })}
              placeholder="e.g. City Bank Ltd, A/C: 1102938475001"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
