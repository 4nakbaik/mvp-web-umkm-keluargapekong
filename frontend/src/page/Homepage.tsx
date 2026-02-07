import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../service/api';

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
    <div>
      <Navbar />
      <ul>{loading ? '...Loading' : products.map((item) => <li>{item.name}/</li>)}</ul>
    </div>
  );
}
