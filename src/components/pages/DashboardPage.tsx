'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, DollarSign, Package, 
  ShoppingCart, Users, AlertTriangle, ArrowUpRight, 
  ChevronRight, Smartphone, BarChart3 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b981'];

interface DashboardData {
  metrics: {
    totalRevenue: number;
    totalProfit: number;
    totalSales: number;
    avgTicket: number;
    revenueGrowth: number;
    profitGrowth: number;
    availableStock: number;
    lowStockCount: number;
    pendingOrders: number;
    totalCustomers: number;
    profitMargin: number;
  };
  chartData: any[];
  categoryData: any[];
  topProducts: any[];
  paymentData: any[];
  lowStockProducts: any[];
}

export default function DashboardPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]" />
        ))}
        <div className="lg:col-span-3 h-80 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]" />
        <div className="h-80 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-primary)]" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header with AI Insight */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo, Admin</h1>
          <p className="text-[var(--color-text-secondary)]">Visão geral da sua operação em tempo real.</p>
        </div>
        
        <div className="glass-card px-4 py-3 flex items-center gap-4 border-indigo-500/30 bg-indigo-500/5">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Insight de IA</p>
            <p className="text-sm text-[var(--color-text-primary)]">
              Previsão de <span className="font-bold text-white">vendas +15%</span> para o próximo final de semana.
            </p>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Receita Mensal" 
          value={formatCurrency(data.metrics.totalRevenue)} 
          growth={data.metrics.revenueGrowth} 
          icon={DollarSign}
          color="indigo"
        />
        <MetricCard 
          title="Lucro Líquido" 
          value={formatCurrency(data.metrics.totalProfit)} 
          growth={data.metrics.profitGrowth} 
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard 
          title="Ticket Médio" 
          value={formatCurrency(data.metrics.avgTicket)} 
          icon={ShoppingCart}
          color="purple"
        />
        <MetricCard 
          title="Margem Média" 
          value={formatPercent(data.metrics.profitMargin)} 
          icon={BarChart3}
          color="amber"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 glass-card p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-white">Fluxo de Receita</h3>
              <p className="text-sm text-[var(--color-text-muted)]">Últimos 30 dias de operação</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717a', fontSize: 12}}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#71717a', fontSize: 12}}
                  tickFormatter={(val) => `R$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '13px'}}
                  itemStyle={{padding: '2px 0'}}
                />
                <Area type="monotone" dataKey="receita" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="lucro" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Vendas por Categoria</h3>
          <p className="text-sm text-[var(--color-text-muted)] mb-8">Distribuição do faturamento</p>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {data.categoryData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-sm text-[var(--color-text-secondary)]">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Low Stock & Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-semibold text-white">Alertas de Estoque</h3>
            </div>
            <button 
              onClick={() => onNavigate('inventory')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Ver tudo <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {data.lowStockProducts.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">Nenhum alerta de estoque no momento.</p>
            ) : (
              data.lowStockProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-[var(--color-text-secondary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{p.model}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-amber-500">{p.current} un</p>
                    <p className="text-[10px] text-[var(--color-text-muted)]">Mín: {p.minimum}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Mais Vendidos</h3>
            <span className="text-xs font-medium text-[var(--color-text-muted)]">Este mês</span>
          </div>
          <div className="space-y-4">
            {data.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xs font-bold text-[var(--color-text-secondary)]">
                    {i + 1}
                  </div>
                  <p className="text-sm text-[var(--color-text-secondary)]">{p.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(p.revenue)}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{p.quantity} unidades</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, growth, icon: Icon, color }: any) {
  const colorClasses: any = {
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20',
    purple: 'from-purple-500/20 to-purple-500/5 text-purple-400 border-purple-500/20',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20',
  };

  return (
    <div className="glass-card p-5 glass-card-hover metric-card">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center border`}>
          <Icon className="w-5 h-5" />
        </div>
        {growth !== undefined && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${growth >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-[var(--color-text-muted)]">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight mt-1 animate-count">{value}</h4>
      </div>
    </div>
  );
}
