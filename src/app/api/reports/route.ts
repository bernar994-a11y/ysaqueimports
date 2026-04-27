import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');

    const startDate = startParam ? new Date(startParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = endParam ? new Date(endParam) : new Date();
    
    if (endParam) {
      endDate.setHours(23, 59, 59, 999);
    }

    // Buscar vendas finalizadas
    const sales = await prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: { not: 'orcamento' }
      },
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    // Agrupar Vendas por Dia e Top Produtos
    const salesOverTimeMap: Record<string, any> = {};
    const topProductsMap: Record<string, any> = {};
    let totalSalesValue = 0;
    let totalProfitValue = 0;

    sales.forEach(sale => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      if (!salesOverTimeMap[dateKey]) {
        salesOverTimeMap[dateKey] = { date: dateKey, revenue: 0, profit: 0, orders: 0 };
      }
      salesOverTimeMap[dateKey].revenue += sale.total;
      salesOverTimeMap[dateKey].profit += sale.profit;
      salesOverTimeMap[dateKey].orders += 1;

      totalSalesValue += sale.total;
      totalProfitValue += sale.profit;

      sale.items.forEach(item => {
        const prodId = item.product.id;
        if (!topProductsMap[prodId]) {
          topProductsMap[prodId] = { name: item.product.name, quantity: 0, revenue: 0 };
        }
        topProductsMap[prodId].quantity += 1;
        topProductsMap[prodId].revenue += item.unitPrice;
      });
    });

    // Financeiro no período
    const transactions = await prisma.transaction.findMany({
      where: {
        dueDate: {
          gte: startDate,
          lte: endDate,
        }
      }
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    transactions.forEach(t => {
      if (t.type === 'receita') totalIncome += t.amount;
      if (t.type === 'despesa') totalExpenses += t.amount;
    });

    const salesOverTime = Object.values(salesOverTimeMap).sort((a: any, b: any) => a.date.localeCompare(b.date));
    const topProducts = Object.values(topProductsMap)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);

    // Buscar logs de auditoria
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        }
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    return NextResponse.json({
      summary: {
        totalSalesValue,
        totalProfitValue,
        totalIncome,
        totalExpenses,
        salesCount: sales.length
      },
      salesOverTime,
      topProducts,
      auditLogs
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Erro interno ao gerar relatório' }, { status: 500 });
  }
}
