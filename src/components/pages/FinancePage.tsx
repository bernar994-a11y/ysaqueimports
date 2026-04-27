'use client';

import { useState, useEffect } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, ArrowUpCircle, 
  ArrowDownCircle, Plus, Search, Filter, Calendar, 
  MoreHorizontal, Download, FileText, CheckCircle2, Clock, XCircle
} from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel, formatDate } from '@/lib/utils';

export default function FinancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);

  const downloadCSV = () => {
    if (!data?.transactions) return;
    const headers = ['Descrição', 'Categoria', 'Tipo', 'Valor', 'Vencimento', 'Status'];
    const csvContent = [
      headers.join(','),
      ...data.transactions.map((t: any) => [
        `"${t.description}"`,
        `"${t.category}"`,
        `"${t.type}"`,
        t.amount,
        `"${formatDate(t.dueDate)}"`,
        `"${t.status}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `financeiro_${period}dias.csv`;
    link.click();
  };

  const fetchFinance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, [period]);

  const openEditModal = (t: any) => {
    setEditingTransaction(t);
    setShowModal(true);
    setActionMenuId(null);
  };

  const handleSave = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const formValues = Object.fromEntries(formData.entries());
    
    const url = editingTransaction ? `/api/finance/${editingTransaction.id}` : '/api/finance';
    const method = editingTransaction ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formValues),
    });

    if (res.ok) {
      setShowModal(false);
      setEditingTransaction(null);
      fetchFinance();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    const res = await fetch(`/api/finance/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setActionMenuId(null);
      fetchFinance();
    }
  };

  const handleToggleStatus = async (t: any) => {
    const newStatus = t.status === 'pendente' ? 'pago' : 'pendente';
    const res = await fetch(`/api/finance/${t.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setActionMenuId(null);
      fetchFinance();
    }
  };

  if (!data && loading) return <div className="animate-pulse h-96 glass-card" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financeiro Inteligente</h1>
          <p className="text-[var(--color-text-secondary)]">Fluxo de caixa, DRE e conciliação bancária.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="select-field w-auto py-1.5 px-3 h-10"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
          <button onClick={() => { setEditingTransaction(null); setShowModal(true); }} className="btn-primary h-10">
            <Plus className="w-4 h-4" /> Nova Transação
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 bg-emerald-500/5 border-emerald-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Entradas</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">Receita Bruta</p>
          <h3 className="text-2xl font-black text-white mt-1">{formatCurrency(data?.summary.totalIncome || 0)}</h3>
        </div>

        <div className="glass-card p-6 bg-red-500/5 border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
              <ArrowDownCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">Saídas</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">Despesas & Custos</p>
          <h3 className="text-2xl font-black text-white mt-1">{formatCurrency(data?.summary.totalExpenses || 0)}</h3>
        </div>

        <div className="glass-card p-6 bg-indigo-500/5 border-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Saldo</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">Lucro do Período</p>
          <h3 className="text-2xl font-black text-white mt-1">{formatCurrency(data?.summary.balance || 0)}</h3>
        </div>

        <div className="glass-card p-6 bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pendentes</span>
          </div>
          <p className="text-sm text-[var(--color-text-muted)] font-medium">Contas a Pagar</p>
          <h3 className="text-2xl font-black text-white mt-1">{formatCurrency(data?.summary.pendingPayables || 0)}</h3>
        </div>
      </div>

      {/* Transactions List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-primary)] flex items-center justify-between">
          <h3 className="font-semibold text-white">Lançamentos Financeiros</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary btn-sm ${showFilters ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50' : ''}`}
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
            <button onClick={downloadCSV} className="btn-secondary btn-sm"><Download className="w-3.5 h-3.5" /> Exportar</button>
          </div>
        </div>
        {showFilters && (
          <div className="p-4 bg-white/5 border-b border-[var(--color-border-primary)] flex gap-4">
            <select 
              className="select-field text-sm w-48"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos os Tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
          </div>
        )}
        <div className="table-container border-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Descrição / Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data?.transactions.filter((t: any) => filterType === 'all' || t.type === filterType).map((t: any) => (
                <tr key={t.id}>
                  <td>
                    <p className="text-sm font-bold text-white">{t.description}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-widest">{t.category}</p>
                  </td>
                  <td>
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${t.type === 'receita' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'receita' ? <ArrowUpCircle className="w-3 h-3" /> : <ArrowDownCircle className="w-3 h-3" />}
                      {t.type.toUpperCase()}
                    </span>
                  </td>
                  <td><p className={`text-sm font-black ${t.type === 'receita' ? 'text-white' : 'text-white'}`}>{formatCurrency(t.amount)}</p></td>
                  <td><p className="text-sm text-[var(--color-text-secondary)]">{formatDate(t.dueDate)}</p></td>
                  <td>
                    <span className={`status-badge ${getStatusColor(t.status)}`}>
                      {getStatusLabel(t.status)}
                    </span>
                  </td>
                  <td className="text-right relative">
                    <button 
                      onClick={() => setActionMenuId(actionMenuId === t.id ? null : t.id)}
                      className="p-2 text-[var(--color-text-muted)] hover:text-white rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {actionMenuId === t.id && (
                      <div className="absolute right-12 top-2 w-48 glass-card p-1 z-50 text-left shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <button 
                          onClick={() => handleToggleStatus(t)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-md flex items-center gap-2 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Marcar como {t.status === 'pendente' ? 'Pago' : 'Pendente'}
                        </button>
                        <button 
                          onClick={() => openEditModal(t)}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/5 rounded-md flex items-center gap-2 transition-colors"
                        >
                          <FileText className="w-4 h-4" /> Editar
                        </button>
                        <div className="h-px bg-white/10 my-1" />
                        <button 
                          onClick={() => handleDelete(t.id)}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-md flex items-center gap-2 transition-colors"
                        >
                          <XCircle className="w-4 h-4" /> Excluir
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Transação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="p-6 border-b border-[var(--color-border-primary)] flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <button onClick={() => { setShowModal(false); setEditingTransaction(null); }} className="text-[var(--color-text-muted)] hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="label">Descrição</label>
                  <input name="description" type="text" className="input-field" placeholder="Ex: Aluguel Mensal" required defaultValue={editingTransaction?.description || ''} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Tipo</label>
                    <select name="type" className="select-field" defaultValue={editingTransaction?.type || 'despesa'}>
                      <option value="despesa">Saída (Despesa)</option>
                      <option value="receita">Entrada (Receita)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Categoria</label>
                    <select name="category" className="select-field" defaultValue={editingTransaction?.category || 'venda'}>
                      <option value="venda">Venda</option>
                      <option value="servico">Serviço</option>
                      <option value="aluguel">Aluguel</option>
                      <option value="salario">Salário</option>
                      <option value="fornecedor">Fornecedor</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Valor (R$)</label>
                    <input name="amount" type="number" step="0.01" className="input-field" required defaultValue={editingTransaction?.amount || ''} />
                  </div>
                  <div>
                    <label className="label">Vencimento</label>
                    <input name="dueDate" type="date" className="input-field" defaultValue={editingTransaction?.dueDate ? new Date(editingTransaction.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} required />
                  </div>
                </div>

                <div>
                  <label className="label">Status</label>
                  <select name="status" className="select-field" defaultValue={editingTransaction?.status || 'pendente'}>
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago / Recebido</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={() => { setShowModal(false); setEditingTransaction(null); }} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary px-8">Salvar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
