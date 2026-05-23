import QRCode from "qrcode";

export async function generateInvoiceHTML(order) {
  // ======================================
  // QR CODE
  // ======================================
  const qrData = await QRCode.toDataURL(
    JSON.stringify({
      orderId: order.orderId,
      total: order.total,
      email: order.customer?.email,
    }),
  );

  // ======================================
  // ITEMS HTML
  // ======================================
  const itemsHTML = (order.items || [])
    .map((item, idx) => {
      const qty = Number(item.qty || 1);

      const price = Number(item.price || 0);

      const total = Number(
        item.total || price * qty,
      );

      return `
        <tr>
          <td>${idx + 1}</td>

          <td class="product">
            ${item.title || "Product"}
          </td>

          <td class="center">
            ${qty}
          </td>

          <td class="right">
            ৳${price.toFixed(2)}
          </td>

          <td class="right total">
            ৳${total.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  // ======================================
  // RETURN HTML
  // ======================================
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

        @page {
          size: A4;
          margin: 16mm;
        }

        body {
          margin: 0;
          padding: 0;
          background: white;
          color: #111827;
          font-family: Arial, sans-serif;
          line-height: 1.5;
        }

        .invoice {
          width: 100%;
          max-width: 820px;
          margin: auto;
        }

        /* ===================== */
        /* HEADER */
        /* ===================== */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #2563eb;
          padding-bottom: 20px;
          margin-bottom: 28px;
        }

        .brand {
          font-size: 34px;
          font-weight: 800;
          color: #2563eb;
          line-height: 1.1;
        }

        .subtitle {
          color: #6b7280;
          margin-top: 6px;
          font-size: 14px;
        }

        .invoice-meta {
          text-align: right;
        }

        .invoice-title {
          font-size: 28px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .badge {
          display: inline-block;
          background: #111827;
          color: white;
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 12px;
          margin-top: 12px;
        }

        /* ===================== */
        /* INFO */
        /* ===================== */
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 28px;
        }

        .info-box {
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 20px;
        }

        .info-box h3 {
          margin: 0 0 14px;
          font-size: 18px;
        }

        .info-box p {
          margin: 6px 0;
          font-size: 14px;
          color: #374151;
        }

        /* ===================== */
        /* TABLE */
        /* ===================== */
        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #2563eb;
          color: white;
        }

        th {
          padding: 16px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
        }

        td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 14px;
          vertical-align: top;
        }

        tbody tr:nth-child(even) {
          background: #fafafa;
        }

        .center {
          text-align: center;
        }

        .right {
          text-align: right;
        }

        .product {
          width: 42%;
          font-weight: 500;
        }

        .total {
          font-weight: bold;
        }

        /* ===================== */
        /* SUMMARY */
        /* ===================== */
        .summary {
          width: 360px;
          margin-left: auto;
          margin-top: 28px;
        }

        .summary table td {
          border: none;
          padding: 10px 0;
          font-size: 15px;
        }

        .grand-total td {
          border-top: 2px solid #111827 !important;
          padding-top: 18px !important;
          font-size: 24px !important;
          font-weight: bold;
        }

        /* ===================== */
        /* QR */
        /* ===================== */
        .bottom {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 36px;
        }

        .qr img {
          width: 120px;
          height: 120px;
        }

        .qr p {
          margin-bottom: 10px;
          font-size: 13px;
          color: #6b7280;
        }

        /* ===================== */
        /* FOOTER */
        /* ===================== */
        .footer {
          text-align: right;
          font-size: 13px;
          color: #6b7280;
          max-width: 320px;
        }

        .footer p {
          margin: 5px 0;
        }

        /* ===================== */
        /* PRINT */
        /* ===================== */
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .invoice {
            max-width: 100%;
          }
        }
      </style>
    </head>

    <body>
      <div class="invoice">

        <!-- HEADER -->
        <div class="header">
          <div>
            <div class="brand">
              Family Fashion Hub
            </div>

            <div class="subtitle">
              China Store Invoice
            </div>
          </div>

          <div class="invoice-meta">
            <div class="invoice-title">
              INVOICE
            </div>

            <div>
              <strong>Order ID:</strong>
              ${order.orderId || "N/A"}
            </div>

            <div style="margin-top:8px;">
              ${new Date(
                order.createdAt,
              ).toLocaleDateString()}
            </div>

            <div class="badge">
              ${order.paymentMethod || "COD"}
            </div>
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

              <th>
                Product
              </th>

              <th class="center">
                Qty
              </th>

              <th class="right">
                Unit Price
              </th>

              <th class="right">
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

              <td class="right">
                ৳${Number(
                  order.subtotal || 0,
                ).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>
                Shipping
              </td>

              <td class="right">
                ৳${Number(
                  order.shipping || 0,
                ).toFixed(2)}
              </td>
            </tr>

            <tr>
              <td>
                Discount
              </td>

              <td
                class="right"
                style="color:green;"
              >
                -৳${Number(
                  order.discount || 0,
                ).toFixed(2)}
              </td>
            </tr>

            <tr class="grand-total">
              <td>
                Grand Total
              </td>

              <td class="right">
                ৳${Number(
                  order.total || 0,
                ).toFixed(2)}
              </td>
            </tr>
          </table>
        </div>

        <!-- BOTTOM -->
        <div class="bottom">

          <div class="qr">
            <p>
              Scan to verify order
            </p>

            <img src="${qrData}" />
          </div>

          <div class="footer">
            <p>
              Cash on Delivery
            </p>

            <p>
              Thank you for shopping with us ❤️
            </p>

            <p>
              This invoice was generated automatically.
            </p>
          </div>

        </div>

      </div>
    </body>
  </html>
  `;
}