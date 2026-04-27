import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning and initializing database for production...');

  // 1. Settings (Default configurations)
  const settings = [
    { key: 'company_name', value: 'Ysaque Imports', type: 'string' },
    { key: 'company_cnpj', value: '00.000.000/0001-00', type: 'string' },
    { key: 'company_phone', value: '(11) 99999-9999', type: 'string' },
    { key: 'company_email', value: 'contato@ysaqueimports.com.br', type: 'string' },
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

  // 2. Default Admin User
  const hashedPassword = await bcrypt.hash('ysaque@2026', 12);
  await prisma.user.upsert({
    where: { email: 'admin@ysaque.com' },
    update: { password: hashedPassword },
    create: {
      name: 'Administrador',
      email: 'admin@ysaque.com',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Database is now clean and ready for the client!');
  console.log('📧 Login: admin@ysaque.com');
  console.log('🔑 Senha: ysaque@2026');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
