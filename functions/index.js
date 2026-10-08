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

    const supportedStatuses = [
  "Accepted",
  "Pending Pickup",
  "Picked Up",
  "In Process",
  "Ready For Drop-Off",
  "Delivered",
  "Order Complete",
  "Cancelled"
];

    logger.info("Order status changed", {
      orderId: event.params.orderDocumentId,
      oldStatus: before.status,
      newStatus: after.status,
    });

if (!supportedStatuses.includes(after.status)) {
  return;
}

const resend = new Resend(resendApiKey.value());

const customerEmail = after.email;
const customerName = after.name || "Customer";
const orderNumber =
  after.orderId || event.params.orderDocumentId;
let subject = "";
let heading = "";
let message = "";
let nextStep = "";

if (after.status === "Accepted") {
  subject = "Your Order Has Been Accepted";
  heading = `Good News, ${customerName}!`;
  message =
    "Your order has been accepted by the Hustle & Fold team.";
  nextStep =
    "Our team is preparing for your upcoming pickup and will keep you informed every step of the way.";
}

if (after.status === "Pending Pickup") {
  subject = "Your Pickup Is Being Scheduled";
  heading = `Hello, ${customerName}!`;
  message =
    "Your order has been approved and is now awaiting pickup.";
  nextStep =
    "Our team is coordinating your pickup and will notify you once your laundry has been collected.";
}

if (after.status === "Picked Up") {
  subject = "Your Laundry Has Been Picked Up";
  heading = `Your Laundry Is on Its Way, ${customerName}!`;
  message =
    "We have picked up your laundry and will begin processing it soon.";
  nextStep = 
    "Your laundry is heading to our facility where it will be washed, dried, and folded with care.";
}

if (after.status === "In Process") {
  subject = "Your Laundry Is Being Processed";
  heading = `We're Working on It, ${customerName}!`;
  message =
    "Your laundry is currently being washed, dried, and folded.";
  nextStep = 
    "Our team is carefully processing your order and preparing them for delivery.";
}

if (after.status === "Ready For Drop-Off") {
  subject = "Your Laundry Is Ready For Delivery";
  heading = `Almost There, ${customerName}!`;
  message =
    "Your laundry is complete and is being prepared for delivery.";
  nextStep =
    "Your freshly cleaned laundry is being packed and scheduled for return.";
}

if (after.status === "Delivered") {
  subject = "Your Laundry Has Been Delivered";
  heading = `Delivery Complete, ${customerName}!`;
  message =
    "Your laundry has been delivered. Thank you for choosing Hustle & Fold.";
  nextStep = 
    "If you have any questions about your order, we're always happy to help.";
}

if (after.status === "Order Complete") {
  subject = "Your Order Is Complete";
  heading = `Thank You, ${customerName}!`;
  message =
    "Your order is now complete.";
  nextStep = 
    "Thank you for trusting Hustle and Fold. We appreciate your business and look forward to serving you again.";
}

if (after.status === "Cancelled") {
  subject = "Your Order Has Been Cancelled";
  heading = `Order Cancelled, ${customerName}`;
  message =
    "Your order has been cancelled.";

  nextStep =
    "If you believe this was done in error or would like to reschedule service, please contact Hustle & Fold and we'll be happy to assist you.";
}

await resend.emails.send({
  from: "Hustle & Fold <orders@hustleandfoldlaundry.com>",
  to: [customerEmail],
  subject: subject,

  html: `
    <h1>${heading}</h1>

    <p>
  ${message}
</p>

    <p>
      <strong>Order Number:</strong>
      ${orderNumber}
    </p>

    <p>
      ${nextStep}
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


  }
);