import prisma from '../config/database';

// GET ALL PRODUCTS 
export const getAllProductsService = async () => {
  return await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { name: true, email: true } 
      }
    }
  });
};

// GET PRODUCT BY ID
export const getProductByIdService = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true }
      }
    }
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

// CREATE PRODUCT
export const createProductService = async (data: any, userId: string) => {
  return await prisma.product.upsert({
    // 1. Cek berdasarkan nama 
    where: {
      name: data.name, 
    },
    
    // 2. Jika ada, update stok/harga/etc
    update: {
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      imageUrl: data.imageUrl,
    },

    // 3. Jika tdk ada, buat baru
    create: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      imageUrl: data.imageUrl,
      userId: userId,
    },
  });
};
// UPDATE PRODUCT
export const updateProductService = async (id: string, data: any) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  return await prisma.product.update({
    where: { id },
    data: data,
  });
};

// DELETE PRODUCT
export const deleteProductService = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  return await prisma.product.delete({ where: { id } });
};