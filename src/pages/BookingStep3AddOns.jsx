import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import ProgressBar from "../ProgressBar";
import Step3Progress from "../Step3Progress";
import { db } from "../firebase";
import { doc, getDoc } from "@firebase/firestore/lite";

export default function BookingStep3AddOns() {
  const navigate = useNavigate();
  const {
  bookingData,
  setBookingData,
  clearBooking,
} = useBooking();

  const [services, setServices] = useState({});

  const [addons, setAddons] = useState(
    bookingData.addons || {
      oxi: false,
      color: false,
      vinegar: false,
      delicates: false
    }
  );

  const [hangItems, setHangItems] = useState(
    bookingData.hangItems || 0
  );

function clearForm() {
  setAddons({
    oxi: false,
    color: false,
    vinegar: false,
    delicates: false
  });

  setHangItems(0);
}

  const [hangerOption, setHangerOption] = useState(
    bookingData.hangerOption || "provided"
  );

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
          "Error loading services:",
          error
        );
      }
    }

    loadServices();
  }, []);

  function toggle(name) {
    setAddons((prev) => ({
      ...prev,
      [name]: !prev[name]
    }));
  }

  const oxiPrice =
    Number(services?.addons?.oxi?.price || 4);

  const colorPrice =
    Number(services?.addons?.color?.price || 2);

  const vinegarPrice =
    Number(services?.addons?.vinegar?.price || 3);

  const delicatesPrice =
    Number(
      services?.addons?.delicates?.price || 5
    );

  const hangingPrice =
    Number(
      services?.hangingCare?.hanging?.pricePerItem ||
        0.25
    );

  const hangerPrice =
    Number(
      services?.hangingCare?.hangers
        ?.pricePerHanger || 1
    );

  const addonsTotal =
    (addons.oxi ? oxiPrice : 0) +
    (addons.color ? colorPrice : 0) +
    (addons.vinegar ? vinegarPrice : 0) +
    (addons.delicates ? delicatesPrice : 0);

  const hangingCareTotal =
    hangItems * hangingPrice;

  const hangerTotal =
    hangerOption === "needed"
      ? hangItems * hangerPrice
      : 0;

  const grandTotal =
    (bookingData.step1Total || 0) +
    (bookingData.step2Total || 0) +
    (bookingData.detergentTotal || 0) +
    addonsTotal +
    hangingCareTotal +
    hangerTotal;

  function handleNext() {
    setBookingData({
      ...bookingData,
      addons,
      hangItems,
      hangerOption,
      addonsTotal,
      hangingCareTotal,
      hangerTotal,
      grandTotal
    });

    navigate("/booking/step3/notes");
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

  const navButton = {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer"
  };

  const counterRow = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    marginTop: "10px"
  };

  const selectStyle = {
    width: "90%",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc"
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
          Add‑Ons
        </h2>

        <div style={card}>
          {services?.addons?.oxi?.active && (
  <label>
    <input
      type="checkbox"
      checked={addons.oxi}
      onChange={() =>
        toggle("oxi")
      }
    />{" "}
    OxiClean (+$
    {oxiPrice.toFixed(2)})
  </label>
)}

          <br />
          <br />

          {services?.addons?.color?.active && (
  <label>
    <input
      type="checkbox"
      checked={addons.color}
      onChange={() =>
        toggle("color")
      }
    />{" "}
    Color Saver (+$
    {colorPrice.toFixed(2)})
  </label>
)}
          <br />
          <br />

          {services?.addons?.vinegar?.active && (
  <label>
    <input
      type="checkbox"
      checked={addons.vinegar}
      onChange={() =>
        toggle("vinegar")
      }
    />{" "}
    Vinegar Rinse (+$
    {vinegarPrice.toFixed(2)})
  </label>
)}

          <br />
          <br />

          {services?.addons?.delicates?.active && (
  <label>
    <input
      type="checkbox"
      checked={addons.delicates}
      onChange={() =>
        toggle("delicates")
      }
    />{" "}
    Delicates Care (+$
    {delicatesPrice.toFixed(2)})
  </label>
)}
        </div>

        {services?.hangingCare?.hanging?.active && (
  <div style={card}>
    <h3>
      Hanging & Wardrobe Care
    </h3>

          <p>
            ${hangingPrice.toFixed(2)}
            {" "}per item
          </p>

          <div style={counterRow}>
            <button
              onClick={() =>
                setHangItems(
                  Math.max(
                    0,
                    hangItems - 1
                  )
                )
              }
            >
              -
            </button>

            <span>{hangItems}</span>

            <button
              onClick={() =>
                setHangItems(
                  hangItems + 1
                )
              }
            >
              +
            </button>
          </div>

          <select
            value={hangerOption}
            onChange={(e) =>
              setHangerOption(
                e.target.value
              )
            }
            style={selectStyle}
          >
            <option value="provided">
              Hangers Provided (Included)
            </option>

            <option value="needed">
              Hangers Needed (+$
              {hangerPrice.toFixed(2)}
              {" "}each)
            </option>
          </select>

          <p style={{ marginTop: "10px" }}>
            Total: $
            {(
              hangingCareTotal +
              hangerTotal
            ).toFixed(2)}
          </p>
        </div>
        )}
        <div style={card}>
          <h3>Grand Total</h3>

          <h2 style={{ color: "#1e3a8a" }}>
            ${grandTotal.toFixed(2)}
          </h2>
        </div>

        <div
          style={{
            textAlign: "center",
            marginTop: "20px"
          }}
        >
          <button
  onClick={() =>
    navigate(
      "/booking/step3/detergent"
    )
  }
  style={navButton}
>
  ← Back
</button>

<button
  onClick={() => {
    if (
      window.confirm(
        "Are you sure you want to clear this page?"
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
    margin: "0 10px"
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