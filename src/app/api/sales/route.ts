import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const period = searchParams.get('period') || '30';

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const where: any = { createdAt: { gte: daysAgo } };
    if (status && status !== 'all') where.status = status;

    const sales = await prisma.sale.findMany({
      where: {
        ...where,
        ...(search ? {
          OR: [
            { customer: { name: { contains: search } } },
            { number: isNaN(parseInt(search)) ? undefined : parseInt(search) },
          ].filter(Boolean),
        } : {}),
      },
      include: {
        customer: true,
        seller: true,
        items: { include: { product: true, inventoryItem: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Sales error:', error);
    return NextResponse.json({ error: 'Failed to load sales' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, paymentMethod, splitPayments = [], installments = 1, customerId, discount = 0, status = 'finalizada' } = body;
    const isOrcamento = status === 'orcamento';

    // Calculate totals
    let subtotal = 0;
    let costTotal = 0;
    const saleItems: any[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;

      let inventoryItem = null;
      if (item.inventoryItemId) {
        inventoryItem = await prisma.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
        if (!inventoryItem || inventoryItem.status !== 'disponivel') {
          return NextResponse.json({ error: `Item indisponível (IMEI: ${inventoryItem?.imei})` }, { status: 400 });
        }
      }

      const unitPrice = item.unitPrice || product.salePrice;
      const cost = inventoryItem?.costPrice || product.costPrice;
      const qty = item.quantity || 1;
      const total = unitPrice * qty;

      subtotal += total;
      costTotal += cost * qty;

      saleItems.push({
        productId: item.productId,
        inventoryItemId: item.inventoryItemId || null,
        quantity: qty,
        unitPrice,
        costPrice: cost,
        discount: 0,
        total,
      });
    }

    // Calculate fees
    const settings = await prisma.setting.findMany();
    const getRate = (key: string) => parseFloat(settings.find(s => s.key === key)?.value || '0');

    const total = subtotal - discount;
    let cardFee = 0;
    
    const calculateFee = (method: string, amount: number) => {
      if (method === 'credito') return amount * (getRate('tax_credit_rate') / 100);
      if (method === 'credito_parcelado') return amount * (getRate('tax_credit_installment_rate') / 100);
      if (method === 'debito') return amount * (getRate('tax_debit_rate') / 100);
      if (method === 'pix') return amount * (getRate('tax_pix_rate') / 100);
      return 0;
    };

    let paymentsData: any[] = [];
    if (!isOrcamento) {
      if (paymentMethod === 'misto' && splitPayments.length > 0) {
        for (const sp of splitPayments) {
          const fee = calculateFee(sp.method, sp.amount);
          cardFee += fee;
          paymentsData.push({
            type: 'receita',
            method: sp.method,
            amount: sp.amount,
            fee: fee,
            netAmount: sp.amount - fee,
            installments: sp.method === 'credito_parcelado' ? installments : 1,
            status: 'pago',
            paidAt: new Date(),
            category: 'venda',
            description: `Venda finalizada (Misto)`,
          });
        }
      } else {
        cardFee = calculateFee(paymentMethod, total);
        paymentsData.push({
          type: 'receita',
          method: paymentMethod,
          amount: total,
          fee: cardFee,
          netAmount: total - cardFee,
          installments: paymentMethod.includes('credito') ? installments : 1,
          status: 'pago',
          paidAt: new Date(),
          category: 'venda',
          description: `Venda finalizada`,
        });
      }
    }

    const profit = total - costTotal - cardFee;
    const profitMargin = total > 0 ? (profit / total) * 100 : 0;

    // Get admin user for seller
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!adminUser) return NextResponse.json({ error: 'No admin user found' }, { status: 500 });

    // Create sale
    const sale = await prisma.sale.create({
      data: {
        customerId: customerId || null,
        sellerId: body.sellerId || adminUser.id,
        status: status,
        subtotal,
        discount,
        total,
        costTotal,
        profit,
        profitMargin,
        paymentMethod,
        installments,
        cardFee,
        notes: body.notes,
        items: { create: saleItems },
        payments: {
          create: paymentsData,
        },
      },
      include: {
        customer: true,
        seller: true,
        items: { include: { product: true } },
      },
    });
    
    // Criar log de auditoria
    await prisma.auditLog.create({
      data: {
        userId: adminUser.id,
        action: 'create',
        entity: isOrcamento ? 'orcamento' : 'sale',
        entityId: sale.id,
        details: `${isOrcamento ? 'Orçamento' : 'Venda'} #${sale.number} no valor de R$ ${total.toFixed(2)}`,
      }
    });

    // Mark inventory items as sold if not orcamento
    if (!isOrcamento) {
      for (const item of saleItems) {
        if (item.inventoryItemId) {
          await prisma.inventoryItem.update({
            where: { id: item.inventoryItemId },
            data: { status: 'vendido' },
          });
          await prisma.stockMovement.create({
            data: {
              inventoryItemId: item.inventoryItemId,
              type: 'saida',
              reason: `Venda #${sale.number}`,
            },
          });
        }
      }
    }

    // Update customer stats
    if (customerId && !isOrcamento) {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      if (customer) {
        await prisma.customer.update({
          where: { id: customerId },
          data: {
            totalSpent: customer.totalSpent + total,
            totalOrders: customer.totalOrders + 1,
            lastPurchase: new Date(),
            score: Math.min(100, customer.score + 2),
          },
        });
      }
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error('Create sale error:', error);
    return NextResponse.json({ error: 'Failed to create sale' }, { status: 500 });
  }
}
