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
      name: 'Kopi Esspresso Gula Jawa barat ke selatan barat',
      description: 'Kopi espresso impor dengan gula jawa yang penuh khasiat dengan rasa yang unix',
      price: 33000,
      stock: 13,
      category: 'MINUMAN',
      imageUrl:
        'https://imgs.search.brave.com/C2mo7G5-CCuT8rI7Y77LQcwTC_tRuqVdoW2Qu0CLqCM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMjIw/MDg5MjY1OC9waG90/by9jbG9zZS11cC1v/bi1hLWNvZmZlZS1t/YWtlci1tYWtpbmct/YS1lc3ByZXNzby53/ZWJwP2E9MSZiPTEm/cz02MTJ4NjEyJnc9/MCZrPTIwJmM9TXRs/Z0g5a0hkclVNNUpD/WXFITmxKUS1jbF84/dzZwenFMUlU3ajc1/TkNRZz0',
      userId: user.id,
    },
    {
      name: 'Nasi Kuching Khas Oleg timur ke barat libur',
      description:
        'Nasi Kucing yang dibakar dengan arang dari oleg, dengan aroma yang khas gas emisi',
      price: 20000,
      stock: 20,
      category: 'MAKANAN',
      imageUrl:
        'https://imgs.search.brave.com/2gHH3z3nNJB85hBCht_YehMzjYCK6UQdCjJHo_rMoJ4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90aHVt/YnMuZHJlYW1zdGlt/ZS5jb20vYi9uYXNp/LWFuZ2tyaW5nYW4t/bmFzaS1rdWNpbmct/aW5kb25lc2lhbi10/cmFkaXRpb25hbC1u/YXNpLWFuZ2tyaW5n/YW4tbmFzaS1rdWNp/bmctaW5kb25lc2lh/bi10cmFkaXRpb25h/bC1mb29kLWNlbnRy/YWwtamF2YS0xMjEz/MDczOTYuanBn',
      userId: user.id,
    },
    {
      name: 'Es Teh Manis Solo selamat berjuang sukses',
      description: 'Pria solo itu lagi, minum es teh manis ini biar nepotism berkurang',
      price: 600000,
      stock: 100,
      category: 'MINUMAN',
      imageUrl:
        'https://imgs.search.brave.com/uDxSpDC4iIgEV9IYblgU1WIrz2PLTlvyuSfoC9MiJqE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLmdv/amVrYXBpLmNvbS9k/YXJrcm9vbS9nb2Zv/b2QtaW5kb25lc2lh/L3YyL2ltYWdlcy91/cGxvYWRzLzYzYjM4/NWYzLTY1YjQtNDBl/ZC1iODQ2LTA4NTcw/NzZiMzcwNF9Hby1C/aXpfMjAyMjEwMjdf/MjAwNDU2LmpwZWc_/YXV0bz1mb3JtYXQ',
      userId: user.id,
    },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: {
        name: p.name,
        description: p.description,
        price: p.price,
        stock: p.stock,
        category: p.category,
        imageUrl: p.imageUrl,
        userId: user.id,
      },
    });
    console.log(`Created/Updated product: ${product.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
