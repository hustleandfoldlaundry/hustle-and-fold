const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const {initializeApp} = require("firebase-admin/app");
const {getAuth} = require("firebase-admin/auth");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const {PDFDocument, StandardFonts, rgb} = require("pdf-lib");
const {Buffer} = require("node:buffer");

initializeApp({ storageBucket: "hustleandfold-4908a.firebasestorage.app" });

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
    const orderNumber = order.orderId || event.params.orderDocumentId;
    const customerName = order.name || "Not provided";
    const customerEmail = order.email || "Not provided";
    const customerPhone = order.phone || "Not provided";
    const pickupDate = order.pickupDate || "Not provided";
    const pickupTime = order.pickupTime || "Not provided";
    const estimatedDelivery = order.estimatedDelivery || "Not provided";
    const orderTotal = Number( order.grandTotal || 0 ).toFixed(2);

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

exports.sendNewCorporateLeadEmail = onDocumentCreated(
  {
    document: "corporateLeads/{leadDocumentId}",
    secrets: [resendApiKey],
    maxInstances: 10
  },
  async (event) => {
    const lead = event.data?.data();

    if (!lead) {
      logger.error(
        "Corporate lead data was unavailable."
      );
      return;
    }

    const resend = new Resend(
      resendApiKey.value()
    );

    const companyName =
      lead.companyName || "Not provided";

    const contactName =
      lead.contactName || "Not provided";

    const phone =
      lead.phone || "Not provided";

    const email =
      lead.email || "Not provided";

    const businessType =
      lead.businessType || "Not provided";

    const weeklyVolume =
      lead.weeklyVolume || "Not provided";

    const message =
      lead.message || "Not provided";

    try {
      const {data, error} =
        await resend.emails.send({
          from:
            "Hustle & Fold " +
            "<orders@hustleandfoldlaundry.com>",

          to: [
            "hustleandfoldlaundry@gmail.com"
          ],

          replyTo: email,

          subject:
            "New Corporate Consultation Request - " +
            companyName,

          html: `
            <h1>
              New Corporate Consultation Request
            </h1>

            <p>
              A new corporate consultation request
              has been submitted.
            </p>

            <p>
              <strong>Company Name:</strong>
              ${companyName}
            </p>

            <p>
              <strong>Contact Name:</strong>
              ${contactName}
            </p>

            <p>
              <strong>Phone Number:</strong>
              ${phone}
            </p>

            <p>
              <strong>Email:</strong>
              ${email}
            </p>

            <p>
              <strong>Business Type:</strong>
              ${businessType}
            </p>

            <p>
              <strong>
                Estimated Weekly Volume:
              </strong>
              ${weeklyVolume}
            </p>

            <p>
              <strong>Laundry Needs:</strong>
            </p>

            <p>
              ${message}
            </p>

            <p>
              Open the Hustle & Fold Admin
              Dashboard to review and follow up
              with this lead.
            </p>
          `
        });

      if (error) {
        throw new Error(
          `Resend error: ${JSON.stringify(error)}`
        );
      }

      logger.info(
        "New corporate lead email sent.",
        {
          leadId:
            event.params.leadDocumentId,
          companyName,
          customerEmail: email,
          emailId: data?.id
        }
      );
    } catch (error) {
      logger.error(
        "Corporate lead email failed.",
        {
          leadId:
            event.params.leadDocumentId,
          companyName,
          error:
            error?.message || String(error)
        }
      );

      throw error;
    }
  }
);

exports.sendCorporateCustomerInvite = onCall(
  {
    secrets: [resendApiKey],
    maxInstances: 10
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "You must be signed in."
      );
    }

    const db = getFirestore();

    const adminSnapshot = await db
      .collection("admins")
      .doc(request.auth.uid)
      .get();

    if (
      !adminSnapshot.exists ||
      adminSnapshot.data()?.active !== true
    ) {
      throw new HttpsError(
        "permission-denied",
        "Only an active administrator can send invitations."
      );
    }

    const customerId = request.data?.customerId;

    if (!customerId) {
      throw new HttpsError(
        "invalid-argument",
        "Corporate customer ID is required."
      );
    }

    const customerSnapshot = await db
      .collection("corporateCustomers")
      .doc(customerId)
      .get();

    if (!customerSnapshot.exists) {
      throw new HttpsError(
        "not-found",
        "Corporate customer was not found."
      );
    }

    const customer = customerSnapshot.data();

    if (!customer.email) {
      throw new HttpsError(
        "failed-precondition",
        "Corporate customer email is missing."
      );
    }

    const auth = getAuth();

