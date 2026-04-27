import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Settings
  const settings = [
    { key: 'company_name', value: 'Ysaque Imports', type: 'string' },
    { key: 'company_cnpj', value: '00.000.000/0001-00', type: 'string' },
    { key: 'company_phone', value: '(11) 99999-9999', type: 'string' },
    { key: 'company_email', value: 'contato@ysaqueimports.com.br', type: 'string' },
    { key: 'company_address', value: 'Av. Paulista, 1000 - São Paulo/SP', type: 'string' },
    { key: 'tax_credit_rate', value: '2.99', type: 'number' },
    { key: 'tax_debit_rate', value: '1.99', type: 'number' },
    { key: 'tax_pix_rate', value: '0', type: 'number' },
    { key: 'default_warranty_days', value: '90', type: 'number' },
    { key: 'commission_rate', value: '5', type: 'number' },
    { key: 'low_stock_threshold', value: '3', type: 'number' },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Admin User
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ysaque.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@ysaque.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  const vendedor = await prisma.user.upsert({
    where: { email: 'vendedor@ysaque.com' },
    update: {},
    create: {
      name: 'Carlos Vendedor',
      email: 'vendedor@ysaque.com',
      password: await bcrypt.hash('vendedor123', 12),
      role: 'vendedor',
    },
  });

  const tecnico = await prisma.user.upsert({
    where: { email: 'tecnico@ysaque.com' },
    update: {},
    create: {
      name: 'Ana Técnica',
      email: 'tecnico@ysaque.com',
      password: await bcrypt.hash('tecnico123', 12),
      role: 'tecnico',
    },
  });

  // Products
  const products = [
    { name: 'iPhone 16 Pro Max', category: 'iphone', model: 'iPhone 16 Pro Max', color: 'Titânio Natural', storage: '256GB', costPrice: 7500, salePrice: 9999, minStock: 3 },
    { name: 'iPhone 16 Pro Max', category: 'iphone', model: 'iPhone 16 Pro Max', color: 'Titânio Preto', storage: '512GB', costPrice: 8500, salePrice: 11499, minStock: 2 },
    { name: 'iPhone 16 Pro', category: 'iphone', model: 'iPhone 16 Pro', color: 'Titânio Deserto', storage: '256GB', costPrice: 6800, salePrice: 8999, minStock: 3 },
    { name: 'iPhone 16', category: 'iphone', model: 'iPhone 16', color: 'Azul', storage: '128GB', costPrice: 5200, salePrice: 6999, minStock: 4 },
    { name: 'iPhone 15', category: 'iphone', model: 'iPhone 15', color: 'Preto', storage: '128GB', costPrice: 4000, salePrice: 5499, minStock: 5 },
    { name: 'iPhone 15 Pro', category: 'iphone', model: 'iPhone 15 Pro', color: 'Titânio Azul', storage: '256GB', costPrice: 5800, salePrice: 7999, minStock: 3 },
    { name: 'AirPods Pro 2', category: 'acessorio', model: 'AirPods Pro 2', costPrice: 1200, salePrice: 1899, minStock: 5 },
    { name: 'Case MagSafe Original', category: 'acessorio', model: 'MagSafe Case', costPrice: 150, salePrice: 349, minStock: 10 },
    { name: 'Carregador USB-C 20W', category: 'acessorio', model: 'USB-C 20W', costPrice: 80, salePrice: 199, minStock: 15 },
    { name: 'Cabo USB-C/Lightning', category: 'acessorio', model: 'Cable USB-C', costPrice: 50, salePrice: 129, minStock: 20 },
    { name: 'Apple Watch Series 10', category: 'acessorio', model: 'Watch S10', costPrice: 3200, salePrice: 4999, minStock: 3 },
    { name: 'Película de Vidro iPhone 16', category: 'acessorio', model: 'Screen Protector', costPrice: 15, salePrice: 79, minStock: 30 },
    { name: 'Tela iPhone 15 Pro (Peça)', category: 'peca', model: 'Display iPhone 15 Pro', costPrice: 800, salePrice: 1500, minStock: 2 },
    { name: 'Bateria iPhone 14 (Peça)', category: 'peca', model: 'Battery iPhone 14', costPrice: 120, salePrice: 350, minStock: 5 },
  ];

  const createdProducts = [];
  for (const p of products) {
    const prod = await prisma.product.create({ data: p });
    createdProducts.push(prod);
  }

  // Inventory Items with IMEI
  const imeiItems = [
    { productIndex: 0, imei: '353456789012345', status: 'disponivel', location: 'vitrine', condition: 'novo' },
    { productIndex: 0, imei: '353456789012346', status: 'disponivel', location: 'estoque', condition: 'novo' },
    { productIndex: 0, imei: '353456789012347', status: 'vendido', location: 'estoque', condition: 'novo' },
    { productIndex: 1, imei: '353456789012348', status: 'disponivel', location: 'vitrine', condition: 'novo' },
    { productIndex: 1, imei: '353456789012349', status: 'disponivel', location: 'estoque', condition: 'novo' },
    { productIndex: 2, imei: '353456789012350', status: 'disponivel', location: 'vitrine', condition: 'novo' },
    { productIndex: 2, imei: '353456789012351', status: 'disponivel', location: 'estoque', condition: 'seminovo' },
    { productIndex: 3, imei: '353456789012352', status: 'disponivel', location: 'vitrine', condition: 'novo' },
    { productIndex: 3, imei: '353456789012353', status: 'disponivel', location: 'estoque', condition: 'novo' },
    { productIndex: 3, imei: '353456789012354', status: 'disponivel', location: 'estoque', condition: 'novo' },
    { productIndex: 4, imei: '353456789012355', status: 'disponivel', location: 'estoque', condition: 'seminovo' },
    { productIndex: 4, imei: '353456789012356', status: 'disponivel', location: 'vitrine', condition: 'novo' },
    { productIndex: 5, imei: '353456789012357', status: 'disponivel', location: 'estoque', condition: 'novo' },
    { productIndex: 5, imei: '353456789012358', status: 'assistencia', location: 'estoque', condition: 'novo' },
  ];

  for (const item of imeiItems) {
    await prisma.inventoryItem.create({
      data: {
        productId: createdProducts[item.productIndex].id,
        imei: item.imei,
        status: item.status,
        location: item.location,
        condition: item.condition,
        costPrice: createdProducts[item.productIndex].costPrice,
        purchaseDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        warrantyEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Accessories inventory (no IMEI)
  for (let i = 6; i < createdProducts.length; i++) {
    const qty = createdProducts[i].minStock + Math.floor(Math.random() * 10);
    for (let j = 0; j < qty; j++) {
      await prisma.inventoryItem.create({
        data: {
          productId: createdProducts[i].id,
          status: 'disponivel',
          location: j % 3 === 0 ? 'vitrine' : 'estoque',
          condition: 'novo',
          costPrice: createdProducts[i].costPrice,
          purchaseDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }

  // Customers
  const customers = [
    { name: 'João Silva', email: 'joao@email.com', phone: '(11) 98765-4321', cpf: '123.456.789-01', city: 'São Paulo', state: 'SP', score: 85, totalSpent: 25000, totalOrders: 4 },
    { name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 91234-5678', cpf: '987.654.321-01', city: 'São Paulo', state: 'SP', score: 92, totalSpent: 45000, totalOrders: 8 },
    { name: 'Pedro Oliveira', email: 'pedro@email.com', phone: '(21) 99876-5432', cpf: '456.789.123-01', city: 'Rio de Janeiro', state: 'RJ', score: 60, totalSpent: 7000, totalOrders: 1 },
    { name: 'Ana Costa', email: 'ana@email.com', phone: '(11) 97654-3210', cpf: '789.123.456-01', city: 'São Paulo', state: 'SP', score: 75, totalSpent: 15000, totalOrders: 3 },
    { name: 'Lucas Ferreira', email: 'lucas@email.com', phone: '(31) 98765-1234', cpf: '321.654.987-01', city: 'Belo Horizonte', state: 'MG', score: 45, totalSpent: 3500, totalOrders: 1 },
  ];

  const createdCustomers = [];
  for (const c of customers) {
    const cust = await prisma.customer.create({ data: c });
    createdCustomers.push(cust);
  }

  // Sample Sales
  const now = new Date();
  for (let i = 0; i < 30; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const saleDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const productIdx = Math.floor(Math.random() * 6);
    const product = createdProducts[productIdx];
    const quantity = 1;
    const unitPrice = product.salePrice;
    const costPrice = product.costPrice;
    const total = unitPrice * quantity;
    const profit = total - costPrice * quantity;
    const paymentMethods = ['pix', 'credito', 'debito', 'dinheiro'];
    const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    const cardFee = method === 'credito' ? total * 0.0299 : method === 'debito' ? total * 0.0199 : 0;

    await prisma.sale.create({
      data: {
        customerId: createdCustomers[Math.floor(Math.random() * createdCustomers.length)].id,
        sellerId: i % 3 === 0 ? admin.id : vendedor.id,
        status: 'finalizada',
        subtotal: total,
        total: total,
        costTotal: costPrice * quantity,
        profit: profit - cardFee,
        profitMargin: ((profit - cardFee) / total) * 100,
        paymentMethod: method,
        installments: method === 'credito' ? Math.ceil(Math.random() * 12) : 1,
        cardFee: cardFee,
        createdAt: saleDate,
        items: {
          create: {
            productId: product.id,
            quantity,
            unitPrice,
            costPrice,
            total,
          },
        },
        payments: {
          create: {
            type: 'receita',
            method,
            amount: total,
            fee: cardFee,
            netAmount: total - cardFee,
            status: 'pago',
            paidAt: saleDate,
            category: 'venda',
            description: `Venda #${i + 1}`,
          },
        },
      },
    });
  }

  // Accessory sales
  for (let i = 0; i < 40; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const saleDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const productIdx = 6 + Math.floor(Math.random() * 6);
    const product = createdProducts[productIdx];
    const quantity = 1 + Math.floor(Math.random() * 3);
    const unitPrice = product.salePrice;
    const costPrice = product.costPrice;
    const total = unitPrice * quantity;
    const profit = total - costPrice * quantity;
    const method = ['pix', 'credito', 'dinheiro'][Math.floor(Math.random() * 3)];
    const cardFee = method === 'credito' ? total * 0.0299 : 0;

    await prisma.sale.create({
      data: {
        customerId: Math.random() > 0.3 ? createdCustomers[Math.floor(Math.random() * createdCustomers.length)].id : null,
        sellerId: vendedor.id,
        status: 'finalizada',
        subtotal: total,
        total,
        costTotal: costPrice * quantity,
        profit: profit - cardFee,
        profitMargin: ((profit - cardFee) / total) * 100,
        paymentMethod: method,
        cardFee,
        createdAt: saleDate,
        items: {
          create: {
            productId: product.id,
            quantity,
            unitPrice,
            costPrice,
            total,
          },
        },
        payments: {
          create: {
            type: 'receita',
            method,
            amount: total,
            fee: cardFee,
            netAmount: total - cardFee,
            status: 'pago',
            paidAt: saleDate,
            category: 'venda',
            description: `Venda Acessório`,
          },
        },
      },
    });
  }

  // Transactions (expenses)
  const expenses = [
    { category: 'aluguel', description: 'Aluguel da loja', amount: 5000, recurring: true, recurrenceType: 'mensal' },
    { category: 'salario', description: 'Salário - Carlos', amount: 3000, recurring: true, recurrenceType: 'mensal' },
    { category: 'salario', description: 'Salário - Ana', amount: 3500, recurring: true, recurrenceType: 'mensal' },
    { category: 'fornecedor', description: 'Compra lote iPhones', amount: 45000, recurring: false },
    { category: 'imposto', description: 'DAS MEI', amount: 71.60, recurring: true, recurrenceType: 'mensal' },
    { category: 'outros', description: 'Energia elétrica', amount: 450, recurring: true, recurrenceType: 'mensal' },
    { category: 'outros', description: 'Internet', amount: 200, recurring: true, recurrenceType: 'mensal' },
  ];

  for (const exp of expenses) {
    for (let m = 0; m < 3; m++) {
      const dueDate = new Date(now.getFullYear(), now.getMonth() - m, 10);
      await prisma.transaction.create({
        data: {
          type: 'despesa',
          category: exp.category,
          description: exp.description,
          amount: exp.amount,
          dueDate,
          paidAt: m > 0 ? dueDate : null,
          status: m > 0 ? 'pago' : 'pendente',
          recurring: exp.recurring,
          recurrenceType: exp.recurrenceType,
        },
      });
    }
  }

  // Service Orders
  const serviceOrders = [
    { customerId: createdCustomers[0].id, deviceModel: 'iPhone 14 Pro', deviceImei: '351234567890123', issueDescription: 'Tela trincada - queda', status: 'em_reparo', priority: 'alta', estimatedCost: 1200 },
    { customerId: createdCustomers[1].id, deviceModel: 'iPhone 13', deviceImei: '351234567890124', issueDescription: 'Bateria viciada - desliga sozinho', status: 'aguardando_peca', priority: 'normal', estimatedCost: 350 },
    { customerId: createdCustomers[2].id, deviceModel: 'iPhone 15 Pro Max', deviceImei: '351234567890125', issueDescription: 'Não carrega - conector com defeito', status: 'pronto', priority: 'normal', estimatedCost: 250, finalCost: 250 },
    { customerId: createdCustomers[3].id, deviceModel: 'iPhone 12', issueDescription: 'Câmera traseira borrada', status: 'diagnosticando', priority: 'baixa', estimatedCost: 500 },
    { customerId: createdCustomers[4].id, deviceModel: 'iPhone 16', deviceImei: '351234567890126', issueDescription: 'Botão lateral travado', status: 'recebido', priority: 'normal' },
  ];

  for (const so of serviceOrders) {
    await prisma.serviceOrder.create({
      data: {
        ...so,
        technicianId: tecnico.id,
      },
    });
  }

  // Suppliers
  const suppliers = [
    { name: 'Apple Brasil Distribuidora', email: 'vendas@applebrasil.com', phone: '(11) 3000-1234', cnpj: '12.345.678/0001-90', category: 'iphones' },
    { name: 'TechParts Importadora', email: 'contato@techparts.com', phone: '(11) 3000-5678', cnpj: '23.456.789/0001-01', category: 'pecas' },
    { name: 'AccessoryWorld', email: 'vendas@accessoryworld.com', phone: '(11) 3000-9012', cnpj: '34.567.890/0001-12', category: 'acessorios' },
  ];

  for (const sup of suppliers) {
    await prisma.supplier.create({ data: sup });
  }

  console.log('✅ Database seeded successfully!');
  console.log('📧 Admin: admin@ysaque.com / admin123');
  console.log('📧 Vendedor: vendedor@ysaque.com / vendedor123');
  console.log('📧 Técnico: tecnico@ysaque.com / tecnico123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
