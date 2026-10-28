import React from 'react';
import { X, Printer, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import { Order } from '../../types/index.ts';

interface OrderInvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderInvoiceModal: React.FC<OrderInvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Controls */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="text-xs font-semibold text-slate-700">Order Invoice Summary</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium bg-blue-900 hover:bg-blue-800 text-white rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="text-xl font-bold text-blue-950">AURA TRENDS DHAKA</div>
              <div className="text-xs text-slate-500 mt-0.5">House 14, Road 7, Banani, Dhaka, Bangladesh</div>
              <div className="text-xs text-slate-500">Hotline: +880 1700-112233 · support@auratrends.com</div>
            </div>
            <div className="text-right">
              <div className="text-base font-bold text-slate-900">INVOICE #{order.orderNumber}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB')}
              </div>
              <div className="mt-1">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {order.orderStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div>
              <div className="font-semibold text-slate-900 mb-1">Deliver To (Customer):</div>
              <div className="font-medium text-slate-800">{order.customerName}</div>
              <div className="font-mono text-slate-600">{order.customerPhone}</div>
              <div className="text-slate-600 mt-1">{order.deliveryAddress}</div>
              <div className="font-medium text-blue-900 mt-1">Zone: {order.deliveryCity}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900 mb-1">Payment Information:</div>
              <div>
                Method: <span className="font-medium">{order.paymentMethod}</span>
              </div>
              <div>
                Status: <span className="font-medium text-emerald-700">{order.paymentStatus}</span>
              </div>
              {order.paymentTrxId && (
                <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                  bKash TrxID: {order.paymentTrxId}
                </div>
              )}
              {order.advancePaymentRequired && (
                <div className="text-amber-800 font-medium mt-1">
                  Advance Paid: ৳{order.advanceAmount}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-[11px] font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="py-2.5 px-4">Item & Variant</th>
                  <th className="py-2.5 px-4">SKU</th>
                  <th className="py-2.5 px-4 text-center">Qty</th>
                  <th className="py-2.5 px-4 text-right">Price</th>
                  <th className="py-2.5 px-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item) => (
                  <tr key={item.id} className="text-xs">
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>{item.productName}</div>
                      {item.variant && <div className="text-[11px] text-slate-500">{item.variant}</div>}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.sku}</td>
                    <td className="py-3 px-4 text-center font-medium">{item.quantity}</td>
                    <td className="py-3 px-4 text-right">৳{item.unitPrice.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-medium">৳{item.totalPrice.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Calculations Summary */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>৳{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charge ({order.deliveryCity}):</span>
                <span>৳{order.deliveryFee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span>-৳{order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 text-sm">
                <span>Total Amount:</span>
                <span className="text-blue-900">৳{order.total.toLocaleString()}</span>
              </div>
              {order.paymentMethod === 'Cash on Delivery' && (
                <div className="text-[11px] text-slate-500 text-right pt-0.5">
                  Payable on Delivery: ৳{(order.total - order.advanceAmount).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Footer Terms */}
          <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-400 flex items-center justify-between">
            <div>
              <span>Exchange allowed within 7 days with invoice slip and intact tags.</span>
            </div>
            <div className="font-mono">Generated via AI Sales Agent</div>
          </div>
        </div>
      </div>
    </div>
  );
};
