import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Current month sales
    const currentMonthSales = await prisma.sale.findMany({
      where: { status: 'finalizada', createdAt: { gte: startOfMonth } },
      include: { items: true },
    });

    // Last month sales
    const lastMonthSales = await prisma.sale.findMany({
      where: { status: 'finalizada', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    });

    // Year sales
    const yearSales = await prisma.sale.findMany({
      where: { status: 'finalizada', createdAt: { gte: startOfYear } },
    });

    // Metrics
    const totalRevenue = currentMonthSales.reduce((s, sale) => s + sale.total, 0);
    const totalProfit = currentMonthSales.reduce((s, sale) => s + sale.profit, 0);
    const totalSales = currentMonthSales.length;
    const avgTicket = totalSales > 0 ? totalRevenue / totalSales : 0;
    const totalFees = currentMonthSales.reduce((s, sale) => s + sale.cardFee, 0);

    const lastMonthRevenue = lastMonthSales.reduce((s, sale) => s + sale.total, 0);
    const revenueGrowth = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;

    const lastMonthProfit = lastMonthSales.reduce((s, sale) => s + sale.profit, 0);
    const profitGrowth = lastMonthProfit > 0 ? ((totalProfit - lastMonthProfit) / lastMonthProfit) * 100 : 0;

    // Inventory stats
    const inventoryStats = await prisma.inventoryItem.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalStock = inventoryStats.reduce((s, i) => s + i._count, 0);
    const availableStock = inventoryStats.find(i => i.status === 'disponivel')?._count || 0;

    // Low stock products
    const products = await prisma.product.findMany({
      where: { active: true },
      include: {
        inventoryItems: { where: { status: 'disponivel' } },
      },
    });

    const lowStockProducts = products.filter(p => p.inventoryItems.length <= p.minStock);

    // Revenue by day (last 30 days)
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailySales = await prisma.sale.findMany({
      where: { status: 'finalizada', createdAt: { gte: last30Days } },
      orderBy: { createdAt: 'asc' },
    });

    const revenueByDay: Record<string, { revenue: number; profit: number; count: number }> = {};
    dailySales.forEach(sale => {
      const day = sale.createdAt.toISOString().split('T')[0];
      if (!revenueByDay[day]) revenueByDay[day] = { revenue: 0, profit: 0, count: 0 };
      revenueByDay[day].revenue += sale.total;
      revenueByDay[day].profit += sale.profit;
      revenueByDay[day].count += 1;
    });

    const chartData = Object.entries(revenueByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        receita: Math.round(data.revenue),
        lucro: Math.round(data.profit),
        vendas: data.count,
      }));

    // Revenue by category
    const allSalesWithItems = await prisma.sale.findMany({
      where: { status: 'finalizada', createdAt: { gte: startOfMonth } },
      include: { items: { include: { product: true } } },
    });

    const revenueByCategory: Record<string, number> = {};
    allSalesWithItems.forEach(sale => {
      sale.items.forEach(item => {
        const cat = item.product.category;
        revenueByCategory[cat] = (revenueByCategory[cat] || 0) + item.total;
      });
    });

    const categoryData = Object.entries(revenueByCategory).map(([name, value]) => ({
      name: name === 'iphone' ? 'iPhones' : name === 'acessorio' ? 'Acessórios' : 'Peças',
      value: Math.round(value),
    }));

    // Top products
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    allSalesWithItems.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = { name: item.product.name, quantity: 0, revenue: 0 };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Payment methods breakdown
    const paymentBreakdown: Record<string, number> = {};
    currentMonthSales.forEach(sale => {
      paymentBreakdown[sale.paymentMethod] = (paymentBreakdown[sale.paymentMethod] || 0) + sale.total;
    });

    const paymentData = Object.entries(paymentBreakdown).map(([method, value]) => ({
      name: method === 'pix' ? 'PIX' : method === 'credito' ? 'Crédito' : method === 'debito' ? 'Débito' : 'Dinheiro',
      value: Math.round(value),
    }));

    // Service orders
    const pendingOrders = await prisma.serviceOrder.count({
      where: { status: { notIn: ['entregue', 'cancelado'] } },
    });

    // Customers count
    const totalCustomers = await prisma.customer.count({ where: { active: true } });

    // Pending transactions
    const pendingTransactions = await prisma.transaction.count({
      where: { status: 'pendente', type: 'despesa' },
    });

    // Monthly expenses
    const monthExpenses = await prisma.transaction.findMany({
      where: { type: 'despesa', status: 'pago', paidAt: { gte: startOfMonth } },
    });
    const totalExpenses = monthExpenses.reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalProfit,
        totalSales,
        avgTicket,
        totalFees,
        revenueGrowth,
        profitGrowth,
        totalStock,
        availableStock,
        lowStockCount: lowStockProducts.length,
        pendingOrders,
        totalCustomers,
        pendingTransactions,
        totalExpenses,
        profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      },
      chartData,
      categoryData,
      topProducts,
      paymentData,
      lowStockProducts: lowStockProducts.slice(0, 5).map(p => ({
        name: p.name,
        model: p.model,
        current: p.inventoryItems.length,
        minimum: p.minStock,
      })),
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
