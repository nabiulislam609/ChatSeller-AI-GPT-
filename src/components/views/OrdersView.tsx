import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Filter,
  Eye,
  Plus,
  CheckCircle2,
  Clock,
  Printer,
  ChevronDown,
  Edit,
  Truck,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Order, OrderStatus, PaymentStatus } from '../../types/index.ts';
import { OrderInvoiceModal } from '../modals/OrderInvoiceModal.tsx';

const ALL_ORDER_STATUSES: OrderStatus[] = [
  'Draft',
  'Awaiting Confirmation',
  'Confirmed',
  'Awaiting Payment',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
];

export const OrdersView: React.FC = () => {
  const { showToast, refreshKey, triggerRefresh } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Status update modal
  const [updatingOrder, setUpdatingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('Confirmed');
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>('Verified');
  const [statusNote, setStatusNote] = useState('');

  // Manual new order modal
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [newOrderAddress, setNewOrderAddress] = useState('');
  const [newOrderZone, setNewOrderZone] = useState<'Inside Dhaka' | 'Dhaka Suburbs' | 'Outside Dhaka'>('Inside Dhaka');
  const [newOrderAmount, setNewOrderAmount] = useState('2350');
  const [newOrderPayment, setNewOrderPayment] = useState<'Cash on Delivery' | 'bKash' | 'Nagad'>('Cash on Delivery');

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const list = await api.getOrders();
        setOrders(list);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrders();
  }, [refreshKey]);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const matchesPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleQuickVerifyPayment = async (ord: Order) => {
    const note = prompt(`Enter verification note for Order #${ord.orderNumber} (e.g. "bKash statement verified on counter"):`, 'bKash Merchant Ledger verified by staff');
    if (note === null) return;
    try {
      await api.updateOrderStatus(ord.id, ord.orderStatus, note, 'Verified');
      showToast(`Payment verified for #${ord.orderNumber}`, 'success');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to verify payment', 'error');
    }
  };

  const handleOpenStatusModal = (ord: Order) => {
    setUpdatingOrder(ord);
    setNewStatus(ord.orderStatus);
    setNewPaymentStatus(ord.paymentStatus);
    setStatusNote('');
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingOrder) return;

    try {
      await api.updateOrderStatus(updatingOrder.id, newStatus, statusNote, newPaymentStatus);
      showToast(`Updated #${updatingOrder.orderNumber} to ${newStatus}`, 'success');
      setUpdatingOrder(null);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const handleCreateManualOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrderCustomer.trim() || !newOrderPhone.trim()) return;

    const deliveryFee = newOrderZone === 'Inside Dhaka' ? 70 : newOrderZone === 'Dhaka Suburbs' ? 100 : 130;
    const subtotal = Number(newOrderAmount) || 2000;
    const total = subtotal + deliveryFee;

    try {
      const created = await api.createOrder({
        customerName: newOrderCustomer.trim(),
        customerPhone: newOrderPhone.trim(),
        deliveryAddress: newOrderAddress.trim() || 'Mirpur, Dhaka',
        deliveryCity: newOrderZone,
        items: [
          {
            id: `item-${Date.now()}`,
            productId: 'prod-01',
            productName: 'Royal Heritage Semi-Fitted Silk Panjabi',
            sku: 'AT-P-NV-M',
            variant: 'Navy Blue / M',
            quantity: 1,
            unitPrice: subtotal,
            totalPrice: subtotal,
          },
        ],
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        advancePaymentRequired: newOrderZone === 'Outside Dhaka',
        advanceAmount: newOrderZone === 'Outside Dhaka' ? 130 : 0,
        paymentMethod: newOrderPayment,
        paymentStatus: newOrderPayment === 'Cash on Delivery' ? 'Pending Verification' : 'Verified',
        orderStatus: 'Confirmed',
        statusHistory: [{ status: 'Confirmed', timestamp: new Date().toISOString(), note: 'Manual entry by staff' }],
      });

      showToast(`Created order #${created.orderNumber}`, 'success');
      setIsNewOrderModalOpen(false);
      setNewOrderCustomer('');
      setNewOrderPhone('');
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to create order', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Order Management System</h2>
          <p className="text-xs text-slate-500">
            Real-time orders generated via Messenger conversations & staff dispatch with inventory reservation.
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Manual Order</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by Order #, customer name, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
          />
        </div>

        {/* Status Dropdown Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500">Order:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white"
            >
              <option value="all">All Orders ({orders.length})</option>
              {ALL_ORDER_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st} ({orders.filter((o) => o.orderStatus === st).length})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="text-xs text-slate-500">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-white font-medium"
            >
              <option value="all">All Payments</option>
              <option value="Unverified Claim">Unverified Claims ({orders.filter((o) => o.paymentStatus === 'Unverified Claim').length})</option>
              <option value="Pending Verification">Pending Verification ({orders.filter((o) => o.paymentStatus === 'Pending Verification').length})</option>
              <option value="Verified">Verified ({orders.filter((o) => o.paymentStatus === 'Verified').length})</option>
              <option value="Paid">Paid ({orders.filter((o) => o.paymentStatus === 'Paid').length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Delivery Zone</th>
                <th className="py-3 px-4 text-right">Subtotal / Delivery</th>
                <th className="py-3 px-4 text-right">Total (BDT)</th>
                <th className="py-3 px-4">Payment Method & Status</th>
                <th className="py-3 px-4 text-center">Order Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ord.orderNumber}</td>
                  <td className="py-3.5 px-4 text-slate-500">
                    <div>{new Date(ord.createdAt).toLocaleDateString()}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{ord.customerName}</div>
                    <div className="font-mono text-slate-500 text-[11px]">{ord.customerPhone}</div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xs">{ord.deliveryAddress}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{ord.deliveryCity}</td>
                  <td className="py-3.5 px-4 text-right text-slate-600">
                    <div>৳{ord.subtotal.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-400">+ ৳{ord.deliveryFee}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-blue-950 text-sm">
                    ৳{ord.total.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{ord.paymentMethod}</div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded mt-0.5 ${
                        ord.paymentStatus === 'Verified' || ord.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.paymentStatus === 'Unverified Claim'
                          ? 'bg-amber-100 text-amber-800 font-bold'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ord.paymentStatus}
                    </span>
                    {ord.paymentTrxId && (
                      <div className="font-mono text-[10px] text-blue-900 font-bold mt-0.5">
                        Trx: {ord.paymentTrxId}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                        ord.orderStatus === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : ord.orderStatus === 'Awaiting Confirmation'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : ord.orderStatus === 'Processing'
                          ? 'bg-blue-50 text-blue-900 border border-blue-200'
                          : ord.orderStatus === 'Shipped'
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                          : ord.orderStatus === 'Delivered'
                          ? 'bg-teal-50 text-teal-900 border border-teal-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {ord.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1">
                      {ord.paymentStatus !== 'Verified' && ord.paymentStatus !== 'Paid' && (
                        <button
                          onClick={() => handleQuickVerifyPayment(ord)}
                          className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 flex items-center space-x-1"
                          title="Verify payment against bank/bKash ledger"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verify</span>
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedInvoiceOrder(ord)}
                        className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded"
                        title="Print / View Invoice"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded"
                        title="Update order status & verification"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <OrderInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Update Status Modal */}
      {updatingOrder && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Update Order #{updatingOrder.orderNumber}
            </h3>
            <p className="text-slate-500 mb-4">
              Customer: {updatingOrder.customerName} ({updatingOrder.customerPhone})
            </p>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium"
                >
                  {ALL_ORDER_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Verification Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white font-medium"
                >
                  <option value="Pending Verification">Pending Verification</option>
                  <option value="Unverified Claim">Unverified Claim (Customer TrxID)</option>
                  <option value="Verified">Verified (Bank/bKash Confirmed)</option>
                  <option value="Paid">Paid (Delivered & Settled)</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Note / Dispatch Tracking</label>
                <input
                  type="text"
                  placeholder="e.g. Courier Steadfast tracking: ST-99214"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingOrder(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Manual Order Modal */}
      {isNewOrderModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Create Manual Order</h3>
            <p className="text-slate-500 mb-4">
              Add phone-in or in-person orders into the unified dashboard.
            </p>

            <form onSubmit={handleCreateManualOrder} className="space-y-3.5">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Naimur Rahman"
                  value={newOrderCustomer}
                  onChange={(e) => setNewOrderCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">11-Digit Mobile Number</label>
                <input
                  type="tel"
                  required
                  placeholder="017xxxxxxxx"
                  value={newOrderPhone}
                  onChange={(e) => setNewOrderPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Delivery Address</label>
                <textarea
                  rows={2}
                  required
                  placeholder="House, Road, Area, City"
                  value={newOrderAddress}
                  onChange={(e) => setNewOrderAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Delivery Zone</label>
                  <select
                    value={newOrderZone}
                    onChange={(e) => setNewOrderZone(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Inside Dhaka">Inside Dhaka (৳70)</option>
                    <option value="Dhaka Suburbs">Dhaka Suburbs (৳100)</option>
                    <option value="Outside Dhaka">Outside Dhaka (৳130)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newOrderPayment}
                    onChange={(e) => setNewOrderPayment(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Subtotal (BDT ৳)</label>
                <input
                  type="number"
                  required
                  value={newOrderAmount}
                  onChange={(e) => setNewOrderAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none font-bold"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewOrderModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save & Confirm Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
