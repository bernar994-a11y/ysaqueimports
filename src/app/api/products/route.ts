import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: any = { active: true };
    if (category && category !== 'all') where.category = category;

    const products = await prisma.product.findMany({
      where: {
        ...where,
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { model: { contains: search } },
            { sku: { contains: search } },
          ],
        } : {}),
      },
      include: {
        inventoryItems: {
          where: status && status !== 'all' ? { status } : undefined,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    const result = products.map(p => ({
      ...p,
      stockCount: p.inventoryItems.filter(i => i.status === 'disponivel').length,
      totalCount: p.inventoryItems.length,
      lowStock: p.inventoryItems.filter(i => i.status === 'disponivel').length <= p.minStock,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Products error:', error);
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product);
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
