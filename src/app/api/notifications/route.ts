import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const notifications: string[] = [];

    // Low stock
    const products = await prisma.product.findMany({
      where: { active: true },
      include: { inventoryItems: { where: { status: 'disponivel' } } },
    });
    
    products.forEach(p => {
      if (p.inventoryItems.length <= p.minStock) {
        notifications.push(`Estoque baixo: ${p.name} (${p.inventoryItems.length} un)`);
      }
    });

    // Overdue payments
    const today = new Date();
    const overdue = await prisma.transaction.findMany({
      where: { status: 'pendente', dueDate: { lt: today }, type: 'despesa' },
    });
    
    if (overdue.length > 0) {
      notifications.push(`${overdue.length} contas a pagar em atraso!`);
    }

    // Pending service orders (long time)
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const oldOrders = await prisma.serviceOrder.count({
      where: { 
        status: { in: ['recebido', 'diagnosticando'] },
        createdAt: { lt: threeDaysAgo }
      }
    });
    
    if (oldOrders > 0) {
      notifications.push(`${oldOrders} ordens de serviço aguardando há mais de 3 dias.`);
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ notifications: [] });
  }
}
