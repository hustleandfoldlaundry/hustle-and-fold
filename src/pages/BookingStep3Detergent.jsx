import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import ProgressBar from "../ProgressBar";
import Step3Progress from "../Step3Progress";
import { db } from "../firebase";
import { doc, getDoc } from "@firebase/firestore/lite";

export default function BookingStep3Detergent() {
  const navigate = useNavigate();
  const { bookingData, setBookingData } = useBooking();

  const [services, setServices] = useState({});

  const [detergentType, setDetergentType] = useState(
    bookingData.detergentType || ""
  );

  const [detergentChoice, setDetergentChoice] = useState(
    bookingData.detergentChoice || ""
  );

  const [customerProvidedConfirmed, setCustomerProvidedConfirmed] =
    useState(
      bookingData.customerProvidedConfirmed || false
    );

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadServices() {
      try {
        const snap = await getDoc(
          doc(db, "admin", "services")
        );

        if (snap.exists()) {
          setServices(snap.data());
        }
      } catch (error) {
        console.error(
          "Error loading detergent settings:",
          error
        );
      }
    }

    loadServices();
  }, []);

  let sensitivePrice = 0;

if (detergentChoice === "All Sensitive Fresh") {
  sensitivePrice =
    Number(
      services?.detergent?.hypoallergenicSensitive
        ?.allSensitiveFresh?.price || 3
    );
}

if (detergentChoice === "Tide Free & Gentle") {
  sensitivePrice =
    Number(
      services?.detergent?.hypoallergenicSensitive
        ?.tideFreeAndGental?.price || 3
    );
}

  const customerDiscount =
    Number(
      services?.detergent?.customerProvided?.discount ||
        -1.5
    );

  const baseGrandTotal =
    (bookingData.step1Total || 0) +
    (bookingData.step2Total || 0);

  const detergentTotal =
    detergentType === "sensitive"
      ? sensitivePrice
      : detergentType === "customer"
      ? customerDiscount
      : 0;

  const grandTotal =
    baseGrandTotal + detergentTotal;

  function handleNext() {
    if (!detergentType || !detergentChoice) {
      setError(
        "Please select a detergent option."
      );
      return;
    }

    if (
      detergentType === "customer" &&
      !customerProvidedConfirmed
    ) {
      setError(
        "Please confirm that you will provide detergent."
      );
      return;
    }

    setError("");

    setBookingData({
      ...bookingData,
      detergentType,
      detergentChoice,
      customerProvidedConfirmed,
      detergentTotal,
      grandTotal
    });

    navigate("/booking/step3/addons");
  }

  const card = {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow:
      "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  };

  const optionStyle = (value) => ({
    padding: "14px",
    margin: "8px auto",
    borderRadius: "10px",
    border: "none",
    width: "85%",
    backgroundColor:
      detergentType === value
        ? "#2563eb"
        : "#dbeafe",
    color:
      detergentType === value
        ? "white"
        : "#1e3a8a",
    cursor: "pointer",
    fontWeight: "500"
  });

  const selectStyle = {
    width: "90%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
  };

  const navButton = {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f9ff",
        padding: "30px"
      }}
    >
      <div
        style={{
          maxWidth: "500px",
          margin: "0 auto",
          textAlign: "center"
        }}
      >
        <ProgressBar step={3} />
        <Step3Progress />

        <h2 style={{ color: "#1e3a8a" }}>
          Detergent Preference
        </h2>

        <div style={card}>
          <button
            onClick={() => {
              setDetergentType("original");
              setDetergentChoice("");
              setCustomerProvidedConfirmed(
                false
              );
            }}
            style={optionStyle("original")}
          >
            Original Detergents (Included)
          </button>

          {detergentType === "original" && (
            <select
              value={detergentChoice}
              onChange={(e) =>
                setDetergentChoice(
                  e.target.value
                )
              }
              style={selectStyle}
            >
              <option value="">
                Select Original Detergent
              </option>
              <option value="All Free & Clear">
                All Free & Clear
              </option>
              <option value="Gain Original">
                Gain Original
              </option>
              <option value="Tide Original">
                Tide Original
              </option>
            </select>
          )}

          {(
  services?.detergent?.hypoallergenicSensitive
    ?.allSensitiveFresh?.active ||
  services?.detergent?.hypoallergenicSensitive
    ?.tideFreeAndGental?.active
) && (
  <button
    onClick={() => {
      setDetergentType("sensitive");
      setDetergentChoice("");
      setCustomerProvidedConfirmed(
        false
      );
    }}
    style={optionStyle("sensitive")}
  >
    Hypoallergenic / Sensitive
    Detergents (+$
    {sensitivePrice.toFixed(2)})
  </button>
)}

          {detergentType === "sensitive" && (
            <select
              value={detergentChoice}
              onChange={(e) =>
                setDetergentChoice(
                  e.target.value
                )
              }
              style={selectStyle}
            >
              <option value="">
                Select Sensitive Detergent
              </option>

              {services?.detergent?.hypoallergenicSensitive
  ?.allSensitiveFresh?.active && (
  <option value="All Sensitive Fresh">
    All Sensitive Fresh
  </option>
)}

              {services?.detergent?.hypoallergenicSensitive
  ?.tideFreeAndGental?.active && (
  <option value="Tide Free & Gentle">
    Tide Free & Gentle
  </option>
)}
            </select>
          )}

          {services?.detergent?.customerProvided?.active && (
  <button
    onClick={() => {
      setDetergentType("customer");
      setDetergentChoice(
        "Customer Provided"
      );
    }}
    style={optionStyle("customer")}
  >
    Customer Provided ($
    {customerDiscount.toFixed(2)})
          </button>
          )}
          {detergentType === "customer" && (
            <div
              style={{
                marginTop: "15px",
                textAlign: "left"
              }}
            >
              <label>
                <input
                  type="checkbox"
                  checked={
                    customerProvidedConfirmed
                  }
                  onChange={() =>
                    setCustomerProvidedConfirmed(
                      !customerProvidedConfirmed
                    )
                  }
                />{" "}
                I agree that I'll send the
                recommended amount of detergent
                for my laundry.
              </label>
            </div>
          )}
        </div>

        <div style={card}>
          <h3>Grand Total</h3>

          <h2 style={{ color: "#1e3a8a" }}>
            ${grandTotal.toFixed(2)}
          </h2>
        </div>

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <div
          style={{
            textAlign: "center",
            marginTop: "20px"
          }}
        >
          <button
            onClick={() =>
              navigate(
                "/booking/step3/contact"
              )
            }
            style={{
              ...navButton,
              marginRight: "10px"
            }}
          >
            ← Back
          </button>

          <button
            onClick={handleNext}
            style={navButton}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}