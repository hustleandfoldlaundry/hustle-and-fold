import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import ProgressBar from "../ProgressBar";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "@firebase/firestore/lite";

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
  const [orders, setOrders] = useState([]);
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] =
  useState(3);
  const [deliveryNote, setDeliveryNote] = useState("");

  useEffect(() => {
    async function loadSchedule() {
      try {
        const ref = doc(db, "admin", "schedule");
        const snap = await getDoc(ref);

        if (snap.exists()) {
  const data = snap.data();

  setSchedule(data);
  setDeliveryNote(data.deliveryNote || "");

  setMaxBookingsPerSlot(
  data.maxBookingsPerSlot || 3
);
}
      } catch (err) {
        console.error("Error loading schedule:", err);
      }
    }

      async function loadOrders() {
    try {
      const snapshot = await getDocs(
        collection(db, "orders")
      );

      setOrders(
        snapshot.docs.map((doc) => doc.data())
      );
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  }

  loadSchedule();
  loadOrders();
}, []);

  const today = new Date();
today.setHours(0, 0, 0, 0);

const availableDates = Object.keys(schedule)
  .filter((date) => {
    const scheduleDate = new Date(
      date + "T00:00:00"
    );

    return (
      schedule[date]?.enabled &&
      scheduleDate >= today
    );
  })
  .sort();
``

  const availableTimes = selectedDate
  ? (schedule[selectedDate]?.slots || []).filter(
      (time) => {
        const bookedCount = orders.filter(
          (order) =>
            order.pickupDate === selectedDate &&
            order.pickupTime === time
        ).length;

        if (bookedCount >= maxBookingsPerSlot) {
          return false;
        }

        const todayString = new Date()
          .toISOString()
          .split("T")[0];

        if (selectedDate !== todayString) {
          return true;
        }

        const parsed = parseTimeString(time);

        if (!parsed) return false;

        const slotTime = new Date();
        slotTime.setHours(
          parsed.hours,
          parsed.minutes,
          0,
          0
        );

        const cutoffTime = new Date();
        cutoffTime.setHours(
          cutoffTime.getHours() + 1
        );

        return slotTime > cutoffTime;
      }
    )
  : [];

  const availableDateObjects = availableDates.map(
  (date) => new Date(date + "T00:00:00")
);

const currentMonth =
  availableDateObjects.length > 0
    ? availableDateObjects[0]
    : new Date();

const firstDayOfMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth(),
  1
);

const daysInMonth = new Date(
  currentMonth.getFullYear(),
  currentMonth.getMonth() + 1,
  0
).getDate();

const startingDay = firstDayOfMonth.getDay();

const calendarDays = [];

for (let i = 0; i < startingDay; i++) {
  calendarDays.push(null);
}

for (let day = 1; day <= daysInMonth; day++) {
  calendarDays.push(day);
}

  const amTimes = availableTimes.filter((time) =>
  time.toUpperCase().includes("AM")
);

  const pmTimes = availableTimes.filter((time) =>
  time.toUpperCase().includes("PM")
);

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
  
  <div>
  <h3 style={{ textAlign: "center", color: "#1e3a8a" }}>
    {currentMonth.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    })}
  </h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "6px",
      marginTop: "10px",
      textAlign: "center"
    }}
  >
    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
      <div
        key={day}
        style={{
          fontWeight: "bold",
          color: "#1e3a8a",
          fontSize: "13px"
        }}
      >
        {day}
      </div>
    ))}

    {calendarDays.map((day, index) => {
      if (!day) {
        return <div key={`empty-${index}`} />;
      }

      const dateString = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      const isAvailable = availableDates.includes(dateString);
      const isSelected = selectedDate === dateString;

      return (
        <button
          key={dateString}
          disabled={!isAvailable}
          onClick={() => {
            if (!isAvailable) return;

            setSelectedDate(dateString);
            setSelectedTime("");
          }}
          style={{
            padding: "10px 0",
            borderRadius: "8px",
            border: "none",
            backgroundColor: isSelected
              ? "#2563eb"
              : isAvailable
              ? "#dbeafe"
              : "#e5e7eb",
            color: isSelected
              ? "white"
              : isAvailable
              ? "#1e3a8a"
              : "#9ca3af",
            cursor: isAvailable ? "pointer" : "not-allowed",
            fontWeight: isSelected ? "bold" : "normal"
          }}
        >
          {day}
        </button>
      );
    })}
  </div>
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
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px"
    }}
  >
    <div>
      <h4 style={{ textAlign: "center" }}>AM</h4>

      {amTimes.map((time) => (
        <button
          key={time}
          onClick={() => setSelectedTime(time)}
          style={{
            ...optionCard(selectedTime, time),
            width: "100%"
          }}
        >
          {time}
        </button>
      ))}
    </div>

    <div>
      <h4 style={{ textAlign: "center" }}>PM</h4>

      {pmTimes.map((time) => (
        <button
          key={time}
          onClick={() => setSelectedTime(time)}
          style={{
            ...optionCard(selectedTime, time),
            width: "100%"
          }}
        >
          {time}
        </button>
      ))}
    </div>
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

            {deliveryNote && (
  <p
    style={{
      marginTop: "10px",
      fontSize: "14px",
      color: "#666"
    }}
  >
    {deliveryNote}
  </p>
)}
          </div>
        )}

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>
            {error}
          </p>
        )}

        <div style={{ textAlign: "center", marginTop: "20px" }}>
  <button
    onClick={() => navigate("/booking/step1")}
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