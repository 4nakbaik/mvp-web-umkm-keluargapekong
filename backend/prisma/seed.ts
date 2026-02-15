import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start Seeding.....');

  // Hash password 
  const password = await bcrypt.hash('admin123', 12);

  // 1. Seed User (Admin)
  const admin = await prisma.user.upsert({
    where: { email: 'noreply@pekongfam.com' },
    update: {},
    create: {
      email: 'noreply@pekongfam.com',
      name: 'Nur Cholis',
      password: password,
      role: 'ADMIN',
    },
  });
  console.log(`Admin Created: ${admin.email}`);

  // 2. Seed User (Staff/Kasir)
  const staff = await prisma.user.upsert({
    where: { email: 'kasir@pekongfam.com' },
    update: {},
    create: {
      email: 'Bungadwisari@gmail.com',
      name: 'Bunga Dwi Sari',
      password: 'akucantikbangets',
      role: 'STAFF',
    },
  });
  console.log(`Staff Created: ${staff.email}`);

  // 3. Seed Customer ----> Staff/Kasir
  const customers = [
    {
      name: 'Budi',
      email: 'budinasgortasik99@gmail.com',
      phone: '08123456789',
      isMember: true,
    },
    {
      name: 'Joe',
      email: 'jujumissenglish1@yahoo.com',
      phone: '08987654321',
      isMember: false,
    }
  ];

  for (const c of customers) {
    await prisma.customer.upsert({
      where: { phone: c.phone },
      update: { 
        isMember: c.isMember,
        registeredById: staff.id 
      },
      create: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        isMember: c.isMember,
        registeredById: staff.id 
      },
    });
  }
  console.log('Customers Created');

  // 4. Seed Produk ----> Admin
  const products = [
    {
      name: 'Kopi Esspresso Gula Jawa',
      description: 'Kopi espresso impor dengan gula jawa yang penuh khasiat',
      price: 33000,
      stock: 13,
      category: 'MINUMAN' as any,
      imageUrl: 'https://www.aeki-aice.org/wp-content/uploads/2025/06/Kenikmatan-Kopi-Jawa.webp', 
      imagePath: null, 
      userId: admin.id, 
    },
    {
      name: 'Nasi Kuching Bakar',
      description: 'Nasi Kucing bakar aroma khas gas emisi oleg',
      price: 20000,
      stock: 20,
      category: 'MAKANAN' as any,
      imageUrl: 'https://asset.kompas.com/crops/zs9uHCjNem3Ky63OOWVJ8UODJwI=/0x53:1280x906/750x500/data/photo/2022/01/21/61ea529b006d9.jpg',
      imagePath: null, 
      userId: admin.id,
    },
    {
      name: 'Es Teh Manis Solo',
      description: 'Pria solo itu lagi, minum es teh manis ini biar nepotisme berkurang',
      price: 78000,
      stock: 6,
      category: 'MINUMAN' as any,
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdo1HoWoNCVbRCMqP3YAEq2fUae51O5XL3bg&s',
      imagePath: null,
      userId: admin.id,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: {
        imageUrl: p.imageUrl,
        imagePath: p.imagePath,
      },
      create: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        imageUrl: p.imageUrl,
        imagePath: p.imagePath,
        userId: admin.id 
      },
    });
  }
  console.log('Products Created');
  console.log('Seeding Finished');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });