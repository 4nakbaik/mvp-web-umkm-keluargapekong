import prisma from '../config/database';

// 1. CREATE CUSTOMER
export const createCustomerService = async (data: any) => {
  // Cek dupe No HP 
  if (data.phone) {
    const existing = await prisma.customer.findFirst({
      where: { phone: data.phone }
    });
    if (existing) {
      throw new Error("Nomor HP sudah terdaftar sebagai member");
    }
  }

  return await prisma.customer.create({
    data: {
      name: data.name,
      phone: data.phone,
      address: data.address
    }
  });
};

// 2. UPDATE CUSTOMER
export const updateCustomerService = async (id: string, data: any) => {
  // Cek apakah cust ada?
  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) throw new Error("Customer not found");

  // Jika user mau ganti No HP, cek dulu nih apakah No HP baru itu milik dia bukan(udah da di DB)
  if (data.phone && data.phone !== existing.phone) {
    const phoneTaken = await prisma.customer.findFirst({
      where: { phone: data.phone }
    });
    if (phoneTaken) throw new Error("Nomor HP sudah digunakan member lain");
  }

  return await prisma.customer.update({
    where: { id },
    data: data
  });
};

// 3. GET ALL 
export const getAllCustomersService = async () => {
  return await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } } 
  });
};