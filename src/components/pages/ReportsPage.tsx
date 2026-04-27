'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, FileText, Download, Printer, 
  Calendar, ChevronRight, TrendingUp, PieChart, 
  ShoppingCart, Package, Users, DollarSign, ArrowRight, Shield, Clock
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [activeReport, setActiveReport] = useState('Vendas Detalhadas');

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { title: 'Relatório Financeiro', desc: 'DRE, Fluxo de Caixa e Margem de Contribuição.', icon: DollarSign, color: 'emerald' },
    { title: 'Vendas Detalhadas', desc: 'Histórico de vendas por vendedor e produto.', icon: ShoppingCart, color: 'indigo' },
    { title: 'Giro de Estoque', desc: 'Análise de ruptura e performance de modelos.', icon: Package, color: 'purple' },
    { title: 'Desempenho CRM', desc: 'Segmentação de clientes e ticket médio.', icon: Users, color: 'amber' },
    { title: 'Auditoria de Sistema', desc: 'Logs de ações e segurança de dados.', icon: FileText, color: 'zinc' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Centro de Inteligência</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Gere relatórios profissionais e insights analíticos do seu negócio.</p>
        </div>
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-xl border border-white/5">
          <Calendar className="w-4 h-4 text-[var(--color-text-muted)] ml-2" />
          <input 
            type="date" 
            className="bg-transparent border-none text-sm text-white focus:ring-0 outline-none w-[120px]"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-[var(--color-text-muted)]">até</span>
          <input 
            type="date" 
            className="bg-transparent border-none text-sm text-white focus:ring-0 outline-none w-[120px]"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, i) => (
          <div key={i} className="glass-card p-6 glass-card-hover flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-${report.color}-500/10 text-${report.color}-400`}>
              <report.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{report.title}</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">{report.desc}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    alert(`O relatório "${report.title}" está sendo preparado para impressão...`);
                    window.print();
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors" title="Imprimir"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => {
                    alert('Para baixar em PDF, clique em imprimir e escolha "Salvar como PDF" no seu navegador.');
                    window.print();
                  }}
                  className="p-2 hover:bg-white/5 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors" title="Baixar PDF"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <button 
                onClick={() => setActiveReport(report.title)}
                className={`btn-secondary btn-sm px-4 ${activeReport === report.title ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : ''}`}
              >
                {activeReport === report.title ? 'Visualizando' : 'Gerar'} <ArrowRight className="w-3 h-3 ml-2" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Preview Area */}
      <div className="glass-card p-6 border-indigo-500/20">
        <div className="flex items-center gap-4 mb-8 border-b border-white/5 pb-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{activeReport}</h3>
            <p className="text-sm text-[var(--color-text-muted)]">Período: {new Date(startDate).toLocaleDateString()} a {new Date(endDate).toLocaleDateString()}</p>
          </div>
        </div>
        
        {loading ? (
          <div className="h-64 flex flex-col gap-4 items-center justify-center">
            <div className="pulse-dot bg-indigo-500"></div>
            <p className="text-[var(--color-text-muted)] text-sm">Extraindo dados...</p>
          </div>
        ) : !data ? (
          <div className="h-64 flex flex-col items-center justify-center gap-4 opacity-50">
            <PieChart className="w-12 h-12 text-indigo-400" />
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Nenhum dado encontrado para o período selecionado.
            </p>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {activeReport === 'Vendas Detalhadas' && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Faturamento Total</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(data.summary?.totalSalesValue || 0)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Lucro Bruto</p>
                    <p className="text-2xl font-black text-emerald-400">{formatCurrency(data.summary?.totalProfitValue || 0)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Qtd. Pedidos</p>
                    <p className="text-2xl font-black text-white">{data.summary?.salesCount || 0}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Ticket Médio</p>
                    <p className="text-2xl font-black text-white">
                      {formatCurrency((data.summary?.totalSalesValue || 0) / (data.summary?.salesCount || 1))}
                    </p>
                  </div>
                </div>

                <div className="h-80 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.salesOverTime || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2e2e32" vertical={false} />
                      <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickFormatter={(val) => val.split('-').reverse().slice(0, 2).join('/')} />
                      <YAxis stroke="#71717a" fontSize={12} tickFormatter={(val) => `R$ ${val/1000}k`} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid #2e2e32', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: any) => formatCurrency(value)}
                        labelFormatter={(label) => `Data: ${label.split('-').reverse().join('/')}`}
                      />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="revenue" name="Faturamento (R$)" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Bar dataKey="profit" name="Lucro Bruto (R$)" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {activeReport === 'Relatório Financeiro' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-2">Total Entradas</p>
                    <p className="text-3xl font-black text-emerald-400">{formatCurrency(data.summary?.totalIncome || 0)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
                    <p className="text-sm font-bold text-red-500 uppercase tracking-widest mb-2">Total Saídas</p>
                    <p className="text-3xl font-black text-red-400">{formatCurrency(data.summary?.totalExpenses || 0)}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <p className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-2">Saldo Líquido</p>
                    <p className="text-3xl font-black text-indigo-400">{formatCurrency((data.summary?.totalIncome || 0) - (data.summary?.totalExpenses || 0))}</p>
                  </div>
                </div>
              </>
            )}

            {activeReport === 'Giro de Estoque' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-card p-6 bg-white/5 border-none">
                  <h4 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Top 10 Produtos (Volume de Vendas)</h4>
                  <div className="space-y-3">
                    {data.topProducts?.map((prod: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-bg-secondary)] border border-white/5">
                        <div className="flex items-center gap-4">
                          <span className="text-lg font-black text-indigo-500 w-6 text-center">#{idx + 1}</span>
                          <div>
                            <p className="text-sm font-bold text-white">{prod.name}</p>
                            <p className="text-xs text-[var(--color-text-muted)]">{prod.quantity} unidades vendidas</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-emerald-400">{formatCurrency(prod.revenue)}</p>
                      </div>
                    ))}
                    {(!data.topProducts || data.topProducts.length === 0) && (
                      <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Nenhum dado de produto encontrado neste período.</p>
                    )}
                  </div>
                </div>
                <div className="glass-card p-6 bg-white/5 border-none flex flex-col">
                  <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Proporção de Faturamento</h4>
                  <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={data.topProducts || []}
                          dataKey="revenue"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={60}
                          paddingAngle={2}
                          label={({name, percent}) => percent > 0.05 ? `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%` : ''}
                        >
                          {data.topProducts?.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#f43f5e', '#8b5cf6', '#0ea5e9', '#14b8a6'][index % 10]} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(val: any) => formatCurrency(val)}
                          contentStyle={{ backgroundColor: '#1c1c1f', border: '1px solid #2e2e32', borderRadius: '8px' }}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeReport === 'Auditoria de Sistema' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">Histórico de Atividade (Logs)</h4>
                  <span className="text-xs text-[var(--color-text-muted)]">{data.auditLogs?.length || 0} registros encontrados</span>
                </div>
                <div className="table-container border-white/5">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Usuário</th>
                        <th>Ação</th>
                        <th>Entidade</th>
                        <th>Detalhes</th>
                        <th>IP / Origem</th>
                        <th>Data / Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.auditLogs?.map((log: any) => (
                        <tr key={log.id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-bold text-indigo-400">
                                {log.user.name[0]}
                              </div>
                              <span className="text-sm font-medium text-white">{log.user.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                              ${log.action === 'create' ? 'bg-emerald-500/10 text-emerald-400' : 
                                log.action === 'update' ? 'bg-blue-500/10 text-blue-400' : 
                                log.action === 'delete' ? 'bg-red-500/10 text-red-400' : 
                                'bg-zinc-500/10 text-zinc-400'}
                            `}>
                              {log.action === 'create' ? 'CRIAR' : 
                               log.action === 'update' ? 'EDITAR' : 
                               log.action === 'delete' ? 'EXCLUIR' : log.action}
                            </span>
                          </td>
                          <td><span className="text-sm text-[var(--color-text-secondary)]">{log.entity}</span></td>
                          <td><p className="text-xs text-[var(--color-text-muted)] truncate max-w-[200px]" title={log.details}>{log.details}</p></td>
                          <td><span className="text-xs font-mono text-[var(--color-text-muted)]">{log.ipAddress || '---'}</span></td>
                          <td><span className="text-xs text-[var(--color-text-secondary)]">{formatDateTime(log.createdAt)}</span></td>
                        </tr>
                      ))}
                      {(!data.auditLogs || data.auditLogs.length === 0) && (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-[var(--color-text-muted)]">
                            Nenhum log de auditoria encontrado para este período.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {['Desempenho CRM'].includes(activeReport) && (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl opacity-50">
                <BarChart3 className="w-12 h-12 mb-4" />
                <p className="text-sm font-medium">As métricas avançadas de {activeReport} estão em processamento estrutural e serão exibidas na próxima atualização.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Print only watermark */}
      <div className="print-only font-mono text-black">
        <h1 className="text-2xl font-bold text-center border-b pb-2 mb-4">Relatório Ysaque Imports</h1>
        <p className="text-center text-sm mb-8">Gerado em: {new Date().toLocaleString()}</p>
        <p className="text-center font-bold">Resumo Analítico</p>
        <div className="border p-4 mt-4 text-sm">
          <p>Os dados detalhados deste relatório não puderam ser carregados para impressão nesta versão.</p>
        </div>
      </div>
    </div>
  );
}
