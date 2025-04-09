"use client";

import { useUser } from "@clerk/nextjs";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface HeartFavoriteProps {
  product: ProductType;
  updateSignedInUser?: (updatedUser: UserType) => void;
}

const HeartFavorite = ({ product, updateSignedInUser }: HeartFavoriteProps) => {
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const getUser = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();

      if (res.ok && data.wishlist && Array.isArray(data.wishlist)) {
        setIsLiked(data.wishlist.includes(product._id));
      } else {
        console.warn("User không có wishlist hoặc chưa đăng nhập.");
      }
    } catch (err) {
      console.log("[users_GET]", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

  const handleLike = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    try {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      const res = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product._id }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("[wishlist_POST]", errorText);
        return;
      }

      const updatedUser = await res.json();

      setIsLiked(updatedUser.wishlist.includes(product._id));
      updateSignedInUser && updateSignedInUser(updatedUser);
    } catch (err) {
      console.log("[wishlist_POST]", err);
    }
  };

  return (
    <button onClick={handleLike}>
      <Heart fill={`${isLiked ? "red" : "white"}`} />
    </button>
  );
};

export default HeartFavorite;
