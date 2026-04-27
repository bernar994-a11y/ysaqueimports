import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const current = await prisma.inventoryItem.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: 'Item not found' }, { status: 404 });

    // Check IMEI uniqueness if changing
    if (body.imei && body.imei !== current.imei) {
      const existing = await prisma.inventoryItem.findUnique({ where: { imei: body.imei } });
      if (existing) return NextResponse.json({ error: 'IMEI já cadastrado' }, { status: 400 });
    }

    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        ...body,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : undefined,
        warrantyEnd: body.warrantyEnd ? new Date(body.warrantyEnd) : undefined,
      },
      include: { product: true },
    });

    // Track location/status change
    if (body.location && body.location !== current.location) {
      await prisma.stockMovement.create({
        data: {
          inventoryItemId: id,
          type: 'transferencia',
          fromLocation: current.location,
          toLocation: body.location,
          reason: body.reason || 'Transferência de local',
        },
      });
    }

    if (body.status && body.status !== current.status) {
      await prisma.stockMovement.create({
        data: {
          inventoryItemId: id,
          type: 'ajuste',
          reason: `Status alterado: ${current.status} → ${body.status}`,
        },
      });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ error: 'Failed to update inventory item' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.stockMovement.deleteMany({ where: { inventoryItemId: id } });
    await prisma.inventoryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete inventory error:', error);
    return NextResponse.json({ error: 'Failed to delete inventory item' }, { status: 500 });
  }
}
