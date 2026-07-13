import { useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "@firebase/firestore/lite";
import AdminNav from "../components/AdminNav";

export default function AdminSchedule() {
  const [selectedDate, setSelectedDate] = useState("");
  const [schedule, setSchedule] = useState({});
  const [activeTab, setActiveTab] = useState("Schedule");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [maxBookingsPerSlot, setMaxBookingsPerSlot] =
  useState(3);

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

    loadSchedule();
  }, []);

  function formatDateLabel(dateString) {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function addDate() {
    if (!selectedDate) return;

    setSchedule((prev) => {
      if (prev[selectedDate]) return prev;

      return {
        ...prev,
        [selectedDate]: {
          enabled: true,
          slots: []
        }
      };
    });

    setSelectedDate("");
  }

  function generateDates(totalDays) {
    const today = new Date();

    setSchedule((prev) => {
      const updated = { ...prev };

      for (let i = 0; i < totalDays; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");

        const key = `${yyyy}-${mm}-${dd}`;

        if (!updated[key]) {
          updated[key] = {
            enabled: true,
            slots: []
          };
        }
      }

      return updated;
    });
  }

  function toggleDate(date) {
    setSchedule((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        enabled: !prev[date].enabled
      }
    }));
  }

  function toggleSlot(date, slot) {
    setSchedule((prev) => {
      const existing = prev[date]?.slots || [];
      const exists = existing.includes(slot);

      return {
        ...prev,
        [date]: {
          ...prev[date],
          slots: exists
            ? existing.filter((s) => s !== slot)
            : [...existing, slot]
        }
      };
    });
  }

  function deleteDate(date) {
    setSchedule((prev) => {
      const updated = { ...prev };
      delete updated[date];
      return updated;
    });
  }

  async function saveSchedule() {
    try {
      await setDoc(doc(db, "admin", "schedule"), {
  ...schedule,
  deliveryNote,
  maxBookingsPerSlot
});

      alert("Schedule saved ✅");
    } catch (err) {
      console.error(err);
    }
  }

  const sortedDates = Object.keys(schedule).sort();

  const pageStyle = {
    minHeight: "100vh",
    background: "#f5f9ff",
    padding: "30px"
  };

  // ✅ keeps your layout centered like dashboard
  const containerStyle = {
    maxWidth: "850px",
    margin: "0 auto",
    textAlign: "center"
  };

  const card = {
    background: "white",
    padding: "20px",
    marginTop: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  };

  const buttonStyle = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer"
  };

  const dangerButton = {
    ...buttonStyle,
    backgroundColor: "#dc2626"
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* ✅ REUSABLE NAV */}
        <AdminNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <h2 style={{ marginTop: "20px", color: "#1e3a8a" }}>
          Admin Schedule
        </h2>

        <div style={card}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />

          <button onClick={addDate} style={buttonStyle}>
            Add Date
          </button>

          <button
            onClick={() => generateDates(30)}
            style={{ ...buttonStyle, marginLeft: "10px" }}
          >
            Generate 30 Days
          </button>
        </div>

        {sortedDates.map((date) => (
          <div key={date} style={card}>
            <h3>{formatDateLabel(date)}</h3>

            <button
              onClick={() => toggleDate(date)}
              style={{
                ...buttonStyle,
                backgroundColor: schedule[date].enabled
                  ? "#16a34a"
                  : "#dc2626"
              }}
            >
              {schedule[date].enabled ? "Enabled" : "Disabled"}
            </button>

            <button
              onClick={() => deleteDate(date)}
              style={{ ...dangerButton, marginLeft: "10px" }}
            >
              Delete
            </button>

            {schedule[date].enabled && (
              <div style={{ marginTop: "15px" }}>
                {[
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
  "7:00 PM",
  "8:00 PM",
  "9:00 PM"
].map((time) => (
                  <button
                    key={time}
                    onClick={() => toggleSlot(date, time)}
                    style={{
                      margin: "5px",
                      background:
                        schedule[date].slots.includes(time)
                          ? "#2563eb"
                          : "#dbeafe",
                      color:
                        schedule[date].slots.includes(time)
                          ? "white"
                          : "#1e3a8a",
                      padding: "8px",
                      borderRadius: "6px"
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

<div style={{ marginTop: "20px" }}>
  <h3>Delivery Note</h3>

  <textarea
    value={deliveryNote}
    onChange={(e) =>
      setDeliveryNote(e.target.value)
    }
    placeholder="This note appears under Estimated Delivery on Booking Step 2"
    style={{
      width: "100%",
      minHeight: "80px",
      padding: "10px",
      borderRadius: "8px"
    }}
  />
</div>

<div style={{ marginTop: "20px" }}>
  <h3>Max Bookings Per Slot</h3>

  <input
    type="number"
    min="1"
    value={maxBookingsPerSlot}
    onChange={(e) =>
      setMaxBookingsPerSlot(
        Number(e.target.value)
      )
    }
    style={{
      width: "100%",
      padding: "10px",
      borderRadius: "8px"
    }}
  />
</div>

        <button
          onClick={saveSchedule}
          style={{ ...buttonStyle, marginTop: "20px" }}
        >
          Save Schedule
        </button>

      </div>
    </div>
  );
}