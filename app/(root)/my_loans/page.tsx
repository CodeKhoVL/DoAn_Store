"use client";

import Loader from "@/components/Loader";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { format } from "date-fns";

const MyLoans = () => {
  const { user } = useUser();
  const [reservations, setReservations] = useState<BookReservationType[]>([]);
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

  if (!user) {
    return (
      <div className="px-10 py-5">
        <p className="text-heading3-bold my-10">Đăng nhập để xem đặt sách</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <div className="px-10 py-5">
      <h1 className="text-heading3-bold my-10">Sách đã đặt</h1>
      
      {reservations.length === 0 ? (
        <p className="text-body-bold">Bạn chưa đặt sách nào</p>
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((reservation) => (
            <div 
              key={reservation._id} 
              className="border rounded-lg p-4 hover:bg-grey-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-base-bold">Mã đặt sách: {reservation._id}</p>
                  <p className="text-small-medium">
                    Ngày đặt: {format(new Date(reservation.reservationDate), "dd/MM/yyyy")}
                  </p>
                  <p className="text-small-medium">
                    Ngày lấy sách: {format(new Date(reservation.pickupDate), "dd/MM/yyyy")}
                  </p>
                  <p className="text-small-medium">
                    Ngày trả: {format(new Date(reservation.returnDate), "dd/MM/yyyy")}
                  </p>
                  {reservation.note && (
                    <p className="text-small-medium">Ghi chú: {reservation.note}</p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-small-bold capitalize
                  ${reservation.status === 'approved' ? 'bg-green-100 text-green-800' :
                    reservation.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    reservation.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {reservation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyLoans;