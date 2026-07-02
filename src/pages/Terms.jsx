import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  function handleScroll(e) {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 5;

    if (bottom) setScrolled(true);
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f9ff" }}>

      {/* ✅ STICKY HEADER */}
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          padding: "15px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 10
        }}
      >
        <button
          onClick={() => navigate(-1)}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back
        </button>

        <h3 style={{ margin: 0, color: "#1e3a8a" }}>
          Terms & Conditions
        </h3>

        <div style={{ width: "60px" }} />
      </div>

      <div style={{ maxWidth: "700px", margin: "20px auto", padding: "20px" }}>

        {/* ✅ SCROLLABLE TERMS BOX (YOUR TEXT UNCHANGED) */}
        <div
          onScroll={handleScroll}
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            background: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
          }}
        >

          <h2 style={{ textAlign: "center", color: "#1e3a8a" }}>
            Hustle and Fold Laundry Services
            <p>(Wash & Fold)</p>
          </h2>

          <h3>Terms and Conditions</h3>
          <p>
            Welcome to Hustle and Fold Laundry Services. By using our services, you agree to the following terms and conditions.
          </p>

          <h4>1. Service Overview</h4>
          <p>
            Hustle and Fold provides professional wash, dry, and fold laundry services, including optional pickup and delivery. All services are performed using standard laundering processes unless otherwise specified.
          </p>

          <p>
            We reserve the right to refuse service for items that are unsafe, excessively soiled, or unsuitable for machine washing.
          </p>

          <h4>2. Customer Responsibility</h4>
          <p>
            Customers agree to:
            <br /><br />
            - Remove all items from pockets (money, keys, jewelry, etc.)
            <br />
            - Provide only items suitable for standard washing and drying
            <br />
            - Clearly label or separate any special-care items
            <br />
            - Notify us of any specific instructions before service begins
            <br /><br />
            Hustle and Fold is not responsible for damage caused by items left in pockets or undisclosed special-care needs.
          </p>

          <h4>3. Wash and Fold Process</h4>
          <p>
            - Laundry is processed by weight and by individual item count, so please pay close attention to your selections
            <br />
            - Items may be washed together unless otherwise requested.
            <br />
            - We do not guarantee complete stain removal
            <br />
            - Care labels may not be individually inspected
          </p>

          <h4>4. Turnaround Time</h4>
          <p>
            - Standard turnaround time is 24 hours for 10 loads or less
            <br />
            - Express service (12-hour turnaround) is available for an additional fee
            <br />
            - Delays may occur during unforeseen circumstances but will be communicated as soon as possible
          </p>

          <h4>5. Pricing & Payment</h4>
          <p>
            - Pricing is based on per pound, per load, or per order depending on selections
            <br />
            - Payment is due before delivery or upon pickup
            <br />
            - Hustle and Fold reserves the right to hold items until payment is received in full
          </p>

          <h4>6. Cancellations & Refunds</h4>
          <p>
            - Orders may be canceled before pickup or processing begins
            <br />
            - Once laundry has been processed, all sales are final and non-refundable
          </p>

          <h4>7. Damage & Risk Disclaimer</h4>
          <p>
            While we take great care, customers acknowledge that:
          </p>

          <p>
            - Laundry is processed at the customer's own risk
            <br />
            - We are not responsible for:
            <br />
            - Shrinkage or stretching
            <br />
            - Color bleeding or fading
            <br />
            - Wear and tear or fabric weakness
            <br />
            - Missing buttons, zippers, or embellishments
            <br />
            - Manufacturer defects
          </p>

          <h4>8. Lost or Damaged Items</h4>
          <p>
            - Claims must be reported within 24-48 hours of reeiving your order
            <br />
            - After this period, claims may not be accepted
            <br />
            - Compensation, if applicable, will be limited to a reasonable amount based on service value
          </p>

          <h4>9. Unclaimed Laundry</h4>
          <p>
            - Laundry not picked up on time may incur daily storage fees
            <br />
            - After 7 days, unclaimed items may be donated or disposed of
          </p>

          <h4>10. Pickup & Delivery</h4>
          <p>
            - Accurate pickup/drop-off details must be provided
            <br />
            - Hustle and Fold is not responsible for unattended items unless authorized
            <br />
            - Missed pickups or redelivery may incur additional fees
          </p>

          <h4>11. Right to Refuse Service</h4>
          <p>
            We reserve the right to refuse service for:
          </p>
          <p>
            - Hazardous or contaminated items
            <br />
            - Infested items (bed bugs, fleas, etc.)
            <br />
            - Items not suitable for regular laundering
          </p>

          <h4>12. Limitation of Liability</h4>
          <p>
            To the fullest extent permitted by law:
          </p>

          <p>
            - Hustle and Fold Laundry Services is not liable for indirect or consequential damages
            <br />
            - Total liability will not excees the value of the service provided
          </p>

          <h4>13. Governing Law</h4>
          <p>
            These Terms are govern by the laws of the State of California
          </p>

          <h4>14. Contact</h4>
          <p>
            Hustle and Fold Laundry Services
            <br />
            Email: HustleAndFoldLaundry@gmail.com
            <br />
            Phone: (951) 291-8621
          </p>

          <p style={{ marginTop: "20px" }}>
            By confirming your order, you acknowledge and accept these terms.
          </p>
        </div>

        {/* ✅ AGREEMENT SECTION */}
        <div style={{ marginTop: "20px" }}>
          <label>
            <input
              type="checkbox"
              disabled={!scrolled}
              checked={agreed}
              onChange={() => setAgreed(!agreed)}
            />{" "}
            I have read and agree to the Terms & Conditions
          </label>

          {!scrolled && (
            <p style={{ color: "red", fontSize: "12px" }}>
              Please scroll to the bottom first
            </p>
          )}
        </div>

        {/* ✅ BUTTON */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            disabled={!agreed}
            onClick={() =>
  navigate(-1, { state: { termsAccepted: true } })
}
            style={{
              padding: "12px 25px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: agreed ? "#2563eb" : "#9ca3af",
              color: "white"
            }}
          >
            Agree & Continue
          </button>
        </div>

      </div>
    </div>
  );
}