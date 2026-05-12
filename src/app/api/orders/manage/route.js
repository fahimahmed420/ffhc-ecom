export const runtime = "nodejs";

import { ObjectId } from "mongodb";

import clientPromise from "@/lib/mongodb";

// ======================================
// GET ORDERS
// ======================================
export async function GET(req) {
  try {
    const client = await clientPromise;

    const db = client.db("ecommerce");

    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    const email = searchParams.get("email");

    const admin = searchParams.get("admin");

    // ======================================
    // SINGLE ORDER
    // ======================================
    if (id) {
      if (!ObjectId.isValid(id)) {
        return Response.json(
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
        return Response.json(
          {
            success: false,
            message: "Order not found",
          },
          {
            status: 404,
          },
        );
      }

      return Response.json({
        success: true,
        order,
      });
    }

    // ======================================
    // ADMIN - GET ALL ORDERS
    // ======================================
    if (admin === "true") {
      const orders = await db
        .collection("orders")
        .find({})
        .sort({
          createdAt: -1,
        })
        .toArray();

      return Response.json({
        success: true,
        orders,
      });
    }

    // ======================================
    // USER - GET OWN ORDERS
    // ======================================
    if (email) {
      const orders = await db
        .collection("orders")
        .find({
          "customer.email": email,
        })
        .sort({
          createdAt: -1,
        })
        .toArray();

      return Response.json({
        success: true,
        orders,
      });
    }

    // ======================================
    // BLOCK UNAUTHORIZED ACCESS
    // ======================================
    return Response.json(
      {
        success: false,
        message: "Unauthorized access",
      },
      {
        status: 401,
      },
    );
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);

    return Response.json(
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

// ======================================
// UPDATE ORDER (STATUS / PAYMENT)
// ======================================
export async function PATCH(req) {
  try {
    const body = await req.json();

    const { orderId, status, paymentStatus } = body;

    if (!orderId || !ObjectId.isValid(orderId)) {
      return Response.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        {
          status: 400,
        },
      );
    }

    const client = await clientPromise;

    const db = client.db("ecommerce");

    const updateData = {
      updatedAt: new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }

    const result = await db.collection("orders").updateOne(
      {
        _id: new ObjectId(orderId),
      },
      {
        $set: updateData,
      },
    );

    if (!result.matchedCount) {
      return Response.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (err) {
    console.error("UPDATE ORDER ERROR:", err);

    return Response.json(
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

// ======================================
// DELETE ORDER
// ======================================
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);

    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return Response.json(
        {
          success: false,
          message: "Invalid order ID",
        },
        {
          status: 400,
        },
      );
    }

    const client = await clientPromise;

    const db = client.db("ecommerce");

    const result = await db.collection("orders").deleteOne({
      _id: new ObjectId(id),
    });

    if (!result.deletedCount) {
      return Response.json(
        {
          success: false,
          message: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error("DELETE ORDER ERROR:", err);

    return Response.json(
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