import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const dataToUpdate: any = { ...body };

    if (body.amount !== undefined) {
      dataToUpdate.amount = parseFloat(body.amount);
    }
    
    if (body.dueDate) {
      dataToUpdate.dueDate = new Date(body.dueDate);
    }

    if (body.status) {
      if (body.status === 'pago') {
        dataToUpdate.paidAt = new Date();
      } else {
        dataToUpdate.paidAt = null;
      }
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: dataToUpdate,
    });

    // Auditoria
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'update',
          entity: 'transaction',
          entityId: id,
          details: `Atualização de transação: ${transaction.description}. Novo status: ${transaction.status}`,
        }
      });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const transaction = await prisma.transaction.findUnique({ where: { id } });

    await prisma.transaction.delete({
      where: { id },
    });

    // Auditoria
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser && transaction) {
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'delete',
          entity: 'transaction',
          entityId: id,
          details: `Exclusão de transação: ${transaction.description} no valor de R$ ${transaction.amount}`,
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete transaction error:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
