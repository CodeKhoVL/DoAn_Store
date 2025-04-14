"use client";

import Loader from "@/components/Loader";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface ReservationWithProduct extends BookReservationType {
  product: ProductType;
}

const MyLoans = () => {
  const { user } = useUser();
  const [reservations, setReservations] = useState<ReservationWithProduct[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/reservations");

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch reservations");
      }

      const data = await response.json();
      console.log("Fetched reservations:", data);
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load reservations"
      );
      toast.error("Could not load your reservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getReservations();
    }
  }, [user]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (!user) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading3-bold my-10">Đăng nhập để xem sách đã đặt</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="px-10 py-5">
        <h1 className="text-heading3-bold my-10">Sách đã đặt</h1>
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="px-10 py-5">
      <h1 className="text-heading3-bold my-10">Sách đã đặt</h1>

      {reservations.length === 0 ? (
        <div className="text-center">
          <p className="text-body-bold mb-4">Bạn chưa đặt sách nào</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tìm sách
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((reservation) => (
            <div
              key={reservation._id}
              className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 items-start">
                <div className="w-32 h-32 relative rounded-lg overflow-hidden">
                  <Image
                    src={reservation.product.media[0]}
                    alt={reservation.product.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        {reservation.product.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {reservation.product.category}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeColor(
                        reservation.status
                      )}`}
                    >
                      {reservation.status === "pending"
                        ? "Chờ duyệt"
                        : reservation.status === "approved"
                        ? "Đã duyệt"
                        : reservation.status === "rejected"
                        ? "Từ chối"
                        : "Hoàn thành"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <p className="text-small-medium">
                      <span className="text-grey-2">Ngày đặt:</span>{" "}
                      {format(
                        new Date(reservation.reservationDate),
                        "dd/MM/yyyy"
                      )}
                    </p>
                    <p className="text-small-medium">
                      <span className="text-grey-2">Ngày lấy sách:</span>{" "}
                      {format(new Date(reservation.pickupDate), "dd/MM/yyyy")}
                    </p>
                    <p className="text-small-medium">
                      <span className="text-grey-2">Ngày trả:</span>{" "}
                      {format(new Date(reservation.returnDate), "dd/MM/yyyy")}
                    </p>
                  </div>

                  {reservation.note && (
                    <div className="mt-2">
                      <p className="text-small-medium">
                        <span className="text-grey-2">Ghi chú:</span>{" "}
                        {reservation.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans;
