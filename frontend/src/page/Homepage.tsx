import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../service/api';
import { Card } from '../components/Card';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  imageUrl: string | null;
  createdAt: string;
}

export default function Homepage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts();
      setProducts(res.data || []);
    } catch (error) {
      console.error('Error fetching Product', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Main Content */}
      <main className="max-w-full mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Produk Kami</h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-500">Loading...</div>
          </div>
        ) : products.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-500">Belum ada produk</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-4 gap-6 justify-items-center">
            {products.map((product) => (
              <Card
                key={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                imageUrl={product.imageUrl}
                category={product.category}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
