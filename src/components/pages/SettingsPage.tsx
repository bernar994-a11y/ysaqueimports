'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, Building2, CreditCard, Percent, Bell, 
  ShieldCheck, Smartphone, Save, Globe, Info, Clock, CheckCircle2
} from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('company');

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(json => {
        setSettings(json);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 glass-card" />;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Configurações do Sistema</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Gerencie os parâmetros da sua empresa e taxas operacionais.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          <TabButton active={activeTab === 'company'} onClick={() => setActiveTab('company')} icon={Building2} label="Empresa" />
          <TabButton active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={CreditCard} label="Financeiro & Taxas" />
          <TabButton active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} icon={Bell} label="Notificações & IA" />
          <TabButton active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={ShieldCheck} label="Sistema & Segurança" />
        </div>

        {/* Form Content */}
        <div className="flex-1 glass-card p-8">
          <form onSubmit={handleSave} className="space-y-8">
            {activeTab === 'company' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Dados da Empresa</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="label">Nome da Loja</label>
                    <input name="company_name" type="text" className="input-field" defaultValue={settings.company_name} />
                  </div>
                  <div>
                    <label className="label">CNPJ</label>
                    <input name="company_cnpj" type="text" className="input-field" defaultValue={settings.company_cnpj} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label">Telefone / WhatsApp</label>
                      <input name="company_phone" type="text" className="input-field" defaultValue={settings.company_phone} />
                    </div>
                    <div>
                      <label className="label">E-mail Comercial</label>
                      <input name="company_email" type="email" className="input-field" defaultValue={settings.company_email} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Endereço Completo</label>
                    <input name="company_address" type="text" className="input-field" defaultValue={settings.company_address} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <CreditCard className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Taxas & Operações</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="label flex items-center gap-2"><Percent className="w-3 h-3" /> Taxa Crédito (%)</label>
                    <input name="tax_credit_rate" type="number" step="0.01" className="input-field" defaultValue={settings.tax_credit_rate} />
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-2">Dedução automática no cálculo de lucro.</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="label flex items-center gap-2"><Percent className="w-3 h-3" /> Taxa Crédito Parcelado (%)</label>
                    <input name="tax_credit_installment_rate" type="number" step="0.01" className="input-field" defaultValue={settings.tax_credit_installment_rate} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="label flex items-center gap-2"><Percent className="w-3 h-3" /> Taxa Débito (%)</label>
                    <input name="tax_debit_rate" type="number" step="0.01" className="input-field" defaultValue={settings.tax_debit_rate} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="label flex items-center gap-2"><Percent className="w-3 h-3" /> Taxa PIX (%)</label>
                    <input name="tax_pix_rate" type="number" step="0.01" className="input-field" defaultValue={settings.tax_pix_rate} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <label className="label flex items-center gap-2"><Percent className="w-3 h-3" /> Comissão (%)</label>
                    <input name="commission_rate" type="number" step="0.01" className="input-field" defaultValue={settings.commission_rate} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <Bell className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold text-white">Alertas & Inteligência</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">Aviso de Estoque Baixo</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Limite para disparar alerta de reposição.</p>
                    </div>
                    <input name="low_stock_threshold" type="number" className="input-field w-20" defaultValue={settings.low_stock_threshold} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div>
                      <p className="text-sm font-bold text-white">Garantia Padrão (Dias)</p>
                      <p className="text-xs text-[var(--color-text-muted)]">Duração automática da garantia de serviço.</p>
                    </div>
                    <input name="default_warranty_days" type="number" className="input-field w-20" defaultValue={settings.default_warranty_days} />
                  </div>
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                    <Info className="w-5 h-5 text-indigo-400 shrink-0" />
                    <div>
                      <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-1">Dica de IA</p>
                      <p className="text-xs text-[var(--color-text-secondary)]">O sistema analisa seu ticket médio automaticamente para sugerir ajustes de preço baseados na demanda local.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end">
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary px-10 h-12 text-base shadow-xl shadow-indigo-500/20 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'} <Save className="w-5 h-5 ml-2" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
        ${active 
          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5' 
          : 'text-[var(--color-text-muted)] hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon className={`w-[18px] h-[18px] ${active ? 'text-indigo-400' : 'text-zinc-500'}`} />
      {label}
    </button>
  );
}
