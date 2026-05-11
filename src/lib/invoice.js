import QRCode from "qrcode";

export async function generateInvoiceHTML(order) {
  // ===============================
  // QR CODE
  // ===============================
  const qrData = await QRCode.toDataURL(
    JSON.stringify({
      orderId: order.orderId,
      total: order.total,
      email: order.customer?.email,
    })
  );

  // ===============================
  // ITEMS HTML
  // ===============================
  const itemsHTML = (order.items || [])
    .map((item, idx) => {
      const qty = Number(item.qty || 1);

      const price = Number(item.price || 0);

      const total = Number(item.total || price * qty);

      return `
        <tr>
          <td>${idx + 1}</td>

          <td>
            ${item.title || "Product"}
          </td>

          <td style="text-align:center;">
            ${qty}
          </td>

          <td style="text-align:right;">
            ৳${price.toFixed(2)}
          </td>

          <td style="text-align:right;font-weight:bold;">
            ৳${total.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  // ===============================
  // RETURN HTML
  // ===============================
  return `
  <!DOCTYPE html>

  <html>
    <head>
      <meta charset="UTF-8" />

      <title>
        Invoice - ${order.orderId}
      </title>

      <style>
        * {
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #111;
          background: #fff;
        }

        h1,h2,h3,h4,h5,h6,p {
          margin: 0;
        }

        .header {
          text-align: center;
          border-bottom: 3px solid #0C6AED;
          padding-bottom: 20px;
          margin-bottom: 35px;
        }

        .brand {
          font-size: 34px;
          font-weight: bold;
          color: #0C6AED;
          margin-bottom: 8px;
        }

        .invoice-title {
          font-size: 20px;
          font-weight: bold;
          margin-top: 10px;
        }

        .muted {
          color: #666;
          font-size: 14px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
        }

        .info-box {
          border: 1px solid #eee;
          border-radius: 14px;
          padding: 20px;
        }

        .info-box h3 {
          margin-bottom: 15px;
          font-size: 18px;
        }

        .info-box p {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          overflow: hidden;
          border-radius: 14px;
        }

        thead {
          background: #0C6AED;
          color: white;
        }

        th {
          padding: 14px;
          text-align: left;
          font-size: 14px;
        }

        td {
          padding: 14px;
          border-bottom: 1px solid #eee;
          font-size: 14px;
        }

        tbody tr:nth-child(even) {
          background: #fafafa;
        }

        .summary {
          width: 340px;
          margin-left: auto;
          margin-top: 30px;
        }

        .summary table td {
          border: none;
          padding: 10px 0;
        }

        .grand-total td {
          border-top: 2px solid #111 !important;
          padding-top: 18px !important;
          font-size: 24px;
          font-weight: bold;
        }

        .green {
          color: green;
        }

        .qr {
          text-align: center;
          margin-top: 50px;
        }

        .qr img {
          margin-top: 10px;
        }

        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 13px;
          color: #777;
        }

        .badge {
          display: inline-block;
          background: #111;
          color: white;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 12px;
          margin-top: 10px;
        }
      </style>
    </head>

    <body>
      <!-- HEADER -->
      <div class="header">
        <div class="brand">
          Family Fashion Hub China Store
        </div>

        <div class="invoice-title">
          INVOICE
        </div>

        <p class="muted" style="margin-top:10px;">
          Order ID:
          <strong>${order.orderId || "N/A"}</strong>
        </p>

        <div class="badge">
          ${order.paymentMethod || "COD"}
        </div>
      </div>

      <!-- CUSTOMER -->
      <div class="info-grid">
        <div class="info-box">
          <h3>
            Customer Information
          </h3>

          <p>
            <strong>Name:</strong>
            ${order.customer?.name || "N/A"}
          </p>

          <p>
            <strong>Phone:</strong>
            ${order.customer?.phone || "N/A"}
          </p>

          <p>
            <strong>Email:</strong>
            ${order.customer?.email || "N/A"}
          </p>
        </div>

        <div class="info-box">
          <h3>
            Shipping Address
          </h3>

          <p>
            ${order.customer?.address || ""}
          </p>

          <p>
            ${order.customer?.unionName || ""}
            ${order.customer?.upazilaName || ""}
          </p>

          <p>
            ${order.customer?.districtName || ""}
            ${order.customer?.divisionName || ""}
          </p>
        </div>
      </div>

      <!-- PRODUCTS -->
      <table>
        <thead>
          <tr>
            <th>#</th>

            <th>Product</th>

            <th style="text-align:center;">
              Qty
            </th>

            <th style="text-align:right;">
              Unit Price
            </th>

            <th style="text-align:right;">
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- SUMMARY -->
      <div class="summary">
        <table>
          <tr>
            <td>
              Subtotal
            </td>

            <td style="text-align:right;">
              ৳${Number(order.subtotal || 0).toFixed(2)}
            </td>
          </tr>

          <tr>
            <td>
              Shipping
            </td>

            <td style="text-align:right;">
              ৳${Number(order.shipping || 0).toFixed(2)}
            </td>
          </tr>

          <tr>
            <td>
              Discount
            </td>

            <td
              style="
                text-align:right;
                color:green;
              "
            >
              -৳${Number(order.discount || 0).toFixed(2)}
            </td>
          </tr>

          <tr class="grand-total">
            <td>
              Grand Total
            </td>

            <td style="text-align:right;">
              ৳${Number(order.total || 0).toFixed(2)}
            </td>
          </tr>
        </table>
      </div>

      <!-- QR -->
      <div class="qr">
        <p>
          Scan to verify order
        </p>

        <img
          src="${qrData}"
          width="130"
          height="130"
        />
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <p>
          Cash on Delivery | Thank you for shopping with us ❤️
        </p>

        <p style="margin-top:8px;">
          This invoice was generated automatically.
        </p>
      </div>
    </body>
  </html>
  `;
}