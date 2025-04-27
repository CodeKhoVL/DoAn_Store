"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { MinusCircle, PlusCircle } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

import useCart from "@/lib/hooks/useCart";
import HeartFavorite from "./HeartFavorite";

const ProductInfo = ({ productInfo }: { productInfo: ProductType }) => {
  const { getToken } = useAuth();
  const [selectedColor, setSelectedColor] = useState<string>(
    productInfo.colors[0]
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    productInfo.sizes[0]
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [note, setNote] = useState("");

  const cart = useCart();
  const router = useRouter();

  // Hàm xử lý giá tiền
  const formatPrice = (price: any) => {
    if (!price) return "0";

    if (
      typeof price === "object" &&
      price !== null &&
      "$numberDecimal" in price
    ) {
      return parseFloat(price.$numberDecimal).toLocaleString("vi-VN");
    }

    if (typeof price === "number") {
      return price.toLocaleString("vi-VN");
    }

    return String(price);
  };

  const handleBorrowRequest = () => {
    const user = localStorage.getItem("user"); // hoặc useSession nếu có auth
    if (!user) {
      router.push("/sign-in");
      return;
    }

    const currentItems = JSON.parse(
      localStorage.getItem("borrowItems") || "[]"
    );

    const isExisting = currentItems.some(
      (item: any) => item._id === productInfo._id
    );
    if (isExisting) {
      toast.error("Sách này đã có trong danh sách mượn");
      return;
    }

    const updatedItems = [...currentItems, productInfo];
    localStorage.setItem("borrowItems", JSON.stringify(updatedItems));

    toast.success("Đã thêm sách vào danh sách mượn");
    router.push("/borrow-request");
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: productInfo._id,
          pickupDate,
          returnDate,
          note,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      toast.success("Đặt sách thành công!");
      setShowReservationForm(false);

      // Force a hard navigation to ensure fresh data
      window.location.href = "/my_loans";
    } catch (error) {
      console.error("Error reserving book:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Đặt sách thất bại. Vui lòng thử lại!"
      );
    }
  };

  return (
    <div className="max-w-[400px] flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <p className="text-heading3-bold">{productInfo.title}</p>
        <HeartFavorite product={productInfo} />
      </div>

      <div className="flex gap-2">
        <p className="text-base-medium text-grey-2">Tác Giả:</p>
        <p className="text-base-bold">{productInfo.category}</p>
      </div>

      <p className="text-heading3-bold">{formatPrice(productInfo.price)} VNĐ</p>

      <div className="flex flex-col gap-2">
        <p className="text-base-medium text-grey-2">Description:</p>
        <p className="text-small-medium">{productInfo.description}</p>
      </div>

      {productInfo.colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-base-medium text-grey-2">Số tập: </p>
          <div className="flex gap-2">
            {productInfo.colors.map((color, index) => (
              <p
                key={index}
                className={`border border-black px-2 py-1 rounded-lg cursor-pointer ${
                  selectedColor === color && "bg-black text-white"
                }`}
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </p>
            ))}
          </div>
        </div>
      )}

      {productInfo.sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-base-medium text-grey-2">Số phần: </p>
          <div className="flex gap-2">
            {productInfo.sizes.map((size, index) => (
              <p
                key={index}
                className={`border border-black px-2 py-1 rounded-lg cursor-pointer ${
                  selectedSize === size && "bg-black text-white"
                }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <p className="text-base-medium text-grey-2">Số lượng:</p>
        <div className="flex gap-4 items-center">
          <MinusCircle
            className="hover:text-red-1 cursor-pointer"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
          />
          <p className="text-body-bold">{quantity}</p>
          <PlusCircle
            className="hover:text-red-1 cursor-pointer"
            onClick={() => setQuantity(quantity + 1)}
          />
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <button
          className="outline text-base-bold py-3 rounded-lg hover:bg-black hover:text-white flex-1"
          onClick={() =>
            cart.addItem({
              item: productInfo,
              quantity,
              color: selectedColor,
              size: selectedSize,
            })
          }
        >
          Thêm vào giỏ
        </button>

        <button
          className="outline text-base-bold py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex-1"
          onClick={() => setShowReservationForm(true)}
        >
          Đặt sách
        </button>
      </div>

      {showReservationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-heading4-bold mb-4">Đặt sách</h2>
            <form onSubmit={handleReservation} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày lấy sách
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ngày trả sách
                </label>
                <input
                  type="date"
                  required
                  min={pickupDate || new Date().toISOString().split("T")[0]}
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowReservationForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;
