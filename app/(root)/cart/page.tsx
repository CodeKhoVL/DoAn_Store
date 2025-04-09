"use client";

import useCart from "@/lib/hooks/useCart";
import { formatPrice, formatPriceDisplay } from "@/lib/utils/format";

import { useUser } from "@clerk/nextjs";
import { MinusCircle, PlusCircle, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const Cart = () => {
  const router = useRouter();
  const { user } = useUser();
  const cart = useCart();

  const total = cart.cartItems.reduce(
    (acc, cartItem) =>
      acc + formatPrice(cartItem.item.price) * cartItem.quantity,
    0
  );
  const totalRounded = parseFloat(total.toFixed(2));

  const customer = {
    clerkId: user?.id,
    email: user?.emailAddresses[0]?.emailAddress,
    name: user?.fullName,
  };

  const handleCheckout = async () => {
    try {
      if (!user) {
        router.push("/sign-in");
        return;
      }

      const preparedCartItems = cart.cartItems.map((cartItem) => ({
        ...cartItem,
        item: {
          ...cartItem.item,
          price: formatPrice(cartItem.item.price), // Ép giá về number
        },
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems: preparedCartItems, customer }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Lỗi thanh toán (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      if (!data.url) {
        throw new Error("Không nhận được URL thanh toán");
      }

      window.location.href = data.url;
    } catch (err: unknown) {
      console.error("[checkout_POST]", err);
      alert(
        `Thanh toán thất bại: ${
          err instanceof Error ? err.message : "Lỗi không xác định"
        }`
      );
    }
  };

  return (
    <div className="flex gap-20 py-16 px-10 max-lg:flex-col max-sm:px-3">
      <div className="w-2/3 max-lg:w-full">
        <p className="text-heading3-bold">Giỏ hàng</p>
        <hr className="my-6" />

        {cart.cartItems.length === 0 ? (
          <p className="text-body-bold">Không có sản phẩm nào</p>
        ) : (
          <div>
            {cart.cartItems.map((cartItem) => (
              <div
                className="w-full flex max-sm:flex-col max-sm:gap-3 hover:bg-grey-1 px-4 py-3 items-center max-sm:items-start justify-between"
                key={cartItem.item._id}
              >
                <div className="flex items-center">
                  <Image
                    src={cartItem.item.media[0]}
                    width={100}
                    height={100}
                    className="rounded-lg w-32 h-32 object-cover"
                    alt="product"
                  />
                  <div className="flex flex-col gap-3 ml-4">
                    <p className="text-body-bold">{cartItem.item.title}</p>
                    {cartItem.color && (
                      <p className="text-small-medium">{cartItem.color}</p>
                    )}
                    {cartItem.size && (
                      <p className="text-small-medium">{cartItem.size}</p>
                    )}
                    <p className="text-small-medium">
                      {formatPriceDisplay(cartItem.item.price)} VNĐ
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                  <MinusCircle
                    className="hover:text-red-1 cursor-pointer"
                    onClick={() => cart.decreaseQuantity(cartItem.item._id)}
                  />
                  <p className="text-body-bold">{cartItem.quantity}</p>
                  <PlusCircle
                    className="hover:text-red-1 cursor-pointer"
                    onClick={() => cart.increaseQuantity(cartItem.item._id)}
                  />
                </div>

                <Trash
                  className="hover:text-red-1 cursor-pointer"
                  onClick={() => cart.removeItem(cartItem.item._id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-1/3 max-lg:w-full flex flex-col gap-8 bg-grey-1 rounded-lg px-4 py-5">
        <p className="text-heading4-bold pb-4">
          Tóm tắt{" "}
          <span>{`(${cart.cartItems.length} ${
            cart.cartItems.length > 1 ? "items" : "item"
          })`}</span>
        </p>
        <div className="flex justify-between text-body-semibold">
          <span>Tổng số tiền: </span>
          <span> {totalRounded.toLocaleString("vi-VN")} VNĐ</span>
        </div>
        <button
          className="border rounded-lg text-body-bold bg-white py-3 w-full hover:bg-black hover:text-white"
          onClick={handleCheckout}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;
