import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.birthDate) body.birthDate = new Date(body.birthDate);
    const customer = await prisma.customer.update({ where: { id }, data: body });

    // Auditoria
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'update',
          entity: 'customer',
          entityId: id,
          details: `Edição de dados do cliente: ${customer.name}`,
        }
      });
    }

    return NextResponse.json(customer);
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'CPF já cadastrado' }, { status: 400 });
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const customer = await prisma.customer.update({ where: { id }, data: { active: false } });

    // Auditoria
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'delete',
          entity: 'customer',
          entityId: id,
          details: `Cliente desativado: ${customer.name}`,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
