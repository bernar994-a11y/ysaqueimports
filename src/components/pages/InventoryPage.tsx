'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Smartphone, Box, AlertTriangle, 
  MoreHorizontal, Edit, Trash2, History, ChevronRight,
  Maximize2, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ category: 'all', status: 'all' });
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isNewProduct, setIsNewProduct] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory?search=${search}&status=${filter.status}`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {}
  };

  useEffect(() => {
    fetchItems();
    fetchProducts();
  }, [search, filter]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      let productId = data.productId;
      if (isNewProduct && !selectedItem) {
        const prodRes = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.newProductName,
            category: data.newProductCategory,
            brand: data.newProductBrand || 'Apple',
            sku: data.newProductSku,
            costPrice: Number(data.costPrice),
            salePrice: Number(data.newProductSalePrice),
            warranty: 90
          })
        });
        if (!prodRes.ok) throw new Error('Erro ao criar produto');
        const newProd = await prodRes.json();
        productId = newProd.id;
        data.productId = newProd.id;
        fetchProducts(); // atualiza a lista de produtos
      }

      const method = selectedItem ? 'PUT' : 'POST';
      const url = selectedItem ? `/api/inventory/${selectedItem.id}` : '/api/inventory';

      const inventoryData = {
        productId: productId,
        imei: data.imei,
        condition: data.condition,
        status: data.status,
        location: data.location,
        costPrice: Number(data.costPrice),
        purchaseDate: data.purchaseDate
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryData),
      });

      if (res.ok) {
        setShowModal(false);
        setSelectedItem(null);
        setIsNewProduct(false);
        fetchItems();
      } else {
        const error = await res.json();
        alert(error.error || 'Erro ao salvar item no estoque');
      }
    } catch (err: any) {
      alert(err.message || 'Erro inesperado');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Gestão de Estoque</h1>
          <p className="text-[var(--color-text-secondary)]">Controle total de iPhones e acessórios por IMEI.</p>
        </div>
        <button 
          onClick={() => { setSelectedItem(null); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" /> Novo Item
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="Buscar por IMEI, modelo ou serial..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <select 
            className="select-field w-auto min-w-[140px]"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="all">Todos Status</option>
            <option value="disponivel">Disponível</option>
            <option value="vitrine">Vitrine</option>
            <option value="reservado">Reservado</option>
            <option value="vendido">Vendido</option>
            <option value="assistencia">Assistência</option>
          </select>
          <button className="btn-secondary btn-sm">
            <Filter className="w-4 h-4" /> Filtros Avançados
          </button>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="glass-card overflow-hidden">
        <div className="table-container border-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Produto / IMEI</th>
                <th>Local / Condição</th>
                <th>Custo</th>
                <th>Status</th>
                <th>Data Entrada</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="h-16 bg-white/5 border-b border-white/5"></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="h-32 text-center text-[var(--color-text-muted)]">
                    Nenhum item encontrado.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.product.category === 'iphone' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-zinc-500/10 text-zinc-400'}`}>
                          {item.product.category === 'iphone' ? <Smartphone className="w-5 h-5" /> : <Box className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{item.product.name}</p>
                          <p className="text-xs text-[var(--color-text-muted)] font-mono">{item.imei || 'S/ IMEI'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-sm text-white capitalize">{item.location}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">{item.condition}</p>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-white">{formatCurrency(item.costPrice)}</p>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusColor(item.status)}`}>
                        {getStatusLabel(item.status)}
                      </span>
                    </td>
                    <td>
                      <p className="text-sm text-[var(--color-text-secondary)]">{formatDate(item.createdAt)}</p>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setSelectedItem(item); setShowModal(true); }}
                          className="p-2 text-[var(--color-text-muted)] hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="p-6 border-b border-[var(--color-border-primary)] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{selectedItem ? 'Editar Item' : 'Novo Item em Estoque'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              {!selectedItem && (
                <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                  <button type="button" onClick={() => setIsNewProduct(false)} className={`text-sm font-bold pb-2 border-b-2 transition-all ${!isNewProduct ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-[var(--color-text-muted)]'}`}>
                    Produto Existente
                  </button>
                  <button type="button" onClick={() => setIsNewProduct(true)} className={`text-sm font-bold pb-2 border-b-2 transition-all ${isNewProduct ? 'border-indigo-400 text-indigo-400' : 'border-transparent text-[var(--color-text-muted)]'}`}>
                    Criar Novo Produto
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(!isNewProduct || selectedItem) ? (
                  <div className="md:col-span-2">
                    <label className="label">Produto</label>
                    <select name="productId" className="select-field" defaultValue={selectedItem?.productId} required={!isNewProduct}>
                      <option value="">Selecione um produto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} {p.model ? `- ${p.model}` : ''}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <label className="label">Nome do Produto</label>
                      <input name="newProductName" type="text" className="input-field" placeholder="Ex: iPhone 13 Pro Max 256GB" required />
                    </div>
                    <div>
                      <label className="label">Categoria</label>
                      <select name="newProductCategory" className="select-field" required>
                        <option value="iphone">iPhone</option>
                        <option value="acessorio">Acessório</option>
                        <option value="peca">Peça</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Código SKU</label>
                      <input name="newProductSku" type="text" className="input-field" placeholder="Ex: IP13PM256" />
                    </div>
                    <div>
                      <label className="label">Marca</label>
                      <input name="newProductBrand" type="text" className="input-field" defaultValue="Apple" required />
                    </div>
                    <div>
                      <label className="label">Preço de Venda (R$)</label>
                      <input name="newProductSalePrice" type="number" step="0.01" className="input-field" required />
                    </div>
                  </>
                )}

                <div>
                  <label className="label">IMEI / Serial</label>
                  <input 
                    name="imei" 
                    type="text" 
                    className="input-field font-mono" 
                    placeholder="35..." 
                    defaultValue={selectedItem?.imei}
                  />
                </div>

                <div>
                  <label className="label">Condição</label>
                  <select name="condition" className="select-field" defaultValue={selectedItem?.condition || 'novo'}>
                    <option value="novo">Novo</option>
                    <option value="seminovo">Seminovo</option>
                    <option value="usado">Usado</option>
                    <option value="recondicionado">Recondicionado</option>
                  </select>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select name="status" className="select-field" defaultValue={selectedItem?.status || 'disponivel'}>
                    <option value="disponivel">Disponível</option>
                    <option value="vitrine">Vitrine</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                    <option value="defeito">Defeito</option>
                    <option value="assistencia">Assistência</option>
                  </select>
                </div>

                <div>
                  <label className="label">Localização</label>
                  <select name="location" className="select-field" defaultValue={selectedItem?.location || 'estoque'}>
                    <option value="estoque">Estoque Central</option>
                    <option value="vitrine">Vitrine Loja</option>
                    <option value="deposito">Depósito Externo</option>
                  </select>
                </div>

                <div>
                  <label className="label">Preço de Custo (R$)</label>
                  <input 
                    name="costPrice" 
                    type="number" 
                    step="0.01" 
                    className="input-field" 
                    defaultValue={selectedItem?.costPrice}
                    required
                  />
                </div>

                <div>
                  <label className="label">Data de Entrada</label>
                  <input 
                    name="purchaseDate" 
                    type="date" 
                    className="input-field" 
                    defaultValue={selectedItem?.purchaseDate?.split('T')[0] || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary px-8">Salvar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