let userRecord;

try {
  userRecord = await auth.getUserByEmail(
    customer.email
  );
} catch (error) {
  if (error.code !== "auth/user-not-found") {
    throw error;
  }

  userRecord = await auth.createUser({
    email: customer.email,
    displayName:
      customer.contactName ||
      customer.companyName ||
      "Corporate Customer",
    emailVerified: false,
    disabled: false
  });
}

await auth.setCustomUserClaims(
  userRecord.uid,
  {
    role: "corporateCustomer",
    corporateCustomerId: customerId
  }
);

const setupLink =
  await auth.generatePasswordResetLink(
    customer.email,
    {
      url:
        "https://www.hustleandfoldlaundry.com/corporate/login"
    }
  );

  const resend = new Resend(resendApiKey.value());

const {data, error} = await resend.emails.send({
  from:
    "Hustle & Fold <orders@hustleandfoldlaundry.com>",

  to: [customer.email],

  subject:
    "Set Up Your Hustle & Fold Corporate Account",

  text: `
Hello ${customer.contactName || "Corporate Customer"},

Hustle & Fold has created a corporate customer account for ${customer.companyName || "your company"}.

Use the secure link below to create your password:

${setupLink}

After creating your password, you will be able to sign in to your Hustle & Fold Corporate Customer Portal.

If you were not expecting this invitation, please contact Hustle & Fold.

Thank you,
Hustle & Fold Laundry Services
  `
});

if (error) {
  throw new HttpsError(
    "internal",
    `Resend error: ${JSON.stringify(error)}`
  );
}

await customerSnapshot.ref.update({
  authUid: userRecord.uid,
  accountStatus: "Invitation Sent",
  invitationSentAt: new Date().toISOString(),
  invitationEmailId: data?.id || ""
});

logger.info(
  "Corporate customer invitation sent.",
  {
    customerId,
    authUid: userRecord.uid,
    email: customer.email,
    emailId: data?.id
  }
);

    return {
      success: true,
      customerId,
      email: customer.email,
      accountStatus: "Invitation Sent"
    };
  }
);

exports.sendNewCorporateContractEmail = onDocumentCreated(
  {
    document: "corporateContracts/{contractId}",
    region: "us-west2",
    secrets: [resendApiKey],
    maxInstances: 10
  },
  async (event) => {
    const contract = event.data?.data();

    if (!contract) {
      logger.error(
        "Corporate contract data was unavailable."
      );
      return;
    }

    const customerId = contract.corporateCustomerId;

    if (!customerId) {
      logger.error(
        "Corporate customer ID was missing.",
        {
          contractId: event.params.contractId
        }
      );
      return;
    }

    const db = getFirestore();

    const customerSnapshot = await db
      .collection("corporateCustomers")
      .doc(customerId)
      .get();

    if (!customerSnapshot.exists) {
      logger.error(
        "Corporate customer was not found.",
        {
          customerId,
          contractId: event.params.contractId
        }
      );
      return;
    }

    const customer = customerSnapshot.data();

    if (!customer.email) {
      logger.error(
        "Corporate customer email was missing.",
        {
          customerId,
          contractId: event.params.contractId
        }
      );
      return;
    }

    const resend = new Resend(
      resendApiKey.value()
    );

    const {data, error} =
      await resend.emails.send({
        from:
          "Hustle & Fold " +
          "<orders@hustleandfoldlaundry.com>",

        to: [customer.email],

        subject:
          "New Contract Ready for Review - " +
          contract.title,

        text: `
Hello ${customer.contactName || "Corporate Customer"},

A new contract is ready for review in your Hustle & Fold Corporate Customer Portal.

Company:
${customer.companyName || "Not provided"}

Contract:
${contract.title || "Corporate Service Agreement"}

Effective Date:
${contract.effectiveDate || "Not provided"}

Expiration Date:
${contract.expirationDate || "None"}

Contract Status:
${contract.status || "Pending Signature"}

Sign in to review and sign your contract:

https://www.hustleandfoldlaundry.com/corporate/login

Thank you,
Hustle & Fold Laundry Services
        `
      });

    if (error) {
      throw new Error(
        `Resend error: ${JSON.stringify(error)}`
      );
    }

    logger.info(
      "New corporate contract email sent.",
      {
        contractId: event.params.contractId,
        customerId,
        customerEmail: customer.email,
        emailId: data?.id
      }
    );
  }
);

