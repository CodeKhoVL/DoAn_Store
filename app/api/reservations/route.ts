import { connectToDB } from "@/lib/mongoDB";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import BookReservation from "@/lib/models/BookReservation";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();
    
    const { productId, pickupDate, returnDate, note } = await req.json();
    
    if (!productId || !pickupDate || !returnDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const reservation = await BookReservation.create({
      userId,
      productId,
      reservationDate: new Date(),
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      note
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("[RESERVATION_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();
    
    const reservations = await BookReservation.find({ userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(reservations, { status: 200 });
  } catch (error) {
    console.error("[RESERVATION_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}