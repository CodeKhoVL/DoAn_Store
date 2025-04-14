"use client";

import { getProducts } from "@/lib/actions/actions";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import Loader from "./Loader";

export const revalidate = 0; // Add revalidation

const ProductList = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError("Failed to load products");
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-8 px-5">
        <p className="text-heading1-bold">Sản phẩm</p>
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-10 py-8 px-5">
      <p className="text-heading1-bold">Sản phẩm</p>
      {!products || products.length === 0 ? (
        <p className="text-body-bold">Không tìm thấy sản phẩm</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-16">
          {products.map((product: ProductType) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList;
