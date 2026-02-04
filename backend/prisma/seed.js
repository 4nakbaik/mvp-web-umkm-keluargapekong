const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Password Hash
  const password = await bcrypt.hash('admin123', 12);

  // 2. User (Admin) 
  const user = await prisma.user.upsert({
    where: { email: 'noreply@pekongfam.com' },
    update: {},
    create: {
      email: 'noreply@pekongfam.com',
      name: 'Nur Cholis',
      password: password,
      role: 'ADMIN',
    },
  });

  console.log(`Created User: ${user.name} (${user.email})`);

  // 3. Data Produk Dummy (boleh ditambah sesuai kebutuhan ye)
  const products = [
    {
      name: 'Kopi Esspresso Gula Jawa',
      description: 'Kopi espresso impor dengan gula jawa yang penuh khasiat dengan rasa yang unix',
      price: 33000,
      stock: 13,
      category: 'MINUMAN',
      userId: user.id,
    },
    {
      name: 'Nasi Kuching Khas Oleg',
      description: 'Nasi Kucing yang dibakar dengan arang dari oleg, dengan aroma yang khas gas emisi',
      price: 20000,
      stock: 20,
      category: 'MAKANAN',
      userId: user.id,
    },
    {
      name: 'Es Teh Manis Solo',
      description: 'Pria solo itu lagi, minum es teh manis ini biar nepotism berkurang',
      price: 600000,
      stock: 100,
      category: 'MINUMAN',
      userId: user.id,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.create({
      data: p,
    });
    console.log(`Created Product: ${product.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });