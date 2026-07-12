import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import ProgressBar from "../ProgressBar";
import { db } from "../firebase";
import { doc, getDoc } from "@firebase/firestore/lite";

export default function BookingStep2() {
  const navigate = useNavigate();
  const {
  bookingData,
  setBookingData,
  clearBooking,
} = useBooking();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [deliverySpeed, setDeliverySpeed] = useState("");
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState({});

  useEffect(() => {
    async function loadSchedule() {
      try {
        const ref = doc(db, "admin", "schedule");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setSchedule(snap.data());
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
      }
    }

    loadSchedule();
  }, []);

  const availableDates = Object.keys(schedule)
    .filter((date) => schedule[date]?.enabled)
    .sort();

  const availableTimes = selectedDate
    ? schedule[selectedDate]?.slots || []
    : [];

  const deliveryTotal = deliverySpeed === "12" ? 25 : 0;
  const grandTotal = (bookingData.step1Total || 0) + deliveryTotal;

  function formatDateLabel(dateString) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function parseTimeString(timeString) {
    const match = timeString.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;

    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    const modifier = match[3].toUpperCase();

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return { hours, minutes };
  }

  function getEstimatedDelivery() {
    if (!selectedDate || !selectedTime || !deliverySpeed) return "";

    const parsedTime = parseTimeString(selectedTime);
    if (!parsedTime) return "Invalid time format";

    const deliveryDate = new Date(`${selectedDate}T00:00:00`);
    deliveryDate.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);

    const addHours = deliverySpeed === "12" ? 12 : 24;
    deliveryDate.setHours(deliveryDate.getHours() + addHours);

    const deliveryDay = deliveryDate.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    const deliveryTime = deliveryDate.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit"
    });

    return `${deliveryDay} by ${deliveryTime}`;
  }

  function clearForm() {
  setSelectedDate("");
  setSelectedTime("");
  setDeliverySpeed("");
  setError("");


}

  function handleNext() {
    if (!selectedDate || !selectedTime || !deliverySpeed) {
      setError("Please select a date, time, and delivery speed.");
      return;
    }

    setError("");

    setBookingData({
      ...bookingData,
      pickupDate: selectedDate,
      pickupTime: selectedTime,
      deliverySpeed,
      step2Total: deliveryTotal,
      grandTotal
    });

    navigate("/booking/step3/contact");
  }

  const card = {
    background: "white",
    padding: "20px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  };

  const optionCard = (selected, value) => ({
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    margin: "8px",
    minWidth: "120px",
    backgroundColor: selected === value ? "#2563eb" : "#dbeafe",
    color: selected === value ? "white" : "#1e3a8a",
    cursor: "pointer"
  });

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
        display: "flex",
        justifyContent: "center",
        padding: "30px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <ProgressBar step={2} />

        <h2 style={{ textAlign: "center", color: "#1e3a8a" }}>
          Step 2: Pickup Schedule
        </h2>

        <div style={card}>
          <h3>Available Pickup Dates</h3>

          {availableDates.length === 0 ? (
            <p>No available dates set by admin yet.</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center"
              }}
            >
              {availableDates.map((date) => (
                <button
                  key={date}
                  onClick={() => {
                    setSelectedDate(date);
                    setSelectedTime("");
                  }}
                  style={optionCard(selectedDate, date)}
                >
                  {formatDateLabel(date)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3>Available Pickup Times</h3>

          {!selectedDate ? (
            <p>Select a date first</p>
          ) : availableTimes.length === 0 ? (
            <p>No available times for this date</p>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center"
              }}
            >
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  style={optionCard(selectedTime, time)}
                >
                  {time}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={card}>
          <h3>Delivery Speed</h3>

          <button
            onClick={() => setDeliverySpeed("24")}
            style={optionCard(deliverySpeed, "24")}
          >
            24 Hour Service (Included)
          </button>

          <button
            onClick={() => setDeliverySpeed("12")}
            style={optionCard(deliverySpeed, "12")}
          >
            12 Hour Service (+$25)
          </button>
        </div>

        <div style={card}>
          <h3>Order Summary</h3>
          <p>
            Laundry Services Total: $
            {(bookingData.step1Total || 0).toFixed(2)}
          </p>
          <p>Delivery Total: ${deliveryTotal.toFixed(2)}</p>
          <h3 style={{ color: "#1e3a8a" }}>
            Grand Total: ${grandTotal.toFixed(2)}
          </h3>
        </div>

        {selectedDate && selectedTime && deliverySpeed && (
          <div style={card}>
            <h3>Estimated Delivery</h3>
            <p style={{ fontSize: "18px", color: "#1e3a8a" }}>
              {getEstimatedDelivery()}
            </p>
          </div>
        )}

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>
            {error}
          </p>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
  <button
    onClick={() => navigate("/")}
    style={{
      ...navButton,
      marginRight: "10px",
      backgroundColor: "#6b7280"
    }}
  >
    ← Back
  </button>

<button
  onClick={() => {
    if (
      window.confirm(
        "Are you sure? This will clear the entire Pickup Schedule booking page?"
      )
    ) {
      clearForm();
    }
  }}
  style={{
    padding: "12px 20px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
    marginRight: "10px"
  }}
>
  Clear Form
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