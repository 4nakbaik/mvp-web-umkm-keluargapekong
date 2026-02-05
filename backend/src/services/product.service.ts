import prisma from '../config/database';

// Ubah fungsi createProductService menjadi seperti ini:
export const createProductService = async (data: any, userId: string) => {
  return await prisma.product.upsert({
    // 1. Cek, search produk berdasarkn nama
    where: {
      name: data.name, 
    },
    
    // 2. Kalo ada, Update datanye (Stok, Harga, Deskripsi, Gambar, etc)
    update: {
      description: data.description,
      price: data.price,
      stock: data.stock,
      category: data.category,
      imageUrl: data.imageUrl,
    },

    // 3. Kalo lost, Buat baru (Create)
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

// UPDATE
export const updateProductService = async (id: string, data: any) => {
  // Cek eksistensi dulu
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  return await prisma.product.update({
    where: { id },
    data: data,
  });
};

// DELETE
export const deleteProductService = async (id: string) => {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw new Error("Product not found");

  return await prisma.product.delete({ where: { id } });
};