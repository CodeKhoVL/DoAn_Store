import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import BookReservation from "@/lib/models/BookReservation";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { reservationId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();
    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    await connectToDB();

    const updatedReservation = await BookReservation.findByIdAndUpdate(
      params.reservationId,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedReservation) {
      return new NextResponse("Reservation not found", { status: 404 });
    }

    return NextResponse.json(updatedReservation);
  } catch (error) {
    console.error("[RESERVATION_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}