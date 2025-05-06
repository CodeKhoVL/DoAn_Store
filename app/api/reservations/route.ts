import { connectToDB } from "@/lib/mongoDB";
import { auth, currentUser } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import BookReservation from "@/lib/models/BookReservation";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    await connectToDB();
    
    const { productId, pickupDate, returnDate, note } = await req.json();
    
    if (!productId || !pickupDate || !returnDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if the product exists
    const product = await Product.findById(productId);
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Check for existing reservations
    const existingReservation = await BookReservation.findOne({
      productId: new mongoose.Types.ObjectId(productId),
      status: { $in: ['pending', 'approved'] },
      $or: [
        {
          pickupDate: { $lte: new Date(returnDate) },
          returnDate: { $gte: new Date(pickupDate) }
        }
      ]
    });

    if (existingReservation) {
      return new NextResponse(
        "Sách này đã được đặt trong khoảng thời gian bạn chọn",
        { status: 409 }
      );
    }

    const reservation = await BookReservation.create({
      userId,
      productId: new mongoose.Types.ObjectId(productId),
      reservationDate: new Date(),
      pickupDate: new Date(pickupDate),
      returnDate: new Date(returnDate),
      status: 'pending',
      note
    });

    // Populate product data before sending webhook
    const populatedReservation = await BookReservation.findById(reservation._id)
      .populate('productId');

    // Send webhook to admin panel
    try {
      await fetch(`${process.env.NEXT_PUBLIC_ADMIN_URL}/api/webhooks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'reservation.created',
          data: {
            reservation: populatedReservation,
            userName: `${user.firstName} ${user.lastName}`,
            userEmail: user.emailAddresses[0]?.emailAddress
          }
        })
      });
    } catch (webhookError) {
      console.error("Failed to notify admin panel:", webhookError);
    }

    return NextResponse.json(populatedReservation, { status: 201 });
  } catch (error) {
    console.error("[RESERVATION_POST]", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to create reservation" }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await connectToDB();
    
    const reservations = await BookReservation.find({ userId })
      .populate({
        path: 'productId',
        model: Product,
        select: 'title media category price'
      })
      .sort({ createdAt: -1 });

    // Kiểm tra xem sách có tồn tại không
    const validReservations = reservations.filter(
      (reservation) => reservation.productId != null
    );

    // Format dữ liệu trả về
    const formattedReservations = validReservations.map(reservation => {
      const res = reservation.toObject();
      return {
        ...res,
        product: res.productId,
        productId: res.productId._id
      };
    });

    return NextResponse.json(formattedReservations, { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error("[RESERVATION_GET]", error);
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to fetch reservations",
        details: error instanceof Error ? error.message : "Unknown error"
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}