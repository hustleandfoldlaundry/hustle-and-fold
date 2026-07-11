import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import ProgressBar from "../ProgressBar";
import Step3Progress from "../Step3Progress";

export default function BookingStep3Notes() {
  const navigate = useNavigate();
  const {
  bookingData,
  setBookingData,
  clearBooking,
} = useBooking();

  const [notes, setNotes] = useState(bookingData.notes || "");

  // ✅ Calculate full running total
  const grandTotal =
    (bookingData.step1Total || 0) +
    (bookingData.step2Total || 0) +
    (bookingData.detergentTotal || 0) +
    (bookingData.addonsTotal || 0) +
    (bookingData.hangingCareTotal || 0) +
    (bookingData.hangerTotal || 0);

  function handleNext() {
    setBookingData({
      ...bookingData,
      notes,
      grandTotal
    });

    navigate("/booking/step4");
  }

  const card = {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
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
    <div style={{ minHeight: "100vh", backgroundColor: "#f5f9ff", padding: "30px" }}>
      <div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>

        <ProgressBar step={3} />
        <Step3Progress />

        <h2 style={{ color: "#1e3a8a" }}>Notes</h2>

        <div style={card}>
          <textarea
            rows="5"
            placeholder="Special instructions, preferences, or anything we should know..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: "90%",
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ccc"
            }}
          />
        </div>

        {/* ✅ FINAL GRAND TOTAL */}
        <div style={card}>
          <h3>Grand Total</h3>
          <h2 style={{ color: "#1e3a8a" }}>
            ${grandTotal.toFixed(2)}
          </h2>
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            onClick={() => navigate("/booking/step3/addons")}
            style={{ ...navButton, marginRight: "10px" }}
          >
            ← Back
          </button>

          <button onClick={handleNext} style={navButton}>
            Next →
          </button>
        </div>

      </div>
    </div>
  );
}