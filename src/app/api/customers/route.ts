import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');

    const customers = await prisma.customer.findMany({
      where: {
        active: true,
        ...(search ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { phone: { contains: search } },
            { cpf: { contains: search } },
          ],
        } : {}),
      },
      include: {
        sales: { orderBy: { createdAt: 'desc' }, take: 5, include: { items: { include: { product: true } } } },
        serviceOrders: { orderBy: { createdAt: 'desc' }, take: 3 },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Customers error:', error);
    return NextResponse.json({ error: 'Failed to load customers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.birthDate) body.birthDate = new Date(body.birthDate);
    const customer = await prisma.customer.create({ data: body });
    return NextResponse.json(customer);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'CPF já cadastrado no sistema' }, { status: 400 });
    }
    console.error('Create customer error:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
