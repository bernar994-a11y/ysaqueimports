'use client';

import { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, Mail, Phone, MapPin, 
  Calendar, ShoppingBag, Wrench, MoreVertical, 
  ChevronRight, Star, History, MessageSquare, Plus, Edit, Trash2, XCircle
} from 'lucide-react';
import { formatCurrency, formatDateTime, formatPhone, formatCPF } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('compras');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers?search=${search}`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    const method = editingCustomer ? 'PUT' : 'POST';
    const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingCustomer(null);
      fetchCustomers();
    } else {
      const error = await res.json();
      alert(error.error || 'Erro ao salvar cliente');
    }
  };

  return (
    <div className="flex h-full gap-6 animate-in fade-in duration-500 overflow-hidden">
      {/* List Sidebar */}
      <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight">CRM Clientes</h1>
          <button 
            onClick={() => { setEditingCustomer(null); setShowModal(true); }}
            className="p-2 bg-indigo-500 rounded-lg text-white hover:bg-indigo-600 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CPF ou celular..." 
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-custom">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="h-24 glass-card animate-pulse" />
            ))
          ) : customers.length === 0 ? (
            <div className="h-32 flex flex-col items-center justify-center text-[var(--color-text-muted)] border border-dashed border-white/10 rounded-2xl">
              <Users className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Nenhum cliente encontrado.</p>
            </div>
          ) : (
            customers.map((c) => (
              <div 
                key={c.id} 
                onClick={() => setSelectedCustomer(c)}
                className={`glass-card p-4 glass-card-hover cursor-pointer border-l-4 transition-all ${selectedCustomer?.id === c.id ? 'border-indigo-500 bg-indigo-500/5' : 'border-transparent'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-600/20 flex items-center justify-center text-indigo-400 font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white truncate max-w-[160px]">{c.name}</h4>
                      <p className="text-[11px] text-[var(--color-text-muted)]">{formatPhone(c.phone || '')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-bold text-amber-400">{c.score}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-2 border-t border-white/5">
                  <span>{c.totalOrders} Pedidos</span>
                  <span className="text-white font-medium">{formatCurrency(c.totalSpent)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Profile Detail View */}
      <div className="hidden lg:flex flex-1 glass-card flex-col overflow-hidden">
        {selectedCustomer ? (
          <>
            {/* Detail Header */}
            <div className="p-8 border-b border-[var(--color-border-primary)] bg-gradient-to-b from-[var(--color-bg-hover)] to-transparent">
              <div className="flex items-start justify-between">
                <div className="flex gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-indigo-500/20">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-white tracking-tight">{selectedCustomer.name}</h2>
                      <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
                        Cliente Gold
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
                      <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {selectedCustomer.email || 'N/D'}</span>
                      <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {formatPhone(selectedCustomer.phone || '')}</span>
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {selectedCustomer.city || 'N/D'}, {selectedCustomer.state || ''}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (selectedCustomer.score/20) ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)] font-medium">Score de Fidelidade: {selectedCustomer.score}/100</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingCustomer(selectedCustomer); setShowModal(true); }}
                    className="btn-secondary btn-sm"
                  >
                    <Edit className="w-4 h-4" /> Editar
                  </button>
                  <button 
                    onClick={() => {
                      if (!selectedCustomer.phone) return alert('Cliente não possui telefone cadastrado.');
                      window.open(`https://wa.me/55${selectedCustomer.phone.replace(/\D/g, '')}`, '_blank');
                    }}
                    className="btn-secondary btn-sm text-indigo-400"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-6 mt-8">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Total Comprado</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(selectedCustomer.totalSpent)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Pedidos Total</p>
                  <p className="text-lg font-bold text-white">{selectedCustomer.totalOrders} Pedidos</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Ticket Médio</p>
                  <p className="text-lg font-bold text-white">{formatCurrency(selectedCustomer.totalSpent / (selectedCustomer.totalOrders || 1))}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text-muted)] mb-1">Última Compra</p>
                  <p className="text-lg font-bold text-white">{selectedCustomer.lastPurchase ? new Date(selectedCustomer.lastPurchase).toLocaleDateString() : 'N/D'}</p>
                </div>
              </div>
            </div>

            {/* Tabs & Timeline */}
            <div className="flex-1 overflow-hidden flex flex-col p-8 pt-6">
              <div className="flex items-center gap-8 mb-6 border-b border-[var(--color-border-primary)]">
                <button 
                  onClick={() => setActiveTab('compras')}
                  className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'compras' ? 'text-white border-b-2 border-indigo-500' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                >
                  Histórico de Compras
                </button>
                <button 
                  onClick={() => setActiveTab('servicos')}
                  className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'servicos' ? 'text-white border-b-2 border-indigo-500' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                >
                  Serviços Técnicos
                </button>
                <button 
                  onClick={() => setActiveTab('notas')}
                  className={`pb-4 text-sm font-bold transition-colors ${activeTab === 'notas' ? 'text-white border-b-2 border-indigo-500' : 'text-[var(--color-text-muted)] hover:text-white'}`}
                >
                  Notas & Anotações
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {activeTab === 'compras' && (
                  selectedCustomer.sales?.length > 0 ? selectedCustomer.sales.map((sale: any) => (
                    <div key={sale.id} className="p-4 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Venda #{String(sale.number).padStart(5, '0')}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">
                            {sale.items.map((i: any) => i.product.name).join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div>
                          <p className="text-sm font-bold text-white">{formatCurrency(sale.total)}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">{formatDateTime(sale.createdAt)}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-indigo-400 transition-colors" />
                      </div>
                    </div>
                  )) : <p className="text-sm text-[var(--color-text-muted)]">Nenhuma compra registrada.</p>
                )}

                {activeTab === 'servicos' && (
                  selectedCustomer.serviceOrders?.length > 0 ? selectedCustomer.serviceOrders.map((os: any) => (
                    <div key={os.id} className="p-4 rounded-2xl border border-[var(--color-border-primary)] bg-emerald-500/5 flex items-center justify-between border-emerald-500/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">OS #{String(os.number).padStart(5, '0')} - {os.deviceModel}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">{os.issueDescription}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white uppercase tracking-wider">{os.status}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)]">{formatDateTime(os.createdAt)}</p>
                      </div>
                    </div>
                  )) : <p className="text-sm text-[var(--color-text-muted)]">Nenhuma Ordem de Serviço registrada.</p>
                )}

                {activeTab === 'notas' && (
                  <div className="p-4 rounded-2xl border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
                    <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
                      {selectedCustomer.notes || 'Nenhuma anotação para este cliente.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-6">
            <Users className="w-24 h-24" />
            <div className="text-center">
              <h3 className="text-xl font-bold">Selecione um cliente</h3>
              <p className="text-sm">Clique em um cliente da lista para ver o perfil completo.</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal CRUD */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-lg">
            <div className="p-6 border-b border-[var(--color-border-primary)] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">{editingCustomer ? 'Editar Cliente' : 'Novo Cliente CRM'}</h3>
              <button onClick={() => setShowModal(false)} className="text-[var(--color-text-muted)] hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="label">Nome Completo</label>
                  <input name="name" type="text" className="input-field" defaultValue={editingCustomer?.name} required />
                </div>

                <div>
                  <label className="label">CPF</label>
                  <input name="cpf" type="text" className="input-field" placeholder="000.000.000-00" defaultValue={editingCustomer?.cpf} />
                </div>

                <div>
                  <label className="label">Celular / WhatsApp</label>
                  <input name="phone" type="text" className="input-field" placeholder="(11) 99999-9999" defaultValue={editingCustomer?.phone} />
                </div>

                <div>
                  <label className="label">E-mail</label>
                  <input name="email" type="email" className="input-field" placeholder="cliente@email.com" defaultValue={editingCustomer?.email} />
                </div>

                <div>
                  <label className="label">Cidade</label>
                  <input name="city" type="text" className="input-field" defaultValue={editingCustomer?.city} />
                </div>

                <div className="md:col-span-2">
                  <label className="label">Anotações Internas</label>
                  <textarea name="notes" className="input-field h-24" defaultValue={editingCustomer?.notes}></textarea>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary px-8">Salvar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
