import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, MapPin, ShoppingBag, Tag, Calendar, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Customer } from '../../types/index.ts';

export const CustomersView: React.FC = () => {
  const { refreshKey } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const list = await api.getCustomers();
        setCustomers(list);
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCustomers();
  }, [refreshKey]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.address && c.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Customer Directory & CRM</h2>
          <p className="text-xs text-slate-500">
            Profiles automatically generated and synchronized from Facebook Messenger conversations and confirmed orders.
          </p>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total Customers: <span className="font-bold text-slate-900">{customers.length}</span>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search customer name, mobile number, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{c.name}</h3>
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-700">৳{c.totalSpent.toLocaleString()}</span>
                  <div className="text-[10px] text-slate-400">{c.totalOrders} order(s)</div>
                </div>
              </div>

              {c.address && (
                <div className="flex items-start space-x-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-relaxed">{c.address}</span>
                </div>
              )}

              {c.notes && (
                <div className="text-[11px] text-slate-500 italic">
                  Note: "{c.notes}"
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {c.tags.map((tg, i) => (
                  <span
                    key={i}
                    className="text-[10px] bg-blue-50 text-blue-900 font-semibold px-2 py-0.5 rounded"
                  >
                    {tg}
                  </span>
                ))}
              </div>
              <span className="text-[10px] text-slate-400">
                Active: {new Date(c.lastActiveAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400">
            No customers found matching the search.
          </div>
        )}
      </div>
    </div>
  );
};
