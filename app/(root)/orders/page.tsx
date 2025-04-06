import { getOrders } from "@/lib/actions/actions";

import { auth } from "@clerk/nextjs";
import Image from "next/image";

// Định nghĩa type cho OrderItem
interface OrderItemType {
  product: {
    title: string;
    price: number;
    media: string[];
  };
  color?: string;
  size?: string;
  quantity: number;
}

// Định nghĩa type cho Order
interface OrderType {
  _id: string;
  totalAmount: number;
  products: OrderItemType[];
}

const Orders = async () => {
  const { userId } = auth();

  // Kiểm tra userId tồn tại
  if (!userId) {
    return (
      <div className="px-10 py-5 max-sm:px-3">
        <p className="text-heading3-bold my-10">
          Please sign in to view your orders
        </p>
      </div>
    );
  }

  const orders = await getOrders(userId as string);

  // Kiểm tra an toàn trước khi log
  if (orders && orders.length > 0) {
    console.log("First order products:", orders[0].products);
  } else {
    console.log("No orders found");
  }

  return (
    <div className="px-10 py-5 max-sm:px-3">
      <p className="text-heading3-bold my-10">Your Orders</p>

      {(!orders || orders.length === 0) && (
        <p className="text-body-bold my-5">You have no orders yet.</p>
      )}

      <div className="flex flex-col gap-10">
        {orders?.map((order: OrderType) => (
          <div
            key={order._id}
            className="flex flex-col gap-8 p-4 hover:bg-grey-1"
          >
            <div className="flex gap-20 max-md:flex-col max-md:gap-3">
              <p className="text-base-bold">Order ID: {order._id}</p>
              <p className="text-base-bold">
                Total Amount: ${order.totalAmount}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {order.products &&
                order.products.map((orderItem: OrderItemType, index) => (
                  <div key={index} className="flex gap-4">
                    {orderItem.product &&
                    orderItem.product.media &&
                    orderItem.product.media.length > 0 ? (
                      <Image
                        src={orderItem.product.media[0]}
                        alt={orderItem.product.title}
                        width={100}
                        height={100}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                        No image
                      </div>
                    )}

                    <div className="flex flex-col justify-between">
                      <p className="text-small-medium">
                        Title:{" "}
                        <span className="text-small-bold">
                          {orderItem.product?.title || "N/A"}
                        </span>
                      </p>
                      {orderItem.color && (
                        <p className="text-small-medium">
                          Color:{" "}
                          <span className="text-small-bold">
                            {orderItem.color}
                          </span>
                        </p>
                      )}
                      {orderItem.size && (
                        <p className="text-small-medium">
                          Size:{" "}
                          <span className="text-small-bold">
                            {orderItem.size}
                          </span>
                        </p>
                      )}
                      <p className="text-small-medium">
                        Unit price:{" "}
                        <span className="text-small-bold">
                          {orderItem.product?.price || "N/A"}
                        </span>
                      </p>
                      <p className="text-small-medium">
                        Quantity:{" "}
                        <span className="text-small-bold">
                          {orderItem.quantity}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

export const dynamic = "force-dynamic";
