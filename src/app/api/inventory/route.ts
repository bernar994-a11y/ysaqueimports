import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const location = searchParams.get('location');
    const productId = searchParams.get('productId');
    const search = searchParams.get('search');

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (location && location !== 'all') where.location = location;
    if (productId) where.productId = productId;

    const items = await prisma.inventoryItem.findMany({
      where: {
        ...where,
        ...(search ? {
          OR: [
            { imei: { contains: search } },
            { serialNumber: { contains: search } },
            { product: { name: { contains: search } } },
            { product: { model: { contains: search } } },
          ],
        } : {}),
      },
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Inventory error:', error);
    return NextResponse.json({ error: 'Failed to load inventory' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check IMEI uniqueness
    if (body.imei) {
      const existing = await prisma.inventoryItem.findUnique({ where: { imei: body.imei } });
      if (existing) {
        return NextResponse.json({ error: 'IMEI já cadastrado no sistema' }, { status: 400 });
      }
    }

    const item = await prisma.inventoryItem.create({
      data: {
        ...body,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : new Date(),
        warrantyEnd: body.warrantyEnd ? new Date(body.warrantyEnd) : null,
      },
      include: { product: true },
    });

    // Create stock movement
    await prisma.stockMovement.create({
      data: {
        inventoryItemId: item.id,
        type: 'entrada',
        toLocation: body.location || 'estoque',
        reason: 'Cadastro de novo item',
      },
    });

    // Auditoria
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (adminUser) {
      await prisma.auditLog.create({
        data: {
          userId: adminUser.id,
          action: 'create',
          entity: 'inventory',
          entityId: item.id,
          details: `Novo item em estoque: ${item.product.name} (IMEI: ${item.imei || 'S/N'})`,
        }
      });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Create inventory error:', error);
    return NextResponse.json({ error: 'Failed to create inventory item' }, { status: 500 });
  }
}
