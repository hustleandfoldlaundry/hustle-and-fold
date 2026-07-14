import { useState, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { db, collection, addDoc } from "../firebase";
import ProgressBar from "../ProgressBar";

export default function BookingStep4() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
  bookingData,
  setBookingData,
  clearBooking,
} = useBooking();

  const termsRef = useRef(null);

  const [openSection, setOpenSection] = useState(null);
  const [agreed, setAgreed] = useState(
    location.state?.termsAccepted || false
  );

  const toggleSection = (name) => {
    setOpenSection(openSection === name ? null : name);
  };

  const card = {
    background: "white",
    padding: "15px",
    marginTop: "10px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease"
  };

  const navButton = {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    color: "white",
    cursor: "pointer"
  };

  const laundryTotal = bookingData.step1Total || 0;
  const deliveryTotal = bookingData.step2Total || 0;
  const detergentTotal = bookingData.detergentTotal || 0;
  const addonsTotal = bookingData.addonsTotal || 0;
  const hangingCareTotal = bookingData.hangingCareTotal || 0;
  const hangerTotal = bookingData.hangerTotal || 0;

  const grandTotal =
    laundryTotal +
    deliveryTotal +
    detergentTotal +
    addonsTotal +
    hangingCareTotal +
    hangerTotal;

  function sectionContentStyle(name) {
  return {
    display: openSection === name ? "block" : "none",
    marginTop: "10px"
  };
}