async function createSignedContractPdf(
  contractId,
  contract,
  companyName
) {
  const pdfDocument = await PDFDocument.create();

  const regularFont = await pdfDocument.embedFont(
    StandardFonts.Helvetica
  );

  const boldFont = await pdfDocument.embedFont(
    StandardFonts.HelveticaBold
  );

  let page = pdfDocument.addPage([612, 792]);
  const margin = 50;
  const pageWidth = page.getWidth();
  const maxWidth = pageWidth - margin * 2;
  const bodySize = 11;
  const lineHeight = 17;
  let y = 735;

  function cleanText(value) {
    return String(value || "")
      .replace(/[‘’]/g, "'")
      .replace(/[“”]/g, "\"")
      .replace(/[–—]/g, "-");
  }

  function addPageWhenNeeded() {
    if (y > 65) {
      return;
    }

    page = pdfDocument.addPage([612, 792]);
    y = 735;
  }

  function drawLine(text, options = {}) {
    addPageWhenNeeded();

    const font = options.bold ?
      boldFont :
      regularFont;

    const size = options.size || bodySize;
    const color = options.color || rgb(0.12, 0.18, 0.3);

    page.drawText(cleanText(text), {
      x: margin,
      y,
      size,
      font,
      color
    });

    y -= options.spacing || lineHeight;
  }

  function drawWrappedText(text) {
    const words = cleanText(text).split(/\s+/);
    let line = "";

    words.forEach((word) => {
      const testLine = line ?
        `${line} ${word}` :
        word;

      const width = regularFont.widthOfTextAtSize(
        testLine,
        bodySize
      );

      if (width > maxWidth && line) {
        drawLine(line);
        line = word;
      } else {
        line = testLine;
      }
    });

    if (line) {
      drawLine(line);
    }
  }

  drawLine(
    "HUSTLE & FOLD LAUNDRY SERVICES",
    {
      bold: true,
      size: 18,
      spacing: 28,
      color: rgb(0.12, 0.23, 0.54)
    }
  );

  drawLine(
    "SIGNED CORPORATE SERVICE AGREEMENT",
    {
      bold: true,
      size: 15,
      spacing: 30
    }
  );

  drawLine(`Company: ${companyName}`);
  drawLine(`Contract: ${contract.title}`);
  drawLine(`Contract ID: ${contractId}`);
  drawLine(
    `Effective Date: ${contract.effectiveDate || "Not provided"}`
  );
  drawLine(
    `Expiration Date: ${contract.expirationDate || "None"}`
  );
  drawLine("Status: Signed", {
    bold: true,
    color: rgb(0.09, 0.55, 0.25),
    spacing: 28
  });

  drawLine("CONTRACT TERMS", {
    bold: true,
    size: 13,
    spacing: 23
  });

  drawWrappedText(
    contract.terms || "No contract terms were recorded."
  );

  y -= 18;

  drawLine("ELECTRONIC SIGNATURE", {
    bold: true,
    size: 13,
    spacing: 23
  });

  drawLine(
    `Signed By: ${contract.signedByName || "Not recorded"}`
  );

  drawLine(
    `Signer Email: ${contract.signedByEmail || "Not recorded"}`
  );

  drawLine(
    `Signed Date: ${contract.signedAt || "Not recorded"}`
  );

  drawLine(
    "The signer confirmed that the typed name above " +
    "was intended to serve as an electronic signature."
  );

  const pdfBytes = await pdfDocument.save();

  const storagePath =
    `corporate-contracts/${contract.corporateCustomerId}/` +
    `${contractId}-signed.pdf`;

  const bucket = getStorage().bucket();
  const file = bucket.file(storagePath);

  await file.save(Buffer.from(pdfBytes), {
    metadata: {
      contentType: "application/pdf",
      cacheControl: "private, max-age=0"
    }
  });

  return storagePath;
}

