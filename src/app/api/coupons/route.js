app.post("/api/coupons", async (req, res) => {
  const data = req.body;

  if (!data.code || !data.discountValue) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const existing = await db.collection("coupons").findOne({
    code: data.code.toUpperCase(),
  });

  if (existing) {
    return res.status(400).json({ error: "Coupon already exists" });
  }

  await db.collection("coupons").insertOne({
    ...data,
    code: data.code.toUpperCase(),
    discountValue: Number(data.discountValue),
    minPurchase: Number(data.minPurchase) || 0,
    maxDiscount: Number(data.maxDiscount) || null,
    isActive: true,
    createdAt: new Date(),
  });

  res.json({ success: true });
});