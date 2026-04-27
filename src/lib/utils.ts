export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
  }
  return cpf;
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  if (cleaned.length === 14) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
  }
  return cnpj;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    disponivel: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    vitrine: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    reservado: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    vendido: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    defeito: 'bg-red-500/10 text-red-400 border-red-500/20',
    assistencia: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    finalizada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    cancelada: 'bg-red-500/10 text-red-400 border-red-500/20',
    rascunho: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    recebido: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    diagnosticando: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    aguardando_peca: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    em_reparo: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    pronto: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    entregue: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    pendente: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    pago: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    atrasado: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return colors[status] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    disponivel: 'Disponível',
    vitrine: 'Vitrine',
    reservado: 'Reservado',
    vendido: 'Vendido',
    defeito: 'Defeito',
    assistencia: 'Assistência',
    finalizada: 'Finalizada',
    cancelada: 'Cancelada',
    rascunho: 'Rascunho',
    recebido: 'Recebido',
    diagnosticando: 'Diagnosticando',
    aguardando_peca: 'Aguardando Peça',
    em_reparo: 'Em Reparo',
    pronto: 'Pronto',
    entregue: 'Entregue',
    pendente: 'Pendente',
    pago: 'Pago',
    atrasado: 'Atrasado',
    novo: 'Novo',
    seminovo: 'Seminovo',
    usado: 'Usado',
    recondicionado: 'Recondicionado',
    baixa: 'Baixa',
    normal: 'Normal',
    alta: 'Alta',
    urgente: 'Urgente',
    admin: 'Administrador',
    vendedor: 'Vendedor',
    tecnico: 'Técnico',
  };
  return labels[status] || status;
}

export function calculateProfit(salePrice: number, costPrice: number, fee: number = 0): number {
  return salePrice - costPrice - fee;
}

export function calculateMargin(salePrice: number, costPrice: number): number {
  if (salePrice === 0) return 0;
  return ((salePrice - costPrice) / salePrice) * 100;
}

export function generateIMEI(): string {
  const tac = '35' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  const snr = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const partial = tac + snr;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(partial[i]);
    if (i % 2 === 1) digit *= 2;
    if (digit > 9) digit -= 9;
    sum += digit;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return partial + checkDigit;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getDaysFromNow(date: Date | string): number {
  const d = new Date(date);
  const now = new Date();
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
