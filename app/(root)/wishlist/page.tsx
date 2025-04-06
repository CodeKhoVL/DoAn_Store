"use client";

import Loader from "@/components/Loader";
import ProductCard from "@/components/ProductCard";
import { getProductDetails } from "@/lib/actions/actions";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

const Wishlist = () => {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [signedInUser, setSignedInUser] = useState<UserType | null>(null);
  const [wishlist, setWishlist] = useState<ProductType[]>([]);

  const getUser = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      setSignedInUser(data);
    } catch (err) {
      console.error("[users_GET]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  const getWishlistProducts = async () => {
    setLoading(true);

    if (!signedInUser) {
      setLoading(false);
      return;
    }

    // Kiểm tra wishlist tồn tại và là array
    if (!signedInUser.wishlist || !Array.isArray(signedInUser.wishlist)) {
      setWishlist([]);
      setLoading(false);
      return;
    }

    try {
      const wishlistProducts = await Promise.all(
        signedInUser.wishlist.map(async (productId) => {
          try {
            const res = await getProductDetails(productId);
            return res;
          } catch (error) {
            console.error(`Error fetching product ${productId}:`, error);
            return null; // Trả về null nếu không lấy được sản phẩm
          }
        })
      );

      // Lọc bỏ các sản phẩm null hoặc undefined
      const validProducts = wishlistProducts.filter(
        (product): product is ProductType =>
          product !== null && product !== undefined
      );

      setWishlist(validProducts);
    } catch (err) {
      console.error("Error fetching wishlist products:", err);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (signedInUser) {
      getWishlistProducts();
    }
  }, [signedInUser]);

  const updateSignedInUser = (updatedUser: UserType) => {
    setSignedInUser(updatedUser);
  };

  return loading ? (
    <Loader />
  ) : (
    <div className="px-10 py-5">
      <p className="text-heading3-bold my-10">Yêu thích</p>
      {wishlist.length === 0 && <p>Không có sản phẩm nào</p>}

      <div className="flex flex-wrap justify-center gap-16">
        {wishlist.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            updateSignedInUser={updateSignedInUser}
          />
        ))}
      </div>
    </div>
  );
};

export const dynamic = "force-dynamic";

export default Wishlist;
