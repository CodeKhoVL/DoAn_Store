"use client";

import Loader from "@/components/Loader";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";

interface ReservationWithProduct extends BookReservationType {
  product?: ProductType;
}

const MyLoans = () => {
  const { user } = useUser();
  const [reservations, setReservations] = useState<ReservationWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const getReservations = async () => {
    try {
      const response = await fetch("/api/reservations");
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      getReservations();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'completed':
        return 'Hoàn thành';
      default:
        return 'Chờ duyệt';
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
              className="border rounded-lg p-6 hover:bg-grey-1"
            >
              <div className="flex gap-6">
                {reservation.product && (
                  <div className="flex-shrink-0">
                    <Image
                      src={reservation.product.media[0]}
                      alt={reservation.product.title}
                      width={120}
                      height={160}
                      className="rounded-lg object-cover"
                    />
                  </div>
                )}
                
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      {reservation.product && (
                        <h2 className="text-heading4-bold mb-2">{reservation.product.title}</h2>
                      )}
                      <p className="text-small-medium text-grey-2">
                        Mã đặt sách: {reservation._id}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-full text-small-bold capitalize ${getStatusColor(reservation.status)}`}>
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <p className="text-small-medium">
                      <span className="text-grey-2">Ngày đặt:</span>{" "}
                      {format(new Date(reservation.reservationDate), "dd/MM/yyyy")}
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