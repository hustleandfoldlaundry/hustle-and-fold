const {
  onDocumentCreated,
  onDocumentUpdated
} = require("firebase-functions/v2/firestore");

const {
  defineSecret
} = require("firebase-functions/params");

const logger = require("firebase-functions/logger");

const {Resend} = require("resend");

const resendApiKey = defineSecret("RESEND_API_KEY");

exports.sendNewOrderEmail = onDocumentCreated(
  {
    document: "orders/{orderDocumentId}",
    secrets: [resendApiKey],
    maxInstances: 10
  },
  async (event) => {
    const order = event.data?.data();

    if (!order) {
      logger.error("New order data was unavailable.");
      return;
    }

    const resend = new Resend(resendApiKey.value());

    const orderNumber =
      order.orderId || event.params.orderDocumentId;

    const customerName =
      order.name || "Not provided";

    const customerEmail =
      order.email || "Not provided";

    const customerPhone =
      order.phone || "Not provided";

    const pickupDate =
      order.pickupDate || "Not provided";

    const pickupTime =
      order.pickupTime || "Not provided";

    const estimatedDelivery =
      order.estimatedDelivery || "Not provided";

    const orderTotal = Number(
      order.grandTotal || 0
    ).toFixed(2);

    try {
      const {data, error} = await resend.emails.send({
        from: "Hustle & Fold <onboarding@resend.dev>",
        to: ["hustleandfoldlaundry@gmail.com"],
        subject: `New Order Received: ${orderNumber}`,
        html: `
          <h1>New Hustle & Fold Order</h1>

          <p>
            A new household order has been submitted.
          </p>

          <h2>Order Details</h2>

          <p><strong>Order:</strong> ${orderNumber}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Phone:</strong> ${customerPhone}</p>

          <p>
            <strong>Pickup:</strong>
            ${pickupDate} at ${pickupTime}
          </p>

          <p>
            <strong>Estimated Delivery:</strong>
            ${estimatedDelivery}
          </p>

          <p>
            <strong>Estimated Total:</strong>
            $${orderTotal}
          </p>

          <p>
            Open the Hustle & Fold Admin Dashboard
            to review and accept this order.
          </p>
        `
      });

      if (error) {
  throw new Error(
    `Resend error: ${JSON.stringify(error)}`
  );
}

logger.info("Customer email address", {
  customerEmail,
  customerName,
});

await resend.emails.send({
  from: "Hustle & Fold <orders@hustleandfoldlaundry.com>",
  to: [customerEmail],
  subject: "We've Received Your Order",
  html: `
    <h1>Thank You, ${customerName}!</h1>

    <p>
      We have successfully received your order.
    </p>

    <p>
      <strong>Order Number:</strong>
      ${orderNumber}
    </p>

    <p>
      <strong>Pickup Date:</strong>
      ${pickupDate}
    </p>

    <p>
      <strong>Pickup Time:</strong>
      ${pickupTime}
    </p>

    <p>
      <strong>Estimated Total:</strong>
      $${orderTotal}
    </p>

    <p>
      Our team will review your order and keep
      you updated as it moves through the process.
    </p>

    <p>
      Thank you for choosing Hustle & Fold!
    </p>
  `
});

      logger.info(
        "New order email sent successfully.",
        {
          orderNumber,
          emailId: data?.id
        }
      );
} catch (error) {
  logger.error(
    "New order email failed.",
    {
      orderNumber,
      errorMessage:
        error?.message || String(error),
      errorStack:
        error?.stack || "No stack available"
    }
  );

  throw error;
}
  }
);

exports.sendStatusUpdateEmail = onDocumentUpdated(
  {
    document: "orders/{orderDocumentId}",
    secrets: [resendApiKey],
    maxInstances: 10
  },
  async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (!before || !after) return;

    if (before.status === after.status) {
      return;
    }

    if (after.status !== "Accepted") {
  return;
}

const resend = new Resend(resendApiKey.value());

const customerEmail = after.email;
const customerName = after.name || "Customer";
const orderNumber =
  after.orderId || event.params.orderDocumentId;

await resend.emails.send({
  from: "Hustle & Fold <orders@hustleandfoldlaundry.com>",
  to: [customerEmail],
  subject: "Your Order Has Been Accepted",
  html: `
    <h1>Good News, ${customerName}!</h1>

    <p>
      Your order has been accepted by the Hustle & Fold team.
    </p>

    <p>
      <strong>Order Number:</strong>
      ${orderNumber}
    </p>

    <p>
      We are preparing your order for pickup and will keep you updated as it moves through our process.
    </p>

    <p>
      Thank you for choosing Hustle & Fold!
    </p>
  `
});

logger.info("Accepted status email sent", {
  orderNumber,
  customerEmail
});

    logger.info("Order status changed", {
      orderId: event.params.orderDocumentId,
      oldStatus: before.status,
      newStatus: after.status,
    });
  }
);