function getEstimatedDelivery() {
  if (
    !bookingData.pickupDate ||
    !bookingData.pickupTime ||
    !bookingData.deliverySpeed
  ) {
    return "Not available";
  }

  const deliveryDate = new Date(
    `${bookingData.pickupDate} ${bookingData.pickupTime}`
  );

  const addHours = bookingData.deliverySpeed === "12" ? 12 : 24;
  deliveryDate.setHours(deliveryDate.getHours() + addHours);

  const deliveryDay = deliveryDate.toLocaleDateString("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric"
});

  const deliveryTime = deliveryDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${deliveryDay} by ${deliveryTime}`;
}

  function getDetergentLabel() {
    if (bookingData.detergentType === "original") {
      return `${bookingData.detergentChoice} (Included)`;
    }
    if (bookingData.detergentType === "sensitive") {
      return `${bookingData.detergentChoice} (+$3.00)`;
    }
    if (bookingData.detergentType === "customer") {
      return "Customer Provided (-$1.50)";
    }
    return "Not selected";
  }

  function getAddonsList() {
    if (!bookingData.addons) return ["None"];

    const list = [];

    if (bookingData.addons.oxi) list.push("OxiClean (+$4)");
    if (bookingData.addons.color) list.push("Color Saver (+$2)");
    if (bookingData.addons.vinegar) list.push("Vinegar Rinse (+$3)");
    if (bookingData.addons.delicates) list.push("Delicates Care (+$5)");

    return list.length > 0 ? list : ["None"];
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f9ff", padding: "30px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>
        <ProgressBar step={4} />

        <h2 style={{ color: "#1e3a8a" }}>Review & Confirm</h2>

        {/* SERVICES */}
        <div
          style={card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
          }}
          onClick={() => toggleSection("services")}
        >
          <h3>🧺 Laundry Services</h3>

          <div style={sectionContentStyle("services")}>
            {bookingData.washFold && (
              <p>{bookingData.washFoldLbs} lbs Wash & Fold</p>
            )}
            {bookingData.foldOnly && (
              <p>{bookingData.foldOnlyLbs} lbs Fold Only</p>
            )}
            {bookingData.washFoldBedding > 0 && (
  <p>
    Wash & Fold Bedding Sets:
    {bookingData.washFoldBedding}
  </p>
)}

{bookingData.foldOnlyBedding > 0 && (
  <p>
    Fold Only Bedding Sets:
    {bookingData.foldOnlyBedding}
  </p>
)}

{bookingData.washFoldComforter > 0 && (
  <p>
    Wash & Fold Comforters:
    {bookingData.washFoldComforter}
  </p>
)}

{bookingData.foldOnlyComforter > 0 && (
  <p>
    Fold Only Comforters:
    {bookingData.foldOnlyComforter}
  </p>
)}

{bookingData.washFoldSleepingBag > 0 && (
  <p>
    Wash & Fold Sleeping Bags:
    {bookingData.washFoldSleepingBag}
  </p>
)}

{bookingData.foldOnlySleepingBag > 0 && (
  <p>
    Fold Only Sleeping Bags:
    {bookingData.foldOnlySleepingBag}
  </p>
)}

{bookingData.washFoldRug > 0 && (
  <p>
    Wash & Fold Area Rugs:
    {bookingData.washFoldRug}
  </p>
)}

{bookingData.foldOnlyRug > 0 && (
  <p>
    Fold Only Area Rugs:
    {bookingData.foldOnlyRug}
  </p>
)}
            {bookingData.otherCount > 0 && (
              <p>Other: {bookingData.otherText}</p>
            )}
            <p><strong>Total: ${laundryTotal.toFixed(2)}</strong></p>
          </div>
        </div>

        {/* DELIVERY */}
        <div
          style={card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
          }}
          onClick={() => toggleSection("delivery")}
        >
          <h3>🚚 Pickup & Delivery</h3>

          <div style={sectionContentStyle("delivery")}>
            <p>
  Date:{" "}
  {bookingData.pickupDate
    ? new Date(bookingData.pickupDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    : "Not selected"}
</p>

            <p>Time: {bookingData.pickupTime || "Not selected"}</p>
            <p>
  {bookingData.deliverySpeed === "12"
    ? "12 Hour Service (+$25)"
    : "24 Hour Service (Included)"}
</p>

<p>Estimated Delivery: {getEstimatedDelivery()}</p>

<p><strong>Total: ${deliveryTotal.toFixed(2)}</strong></p>
          </div>
        </div>

        {/* CONTACT */}
        <div
          style={card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
          }}
          onClick={() => toggleSection("contact")}
        >
          <h3>📍 Contact Info</h3>

          <div style={sectionContentStyle("contact")}>
            <p>{bookingData.name}</p>
            <p>{bookingData.phone}</p>
            <p>{bookingData.address}</p>
            <p>{bookingData.cityStateZip}</p>
            <p>{bookingData.unit || "No Unit / Gate Code Provided"}</p>
            <p>{bookingData.email}</p>
          </div>
        </div>

        {/* DETERGENT */}
        <div
          style={card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
          }}
          onClick={() => toggleSection("detergent")}
        >
          <h3>🧼 Detergent</h3>

          <div style={sectionContentStyle("detergent")}>
            <p>{getDetergentLabel()}</p>
            <p><strong>Adjustment: ${detergentTotal.toFixed(2)}</strong></p>
          </div>
        </div>

        {/* ADDONS */}
        <div
          style={card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
          }}
          onClick={() => toggleSection("addons")}
        >
          <h3>➕ Add‑Ons</h3>

          <div style={sectionContentStyle("addons")}>
            {getAddonsList().map((item, index) => (
              <p key={index}>{item}</p>
            ))}

            <p>Hang Items: {bookingData.hangItems || 0}</p>

            {bookingData.hangItems > 0 && (
              <>
                <p>Hanging Care: ${hangingCareTotal.toFixed(2)}</p>
                <p>
                  Hanger Option:{" "}
                  {bookingData.hangerOption === "needed"
                    ? "Hangers Needed (+$1 each)"
                    : "Hangers Provided (Included)"}
                </p>
                {bookingData.hangerOption === "needed" && (
                  <p>Hanger Total: ${hangerTotal.toFixed(2)}</p>
                )}
              </>
            )}

            <p><strong>Add‑Ons Total: ${addonsTotal.toFixed(2)}</strong></p>
          </div>
        </div>

        {/* NOTES */}
        <div
          style={card}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.08)";
          }}
          onClick={() => toggleSection("notes")}
        >
          <h3>📝 Notes</h3>

          <div style={sectionContentStyle("notes")}>
            <p>{bookingData.notes || "None"}</p>
          </div>
        </div>

        {/* TOTAL */}
        <div style={{ ...card, cursor: "default" }}>
          <h2 style={{ color: "#1e3a8a" }}>
            Grand Total: ${grandTotal.toFixed(2)}
          </h2>
        </div>

        {/* TERMS */}
        <div ref={termsRef} style={{ marginTop: "15px", textAlign: "left" }}>
          <label>
            <input
              type="checkbox"
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            />{" "}
            I agree to the{" "}
            <Link
              to="/terms"
              style={{ color: "#2563eb", textDecoration: "underline" }}
            >
              Terms & Conditions
            </Link>
            . Click Confirm Order to begin your order.
          </label>

          {!agreed && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
              You must review and agree to the Terms & Conditions before confirming your order.
            </p>
          )}
        </div>

        {/* NAV */}
        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => navigate("/booking/step3/notes")}
            style={{
              ...navButton,
              backgroundColor: "#6b7280",
              marginRight: "10px"
            }}
          >
            ← Back
          </button>

          <button
            disabled={!agreed}
            onClick={async () => {
              if (!agreed) {
                setOpenSection(null);
                termsRef.current?.scrollIntoView({ behavior: "smooth" });
                return;
              }

              const orderId = "ORD-" + Date.now();

              const orderData = {
                ...bookingData,
                orderId,
                createdAt: new Date().toISOString()
              };

              await addDoc(collection(db, "orders"), orderData);

              navigate("/booking/success", { state: { orderId } });
            }}
            style={{
              ...navButton,
              backgroundColor: agreed ? "#2563eb" : "#9ca3af"
            }}
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}