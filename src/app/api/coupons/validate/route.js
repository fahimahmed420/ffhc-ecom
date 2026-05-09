app.post("/api/coupons/validate", async (req, res) => {
  const { code, items } = req.body;

  const coupon = await db.collection("coupons").findOne({
    code: code.toUpperCase(),
  });

  if (!coupon || !coupon.isActive) {
    return res.status(400).json({ error: "Invalid coupon" });
  }

  if (new Date() > new Date(coupon.expiryDate)) {
    return res.status(400).json({ error: "Coupon expired" });
  }

  //  total
  let cartTotal = 0;

  for (const item of items) {
    const product = await db.collection("products").findOne({
      _id: new ObjectId(item._id),
    });

    if (!product) continue;

    const price =
      product.discountPrice > 0 ? product.discountPrice : product.price;

    cartTotal += price * item.qty;
  }

  if (cartTotal < coupon.minPurchase) {
    return res.status(400).json({ error: "Minimum purchase not met" });
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ error: "Coupon usage limit reached" });
  }

  let discount = 0;

  if (coupon.discountType === "percentage") {
    discount = (cartTotal * coupon.discountValue) / 100;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.discountValue;
  }

  discount = Math.min(discount, cartTotal);

  res.json({ discount });
});