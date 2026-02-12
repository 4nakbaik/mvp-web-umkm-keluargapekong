import prisma from '../config/database';

// 1. CREATE CUSTOMER
export const createCustomerService = async (data: any) => {
  // Cek dupe No HP
  if (data.phone) {
    const existingPhone = await prisma.customer.findFirst({
      where: { phone: data.phone },
    });
    if (existingPhone) {
      throw new Error('Nomor HP sudah terdaftar sebagai member');
    }
  }

  // Cek dupe Email
  if (data.email) {
    const existingEmail = await prisma.customer.findUnique({
      where: { email: data.email }, // Bisa pakai findUnique karena di schema sudah @unique
    });
    if (existingEmail) {
      throw new Error('Email sudah terdaftar');
    }
  }

  return await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email, // <--- Masukkan email ke database
      address: data.address,
    },
  });
};

// 2. UPDATE CUSTOMER
export const updateCustomerService = async (id: string, data: any) => {
  // Cek apakah cust ada?
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new Error('Customer not found');

  // Validasi No HP (kalo berubah & sudah dipakai orang lain)
  if (data.phone && data.phone !== existing.phone) {
    const phoneTaken = await prisma.customer.findFirst({
      where: { phone: data.phone },
    });
    if (phoneTaken) throw new Error('Nomor HP sudah digunakan member lain');
  }

  // Validasi Email
  if (data.email && data.email !== existing.email) {
    const emailTaken = await prisma.customer.findUnique({
      where: { email: data.email },
    });
    if (emailTaken) throw new Error('Email sudah digunakan member lain');
  }

  return await prisma.customer.update({
    where: { id },
    data: data,
  });
};

// 3. GET ALL
export const getAllCustomersService = async () => {
  return await prisma.customer.findMany({
    where: { isMember: true },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  });
};