exports.sendSignedCorporateContractEmail = onDocumentUpdated(
  {
    document: "corporateContracts/{contractId}",
    region: "us-west2",
    secrets: [resendApiKey],
    maxInstances: 10
  },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();

    if (!before || !after) {
      logger.error(
        "Corporate contract update data was unavailable."
      );
      return;
    }

    if (
      before.status === "Signed" ||
      after.status !== "Signed"
    ) {
      return;
    }

    const db = getFirestore();

    let companyName = "Not provided";

    if (after.corporateCustomerId) {
      const customerSnapshot = await db
        .collection("corporateCustomers")
        .doc(after.corporateCustomerId)
        .get();

      if (customerSnapshot.exists) {
        companyName =
          customerSnapshot.data()?.companyName ||
          "Not provided";
      }
    }

const signedPdfStoragePath =
  await createSignedContractPdf(
    event.params.contractId,
    after,
    companyName
  );

await event.data.after.ref.update({
  signedPdfStoragePath,
  signedPdfGeneratedAt:
    new Date().toISOString()
});


    const resend = new Resend(
      resendApiKey.value()
    );

    const {data, error} =
      await resend.emails.send({
        from:
          "Hustle & Fold " +
          "<orders@hustleandfoldlaundry.com>",

        to: [
          "hustleandfoldlaundry@gmail.com"
        ],

        subject:
          "Corporate Contract Signed - " +
          (after.title || companyName),

        text: `
A corporate contract has been signed.

Company:
${companyName}

Contract:
${after.title || "Corporate Service Agreement"}

Signed By:
${after.signedByName || "Not recorded"}

Signer Email:
${after.signedByEmail || "Not recorded"}

Signed Date:
${after.signedAt || "Not recorded"}

Effective Date:
${after.effectiveDate || "Not provided"}

Expiration Date:
${after.expirationDate || "None"}

Open the Hustle & Fold Admin Dashboard to review the signed contract.
`
});

if (error) {
 throw new Error(
 "Resend error: " + JSON.stringify(error)
 );
}

logger.info(

 "Signed corporate contract email sent.",

 {
 contractId: event.params.contractId,
 corporateCustomerId: after.corporateCustomerId || "",
 signerEmail: after.signedByEmail || "",
 emailId: data?.id
 }
);
}
);

exports.sendCorporateContractRenewalReminders = onSchedule(
  {
    schedule: "every day 08:00",
    timeZone: "America/Los_Angeles",
    region: "us-west2",
    secrets: [resendApiKey]
  },
  async () => {
    const db = getFirestore();
    const today = new Date();

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(
      today.getDate() + 30
    );

    const contractsSnapshot = await db
      .collection("corporateContracts")
      .get();

    let remindersSent = 0;

    for (const contractDocument of contractsSnapshot.docs) {
      const contract = contractDocument.data();

      if (
        contract.status !== "Signed" ||
        !contract.expirationDate
      ) {
        continue;
      }

      const expirationDate = new Date(
        contract.expirationDate + "T23:59:59"
      );

      const isInRenewalWindow =
        expirationDate >= today &&
        expirationDate <= thirtyDaysFromNow;

      const reminderAlreadySent =
        contract.renewalReminderExpirationDate ===
        contract.expirationDate;

      if (
        !isInRenewalWindow ||
        reminderAlreadySent
      ) {
        continue;
      }

      let companyName = "Not provided";
      let contactName = "Corporate Customer";
      let customerEmail = "";

      if (contract.corporateCustomerId) {
        const customerSnapshot = await db
          .collection("corporateCustomers")
          .doc(contract.corporateCustomerId)
          .get();

        if (customerSnapshot.exists) {
          const customer = customerSnapshot.data();

          companyName =
            customer.companyName ||
            "Not provided";

          contactName =
            customer.contactName ||
            "Corporate Customer";

          customerEmail =
            customer.email || "";
        }
      }

      const resend = new Resend(
        resendApiKey.value()
      );

      const {data, error} =
        await resend.emails.send({
          from:
            "Hustle & Fold " +
            "<orders@hustleandfoldlaundry.com>",

          to: [
            "hustleandfoldlaundry@gmail.com"
          ],

          subject:
            "Contract Renewal Reminder - " +
            companyName,

          text: `
A corporate contract is approaching its expiration date.

Company:
${companyName}

Primary Contact:
${contactName}

Customer Email:
${customerEmail || "Not provided"}

Contract:
${contract.title || "Corporate Service Agreement"}

Expiration Date:
${contract.expirationDate}

Status:
${contract.status}

Please review the contract and prepare a renewal agreement for the customer.

Open the Hustle & Fold Admin Dashboard for more information.
          `
        });

      if (error) {
        logger.error(
          "Corporate renewal reminder email failed.",
          {
            contractId: contractDocument.id,
            error
          }
        );

        continue;
      }

      await contractDocument.ref.update({
        renewalReminderSentAt:
          new Date().toISOString(),

        renewalReminderExpirationDate:
          contract.expirationDate,

        renewalReminderEmailId:
          data?.id || ""
      });

      remindersSent += 1;

      logger.info(
        "Corporate renewal reminder sent.",
        {
          contractId: contractDocument.id,
          companyName,
          expirationDate:
            contract.expirationDate,
          emailId: data?.id
        }
      );
    }

    logger.info(
      "Corporate renewal reminder check completed.",
      {
        remindersSent
      }
    );
  }
);