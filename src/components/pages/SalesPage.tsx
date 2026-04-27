'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingCart, Plus, Search, Filter, Smartphone, Box, 
  Trash2, CreditCard, QrCode, Banknote, Receipt, CheckCircle2,
  ChevronDown, UserPlus, Tag, Percent, ArrowRight, DollarSign, XCircle,
  MessageCircle, Mail
} from 'lucide-react';
import { formatCurrency, getStatusColor, getStatusLabel, formatDateTime } from '@/lib/utils';

export default function SalesPage() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPOS, setShowPOS] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [discount, setDiscount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [warranty, setWarranty] = useState('90');
  const [issueNfe, setIssueNfe] = useState(false);
  const [splitPayments, setSplitPayments] = useState<any[]>([{ method: 'dinheiro', amount: 0 }]);
  const [settings, setSettings] = useState<any>({});
  const [installments, setInstallments] = useState(1);
  const [printSale, setPrintSale] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [searchTableQuery, setSearchTableQuery] = useState('');

  useEffect(() => {
    if (printSale) {
      setTimeout(() => { window.print(); setPrintSale(null); }, 500);
    }
  }, [printSale]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales');
      const data = await res.json();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppData = async () => {
    try {
      const [prodRes, custRes, invRes, setRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/customers'),
        fetch('/api/inventory?status=disponivel'),
        fetch('/api/settings')
      ]);
      setProducts(await prodRes.json());
      setCustomers(await custRes.json());
      setInventory(await invRes.json());
      setSettings(await setRes.json());
    } catch (err) {}
  };

  useEffect(() => {
    fetchSales();
    fetchAppData();
  }, []);

  const addToCart = (product: any, inventoryItem: any = null) => {
    setCart([...cart, {
      productId: product.id,
      name: product.name,
      model: product.model,
      inventoryItemId: inventoryItem?.id,
      imei: inventoryItem?.imei,
      quantity: 1,
      unitPrice: product.salePrice,
      total: product.salePrice
    }]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const calculateSubtotal = () => cart.reduce((sum, item) => sum + item.total, 0);
  const calculateTotal = () => calculateSubtotal() - discount;

  const getFeeAmount = () => {
    const total = calculateTotal();
    const rate = (key: string) => parseFloat(settings[key] || '0') / 100;
    
    if (paymentMethod === 'credito') return total * rate('tax_credit_rate');
    if (paymentMethod === 'credito_parcelado') return total * rate('tax_credit_installment_rate');
    if (paymentMethod === 'debito') return total * rate('tax_debit_rate');
    if (paymentMethod === 'pix') return total * rate('tax_pix_rate');
    if (paymentMethod === 'misto') {
      return splitPayments.reduce((sum, sp) => {
        let r = 0;
        if (sp.method === 'credito') r = rate('tax_credit_rate');
        else if (sp.method === 'credito_parcelado') r = rate('tax_credit_installment_rate');
        else if (sp.method === 'debito') r = rate('tax_debit_rate');
        else if (sp.method === 'pix') r = rate('tax_pix_rate');
        return sum + ((sp.amount || 0) * r);
      }, 0);
    }
    return 0;
  };

  const finalizeSale = async (status = 'finalizada') => {
    if (cart.length === 0) return;

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          customerId: selectedCustomer?.id,
          paymentMethod,
          splitPayments: paymentMethod === 'misto' ? splitPayments : undefined,
          installments: paymentMethod === 'credito_parcelado' ? installments : 1,
          discount,
          status,
          notes: `[NFe: ${issueNfe ? 'Sim' : 'Não'}] [Garantia: ${warranty} dias]`
        }),
      });

      if (res.ok) {
        setShowPOS(false);
        setCart([]);
        setSelectedCustomer(null);
        setDiscount(0);
        fetchSales();
        alert('Venda realizada com sucesso!');
      } else {
        const err = await res.json();
        alert(err.error || 'Erro ao finalizar venda');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const shareViaWhatsApp = (sale: any) => {
    const text = `*ORÇAMENTO - YSAQUE IMPORTS*\n\n` +
      `*Nº:* #${String(sale.number).padStart(5, '0')}\n` +
      `*Cliente:* ${sale.customer?.name || 'Consumidor Final'}\n` +
      `*Data:* ${formatDateTime(sale.createdAt)}\n\n` +
      `*Itens:*\n${sale.items.map((i: any) => `- ${i.quantity}x ${i.product.name} (${formatCurrency(i.unitPrice)})`).join('\n')}\n\n` +
      `*Subtotal:* ${formatCurrency(sale.subtotal)}\n` +
      (sale.discount > 0 ? `*Desconto:* -${formatCurrency(sale.discount)}\n` : '') +
      `*TOTAL:* ${formatCurrency(sale.total)}\n\n` +
      `Obrigado pela preferência!`;
      
    const phone = sale.customer?.phone ? sale.customer.phone.replace(/\D/g, '') : '';
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaEmail = (sale: any) => {
    const subject = `Orçamento #${String(sale.number).padStart(5, '0')} - Ysaque Imports`;
    const body = `ORÇAMENTO - YSAQUE IMPORTS\n\n` +
      `Nº: #${String(sale.number).padStart(5, '0')}\n` +
      `Cliente: ${sale.customer?.name || 'Consumidor Final'}\n` +
      `Data: ${formatDateTime(sale.createdAt)}\n\n` +
      `Itens:\n${sale.items.map((i: any) => `- ${i.quantity}x ${i.product.name} (${formatCurrency(i.unitPrice)})`).join('\n')}\n\n` +
      `Subtotal: ${formatCurrency(sale.subtotal)}\n` +
      (sale.discount > 0 ? `Desconto: -${formatCurrency(sale.discount)}\n` : '') +
      `TOTAL: ${formatCurrency(sale.total)}\n\n` +
      `Obrigado pela preferência!`;

    const email = sale.customer?.email || '';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendas & PDV</h1>
          <p className="text-[var(--color-text-secondary)]">Gerencie transações e faturamento da sua loja.</p>
        </div>
        <button 
          onClick={() => setShowPOS(true)}
          className="btn-primary"
        >
          <ShoppingCart className="w-4 h-4" /> Novo PDV
        </button>
      </div>

      {/* Metrics Small Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Vendas Hoje</p>
            <h4 className="text-lg font-bold text-white">{sales.filter(s => s.status === 'finalizada' && new Date(s.createdAt).toDateString() === new Date().toDateString()).length} Transações</h4>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Faturamento Hoje</p>
            <h4 className="text-lg font-bold text-white">
              {formatCurrency(sales
                .filter(s => s.status === 'finalizada' && new Date(s.createdAt).toDateString() === new Date().toDateString())
                .reduce((sum, s) => sum + s.total, 0)
              )}
            </h4>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] uppercase font-bold tracking-wider">Lucro Estimado</p>
            <h4 className="text-lg font-bold text-white">
              {formatCurrency(sales
                .filter(s => s.status === 'finalizada' && new Date(s.createdAt).toDateString() === new Date().toDateString())
                .reduce((sum, s) => sum + s.profit, 0)
              )}
            </h4>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-[var(--color-border-primary)] flex items-center justify-between">
          <h3 className="font-semibold text-white">Histórico de Vendas</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              <input 
                type="text" 
                placeholder="Buscar venda..." 
                className="input-field py-1.5 pl-9 text-xs w-48" 
                value={searchTableQuery}
                onChange={(e) => setSearchTableQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary btn-sm ${showFilters ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50' : ''}`}
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {showFilters && (
          <div className="p-4 bg-white/5 border-b border-[var(--color-border-primary)] flex gap-4">
            <select 
              className="select-field text-sm w-48"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos os Status</option>
              <option value="finalizada">Finalizada</option>
              <option value="orcamento">Orçamento</option>
            </select>
          </div>
        )}
        <div className="table-container border-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nº Venda</th>
                <th>Cliente</th>
                <th>Itens</th>
                <th>Total</th>
                <th>Lucro</th>
                <th>Pagamento</th>
                <th>Data / Hora</th>
                <th className="text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8} className="h-12 bg-white/5 animate-pulse"></td></tr>)
              ) : sales.filter(s => {
                const matchStatus = filterStatus === 'all' || s.status === filterStatus;
                const matchSearch = !searchTableQuery || 
                  s.customer?.name?.toLowerCase().includes(searchTableQuery.toLowerCase()) || 
                  String(s.number).includes(searchTableQuery);
                return matchStatus && matchSearch;
              }).map((sale) => (
                <tr key={sale.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-indigo-400">#{String(sale.number).padStart(5, '0')}</span>
                      {sale.status === 'orcamento' && (
                        <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          Orçamento
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <p className="text-sm text-white font-medium">{sale.customer?.name || 'Cliente Final'}</p>
                    <p className="text-[11px] text-[var(--color-text-muted)]">{sale.seller.name}</p>
                  </td>
                  <td>
                    <p className="text-sm text-[var(--color-text-secondary)]">{sale.items.length} item(ns)</p>
                    <p className="text-[10px] text-[var(--color-text-muted)] truncate max-w-[140px]">
                      {sale.items.map((i: any) => i.product.name).join(', ')}
                    </p>
                  </td>
                  <td><p className="text-sm font-bold text-white">{formatCurrency(sale.total)}</p></td>
                  <td><p className="text-sm font-medium text-emerald-400">{formatCurrency(sale.profit)}</p></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {sale.paymentMethod === 'pix' && <QrCode className="w-3 h-3 text-cyan-400" />}
                      {sale.paymentMethod === 'credito' && <CreditCard className="w-3 h-3 text-purple-400" />}
                      {sale.paymentMethod === 'dinheiro' && <Banknote className="w-3 h-3 text-emerald-400" />}
                      <span className="text-xs uppercase">{sale.paymentMethod}</span>
                    </div>
                  </td>
                  <td><p className="text-xs text-[var(--color-text-muted)]">{formatDateTime(sale.createdAt)}</p></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {sale.status === 'orcamento' ? (
                        <>
                          <button 
                            onClick={() => shareViaWhatsApp(sale)}
                            className="p-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-lg transition-colors"
                            title="Enviar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => shareViaEmail(sale)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                            title="Enviar por Email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => alert(`NFe emitida com sucesso para a venda #${sale.number}`)}
                          className="btn-secondary btn-sm text-[10px]"
                        >
                          Emitir NFe
                        </button>
                      )}
                      <button 
                        onClick={() => setPrintSale(sale)}
                        className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 rounded-lg"
                        title="Imprimir Recibo"
                      >
                        <Receipt className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Modal (Full Screen Layout) */}
      {showPOS && (
        <div className="modal-overlay">
          <div className="modal-content modal-xl h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[var(--color-border-primary)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-bold text-white">PDV Inteligente</h3>
              </div>
              <button onClick={() => setShowPOS(false)} className="text-[var(--color-text-muted)] hover:text-white">
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Product Selection Area */}
              <div className="flex-1 flex flex-col p-4 border-r border-[var(--color-border-primary)] bg-[var(--color-bg-primary)]/50">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input 
                    type="text" 
                    placeholder="Buscar por nome, modelo ou IMEI..." 
                    className="input-field pl-10" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pr-2">
                  {/* Categorized items */}
                  {inventory.filter(i => 
                    i.status === 'disponivel' && 
                    (!searchQuery || 
                     i.product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     i.product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                     i.imei?.includes(searchQuery))
                  ).map((item) => (
                    <div 
                      key={item.id} 
                      onClick={() => addToCart(item.product, item)}
                      className="glass-card p-3 glass-card-hover cursor-pointer flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                          {item.condition}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white truncate">{item.product.name}</p>
                        <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{item.imei}</p>
                      </div>
                      <p className="text-sm font-black text-white mt-1">{formatCurrency(item.product.salePrice)}</p>
                    </div>
                  ))}

                  {/* Accessories */}
                  {products.filter(p => 
                    p.category !== 'iphone' &&
                    (!searchQuery || 
                     p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                     p.sku?.toLowerCase().includes(searchQuery.toLowerCase()))
                  ).map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => addToCart(p)}
                      className="glass-card p-3 glass-card-hover cursor-pointer flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="p-2 rounded-lg bg-zinc-500/10 text-zinc-400">
                          <Box className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--color-text-muted)]">{p.stockCount} un</span>
                      </div>
                      <p className="text-sm font-bold text-white truncate">{p.name}</p>
                      <p className="text-sm font-black text-white mt-1">{formatCurrency(p.salePrice)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart & Checkout Area */}
              <div className="w-full max-w-md flex flex-col">
                {/* Customer Selector */}
                <div className="p-4 border-b border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Cliente</span>
                    <button 
                      onClick={() => setShowNewCustomerModal(true)}
                      className="text-[10px] text-indigo-400 font-bold hover:underline"
                    >
                      + Cadastrar
                    </button>
                  </div>
                  <select 
                    className="select-field py-1.5 text-sm"
                    onChange={(e) => setSelectedCustomer(customers.find(c => c.id === e.target.value))}
                  >
                    <option value="">Consumidor Final</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">Carrinho</span>
                    <span className="text-xs text-[var(--color-text-muted)]">{cart.length} itens</span>
                  </div>
                  
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
                      <ShoppingCart className="w-12 h-12" />
                      <p className="text-sm text-center">Carrinho Vazio</p>
                    </div>
                  ) : (
                    cart.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-[var(--color-bg-secondary)] group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{item.imei || 'Acessório'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{formatCurrency(item.total)}</p>
                          <button 
                            onClick={() => removeFromCart(i)}
                            className="text-[10px] text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totals & Finalize */}
                <div className="p-6 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border-primary)] space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                      <span>Subtotal</span>
                      <span>{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[var(--color-text-secondary)] items-center">
                      <span>Desconto</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">-{formatCurrency(discount)}</span>
                        <input 
                          type="number" 
                          className="w-16 h-6 bg-[var(--color-bg-primary)] border border-[var(--color-border-primary)] rounded text-[10px] px-1"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                        />
                      </div>
                    </div>
                    {getFeeAmount() > 0 && (
                      <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                        <span>Taxa Maquininha</span>
                        <span className="text-red-400">-{formatCurrency(getFeeAmount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-black text-white pt-2 border-t border-white/5">
                      <span>Total (Líquido: {formatCurrency(calculateTotal() - getFeeAmount())})</span>
                      <span className="gradient-text">{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 py-2 border-t border-white/5">
                    <div>
                      <label className="text-xs text-[var(--color-text-muted)] font-bold">Garantia</label>
                      <select className="select-field py-1 text-xs" value={warranty} onChange={e => setWarranty(e.target.value)}>
                        <option value="90">90 Dias</option>
                        <option value="180">6 Meses</option>
                        <option value="365">1 Ano</option>
                        <option value="0">Sem Garantia</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={issueNfe} onChange={e => setIssueNfe(e.target.checked)} className="rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500" />
                        <span className="text-xs text-white font-medium">Emitir Nota Fiscal (NFe)</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 py-2">
                    <button onClick={() => setPaymentMethod('pix')} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${paymentMethod === 'pix' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <QrCode className="w-4 h-4" /> <span className="text-[9px] font-bold">PIX</span>
                    </button>
                    <button onClick={() => setPaymentMethod('dinheiro')} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${paymentMethod === 'dinheiro' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <Banknote className="w-4 h-4" /> <span className="text-[9px] font-bold">DINH</span>
                    </button>
                    <button onClick={() => setPaymentMethod('debito')} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${paymentMethod === 'debito' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <CreditCard className="w-4 h-4" /> <span className="text-[9px] font-bold">DÉBITO</span>
                    </button>
                    <button onClick={() => setPaymentMethod('credito')} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${paymentMethod === 'credito' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <CreditCard className="w-4 h-4" /> <span className="text-[9px] font-bold">CRÉD 1x</span>
                    </button>
                    <button onClick={() => setPaymentMethod('credito_parcelado')} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${paymentMethod === 'credito_parcelado' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <CreditCard className="w-4 h-4" /> <span className="text-[9px] font-bold">CRÉD Parc</span>
                    </button>
                    <button onClick={() => setPaymentMethod('misto')} className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all col-span-3 ${paymentMethod === 'misto' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-[var(--color-bg-primary)] border-[var(--color-border-primary)] text-[var(--color-text-muted)]'}`}>
                      <span className="text-[9px] font-bold mt-1">MÚLTIPLOS PAGAMENTOS</span>
                    </button>
                  </div>

                  {paymentMethod === 'credito_parcelado' && (
                    <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400">Parcelamento:</span>
                      <select 
                        className="select-field w-24 py-1 text-xs" 
                        value={installments} 
                        onChange={(e) => setInstallments(Number(e.target.value))}
                      >
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}x</option>)}
                      </select>
                    </div>
                  )}

                  {paymentMethod === 'misto' && (
                    <div className="space-y-2 p-3 bg-black/20 rounded-xl border border-white/5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Dividir Pagamento</span>
                        <button onClick={() => setSplitPayments([...splitPayments, { method: 'pix', amount: 0 }])} className="text-xs text-indigo-400 font-bold">+ Adicionar</button>
                      </div>
                      {splitPayments.map((sp, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <select 
                            className="select-field py-1 text-xs flex-1"
                            value={sp.method}
                            onChange={(e) => {
                              const newSp = [...splitPayments];
                              newSp[idx].method = e.target.value;
                              setSplitPayments(newSp);
                            }}
                          >
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="debito">Débito</option>
                            <option value="credito">Crédito 1x</option>
                            <option value="credito_parcelado">Crédito Parcelado</option>
                          </select>
                          <input 
                            type="number" 
                            className="input-field py-1 text-xs w-24"
                            value={sp.amount || ''}
                            onChange={(e) => {
                              const newSp = [...splitPayments];
                              newSp[idx].amount = Number(e.target.value);
                              setSplitPayments(newSp);
                            }}
                            placeholder="Valor"
                          />
                          <button onClick={() => setSplitPayments(splitPayments.filter((_, i) => i !== idx))} className="text-red-400"><Trash2 className="w-4 h-4"/></button>
                        </div>
                      ))}
                      <div className="text-xs text-right mt-2 text-[var(--color-text-muted)]">
                        Restante: {formatCurrency(calculateTotal() - splitPayments.reduce((s, p) => s + (p.amount || 0), 0))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      disabled={cart.length === 0}
                      onClick={() => finalizeSale('orcamento')}
                      className="w-full btn-secondary h-12 justify-center text-sm disabled:opacity-30"
                    >
                      Salvar Orçamento
                    </button>
                    <button 
                      disabled={cart.length === 0}
                      onClick={() => finalizeSale('finalizada')}
                      className="w-full btn-primary h-12 justify-center text-sm disabled:opacity-30"
                    >
                      Finalizar Venda <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Sale Receipt (Hidden normally) */}
      {printSale && (
        <div className="print-only font-mono text-black">
          <h1 className="text-2xl font-bold text-center border-b border-black pb-2 mb-2">Ysaque Imports</h1>
          <p className="text-center text-sm mb-4">Recibo de Venda #{String(printSale.number).padStart(5, '0')}</p>
          <div className="mb-4 text-sm">
            <p>Data: {formatDateTime(printSale.createdAt)}</p>
            <p>Cliente: {printSale.customer?.name || 'Cliente Final'}</p>
            <p>Vendedor: {printSale.seller?.name || 'Sistema'}</p>
          </div>
          <table className="w-full mb-4 text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-black"><th className="pb-1">Item</th><th className="pb-1 text-right">Total</th></tr>
            </thead>
            <tbody>
              {printSale.items.map((i: any) => (
                <tr key={i.id}><td className="py-1">{i.product.name}</td><td className="py-1 text-right">{formatCurrency(i.unitPrice)}</td></tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-black pt-2 space-y-1 text-sm">
            <p className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(printSale.subtotal)}</span></p>
            {printSale.discount > 0 && <p className="flex justify-between"><span>Desconto:</span><span>-{formatCurrency(printSale.discount)}</span></p>}
            <p className="flex justify-between font-bold text-lg mt-2"><span>TOTAL:</span><span>{formatCurrency(printSale.total)}</span></p>
          </div>
          <div className="mt-6 text-xs text-center border-t border-black pt-4">
            <p>{printSale.notes || 'Obrigado pela preferência!'}</p>
          </div>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {showNewCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content p-6">
            <h2 className="text-xl font-bold text-white mb-4">Cadastrar Cliente Rápido</h2>
            <form onSubmit={async (e: any) => {
              e.preventDefault();
              const form = new FormData(e.target);
              try {
                const res = await fetch('/api/customers', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(Object.fromEntries(form.entries()))
                });
                if (res.ok) {
                  const newCust = await res.json();
                  setCustomers([...customers, newCust]);
                  setSelectedCustomer(newCust);
                  setShowNewCustomerModal(false);
                }
              } catch (err) {
                alert('Erro ao cadastrar cliente');
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label">Nome do Cliente</label>
                  <input name="name" type="text" required className="input-field" placeholder="Ex: João da Silva" />
                </div>
                <div>
                  <label className="label">Telefone (WhatsApp)</label>
                  <input name="phone" type="text" className="input-field" placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowNewCustomerModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
