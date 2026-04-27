import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const period = searchParams.get('period') || '30';

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const where: any = { createdAt: { gte: daysAgo } };
    if (type && type !== 'all') where.type = type;
    if (status && status !== 'all') where.status = status;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { dueDate: 'desc' },
    });

    // Calculate summaries
    const totalIncome = transactions.filter(t => t.type === 'receita' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'despesa' && t.status === 'pago').reduce((s, t) => s + t.amount, 0);
    const pendingPayables = transactions.filter(t => t.type === 'despesa' && t.status === 'pendente').reduce((s, t) => s + t.amount, 0);
    const pendingReceivables = transactions.filter(t => t.type === 'receita' && t.status === 'pendente').reduce((s, t) => s + t.amount, 0);

    // Sales income for the period
    const salesIncome = await prisma.payment.findMany({
      where: { type: 'receita', status: 'pago', createdAt: { gte: daysAgo } },
    });
    const totalSalesIncome = salesIncome.reduce((s, p) => s + p.netAmount, 0);

    return NextResponse.json({
      transactions,
      summary: {
        totalIncome: totalSalesIncome + totalIncome,
        totalExpenses,
        balance: totalSalesIncome + totalIncome - totalExpenses,
        pendingPayables,
        pendingReceivables,
      },
    });
  } catch (error) {
    console.error('Finance error:', error);
    return NextResponse.json({ error: 'Failed to load finance data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const transaction = await prisma.transaction.create({
      data: {
        ...body,
        amount: parseFloat(body.amount),
        dueDate: new Date(body.dueDate),
        paidAt: body.status === 'pago' ? new Date() : (body.paidAt ? new Date(body.paidAt) : null),
      },
    });
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
