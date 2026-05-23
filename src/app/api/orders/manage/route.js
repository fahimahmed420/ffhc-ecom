export const runtime = "nodejs";

import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

import clientPromise from "@/lib/mongodb";

// ======================================================
// VERIFY ADMIN
// ======================================================
async function verifyAdmin(req, db) {
  try {
    const email = req.headers.get("x-user-email");

    if (!email) {
      return {
        success: false,
        status: 401,
        message: "Unauthorized",
      };
    }

    const user = await db.collection("users").findOne({
      email,
    });

    if (!user || user.role !== "admin") {
      return {
        success: false,
        status: 403,
        message: "Admin access required",
      };
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    console.error("VERIFY ADMIN ERROR:", error);

    return {
      success: false,
      status: 500,
      message: "Authorization failed",
    };
  }
}

// ======================================================
// GET ADMIN ORDERS
// ======================================================
export async function GET(req) {
  try {
    const client = await clientPromise;

    const db = client.db("ecommerce");

    // ======================================================
    // VERIFY ADMIN
    // ======================================================
    const auth = await verifyAdmin(req, db);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        },
      );
    }

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    // ======================================================
    // GET SINGLE ORDER
    // ======================================================
    if (id) {
      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order ID",
          },
          {
            status: 400,
          },
        );
      }

      const order = await db.collection("orders").findOne({
        _id: new ObjectId(id),
      });

      if (!order) {
        return NextResponse.json(
          {
            success: false,
            message: "Order not found",
          },
          {
            status: 404,
          },
        );
      }

      return NextResponse.json({
        success: true,
        order,
      });
    }

    // ======================================================
    // GET ALL ORDERS
    // ======================================================
    const orders = await db
      .collection("orders")
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("GET ADMIN ORDERS ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// UPDATE ORDER
// ======================================================
export async function PATCH(req) {
  try {
    const client = await clientPromise;

    const db = client.db("ecommerce");

    // ======================================================
    // VERIFY ADMIN
    // ======================================================
    const auth = await verifyAdmin(req, db);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        },
      );
    }

    const body = await req.json();

    const { orderId, status, paymentStatus } = body;

    // ======================================================
    // VALIDATE ORDER ID
    // ======================================================
    if (!orderId || !ObjectId.isValid(orderId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        {
          status: 400,
        },
      );
    }

    const allowedStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    const allowedPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    const updateData = {
      updatedAt: new Date(),
    };

    // ======================================================
    // VALIDATE STATUS
    // ======================================================
    if (status) {
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid order status",
          },
          {
            status: 400,
          },
        );
      }

      updateData.status = status;
    }

    // ======================================================
    // VALIDATE PAYMENT STATUS
    // ======================================================
    if (paymentStatus) {
      if (
        !allowedPaymentStatuses.includes(
          paymentStatus,
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid payment status",
          },
          {
            status: 400,
          },
        );
      }

      updateData.paymentStatus =
        paymentStatus;
    }

    // ======================================================
    // UPDATE ORDER
    // ======================================================
    const result = await db
      .collection("orders")
      .updateOne(
        {
          _id: new ObjectId(orderId),
        },
        {
          $set: updateData,
        },
      );

    if (!result.matchedCount) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (err) {
    console.error("PATCH ORDER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}

// ======================================================
// DELETE ORDER
// ======================================================
export async function DELETE(req) {
  try {
    const client = await clientPromise;

    const db = client.db("ecommerce");

    // ======================================================
    // VERIFY ADMIN
    // ======================================================
    const auth = await verifyAdmin(req, db);

    if (!auth.success) {
      return NextResponse.json(
        {
          success: false,
          message: auth.message,
        },
        {
          status: auth.status,
        },
      );
    }

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    // ======================================================
    // VALIDATE ID
    // ======================================================
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        {
          status: 400,
        },
      );
    }

    // ======================================================
    // DELETE ORDER
    // ======================================================
    const result = await db
      .collection("orders")
      .deleteOne({
        _id: new ObjectId(id),
      });

    if (!result.deletedCount) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Server error",
      },
      {
        status: 500,
      },
    );
  }
}