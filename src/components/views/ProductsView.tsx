import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Tag,
  DollarSign,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext.tsx';
import { api } from '../../services/api.ts';
import { Product } from '../../types/index.ts';
import { ProductCsvImportModal } from '../modals/ProductCsvImportModal.tsx';

export const ProductsView: React.FC = () => {
  const { currentWorkspace, showToast, refreshKey, triggerRefresh } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    nameBn: '',
    category: 'Panjabi',
    price: '',
    salePrice: '',
    stockQuantity: '',
    colors: 'Navy Blue, Jet Black',
    sizes: 'M, L, XL',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const list = await api.getProducts();
        setProducts(list);
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, [refreshKey]);

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.nameBn && p.nameBn.includes(searchQuery));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      sku: `AT-PROD-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      nameBn: '',
      category: 'Panjabi',
      price: '2200',
      salePrice: '1950',
      stockQuantity: '20',
      colors: 'Navy Blue, Maroon',
      sizes: 'M (40), L (42), XL (44)',
      description: 'Handcrafted premium festive apparel with fine stitching.',
      imageUrl: 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      sku: p.sku,
      name: p.name,
      nameBn: p.nameBn || '',
      category: p.category,
      price: String(p.price),
      salePrice: p.salePrice ? String(p.salePrice) : '',
      stockQuantity: String(p.stockQuantity),
      colors: p.colors.join(', '),
      sizes: p.sizes.join(', '),
      description: p.description,
      imageUrl: p.images[0] || '',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Partial<Product> = {
        sku: formData.sku.trim().toUpperCase(),
        name: formData.name.trim(),
        nameBn: formData.nameBn.trim() || undefined,
        category: formData.category.trim(),
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : undefined,
        stockQuantity: Number(formData.stockQuantity),
        colors: formData.colors.split(',').map((c) => c.trim()).filter(Boolean),
        sizes: formData.sizes.split(',').map((s) => s.trim()).filter(Boolean),
        description: formData.description,
        images: formData.imageUrl ? [formData.imageUrl] : [],
        shippingEligible: true,
        status: 'active',
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showToast(`Updated product: ${payload.name}`, 'success');
      } else {
        await api.createProduct(payload);
        showToast(`Created product: ${payload.name}`, 'success');
      }
      setIsCreateModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.deleteProduct(id);
        showToast(`Deleted ${name}`, 'info');
        triggerRefresh();
      } catch (err: any) {
        showToast(err.message || 'Failed to delete', 'error');
      }
    }
  };

  const handleExportCsv = () => {
    const csvRows = [
      ['SKU', 'Name', 'Category', 'Price', 'SalePrice', 'Stock', 'Colors', 'Sizes'].join(','),
      ...products.map((p) =>
        [
          `"${p.sku}"`,
          `"${p.name}"`,
          `"${p.category}"`,
          p.price,
          p.salePrice || '',
          p.stockQuantity,
          `"${p.colors.join(';')}"`,
          `"${p.sizes.join(';')}"`,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `products-${currentWorkspace?.slug || 'catalog'}.csv`;
    a.click();
    showToast('Catalog exported to CSV file', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Product Catalog & Inventory</h2>
          <p className="text-xs text-slate-500">
            Products here ground the AI agent's responses. The AI will strictly quote these prices, sizes, and stock.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setIsCsvModalOpen(true)}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-semibold text-blue-900 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, SKU, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 bg-slate-50"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat === 'all' ? 'All Products' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-blue-300 transition-colors"
          >
            {/* Image */}
            <div className="h-44 bg-slate-100 relative overflow-hidden group">
              <img
                src={product.images[0] || 'https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=600&q=80'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded">
                {product.sku}
              </span>
              {product.salePrice && (
                <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Sale
                </span>
              )}
            </div>

            {/* Details */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="text-[11px] text-blue-900 font-semibold mb-0.5">{product.category}</div>
                <h3 className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
                  {product.name}
                </h3>
                {product.nameBn && (
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">{product.nameBn}</div>
                )}
              </div>

              {/* Price & Stock */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    ৳{(product.salePrice || product.price).toLocaleString()}
                  </div>
                  {product.salePrice && (
                    <div className="text-[11px] text-slate-400 line-through">
                      ৳{product.price.toLocaleString()}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div
                    className={`text-[11px] font-bold ${
                      product.stockQuantity > 5 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {product.stockQuantity} in stock
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Sizes: {product.sizes.slice(0, 2).join(', ')}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-1 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenEdit(product)}
                  className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded"
                  title="Edit product"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteProduct(product.id, product.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                  title="Delete product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
            No products found matching your search.
          </div>
        )}
      </div>

      {/* Product Create / Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                  >
                    <option value="Panjabi">Panjabi</option>
                    <option value="Saree">Saree</option>
                    <option value="Kurti">Kurti</option>
                    <option value="Polo & Casuals">Polo & Casuals</option>
                    <option value="Footwear">Footwear</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Title (English)</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Heritage Semi-Fitted Silk Panjabi"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Title (বাংলা)</label>
                <input
                  type="text"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  placeholder="e.g. রয়েল হেরিটেজ সিল্ক পাঞ্জাবি"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Regular Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Sale Price (৳)</label>
                  <input
                    type="number"
                    value={formData.salePrice}
                    onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Available Colors</label>
                  <input
                    type="text"
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Navy Blue, Jet Black"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Available Sizes</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="M, L, XL"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  {editingProduct ? 'Save Updates' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <ProductCsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onSuccess={() => {
          setIsCsvModalOpen(false);
          triggerRefresh();
        }}
        existingProducts={products}
      />
    </div>
  );
};
