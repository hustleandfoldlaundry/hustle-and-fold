import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import ProgressBar from "../ProgressBar";
import Step3Progress from "../Step3Progress";

export default function BookingStep3Contact() {
const navigate = useNavigate();
const { bookingData, setBookingData, clearBooking, } = useBooking();
const [name, setName] = useState(bookingData.name || "");
const [address, setAddress] = useState(bookingData.address || "");
const [city, setCity] = useState(bookingData.city || "");
const [zip, setZip] = useState(bookingData.zip || "");
const [unit, setUnit] = useState(bookingData.unit || "");
const [phone, setPhone] = useState(bookingData.phone || "");
const [email, setEmail] = useState(bookingData.email || "");
const [differentDeliveryAddress, setDifferentDeliveryAddress] = useState(false);
const [deliveryAddress, setDeliveryAddress] = useState("");
const [deliveryCity, setDeliveryCity] = useState("");
const [deliveryZip, setDeliveryZip] = useState("");
const [deliveryUnit, setDeliveryUnit] = useState("");
const [error, setError] = useState("");
const allowedZips = ["92562","92563","92564","92584","92585","92586","92587","92596","92590","92591","92592","92593","92543","92544","92545"];

function formatPhoneNumber(value) {
const numbers = value.replace(/\D/g, "").slice(0, 10);
if (numbers.length < 4) return numbers;
if (numbers.length < 7) return "(" + numbers.slice(0,3) + ") " + numbers.slice(3);
return "(" + numbers.slice(0,3) + ") " + numbers.slice(3,6) + "-" + numbers.slice(6);
}
function formatZip(value) {
return value.replace(/\D/g, "").slice(0, 5);
}
function isValidZip(value) {
return /^\d{5}$/.test(value);
}
function isServiceableZip(value) {
return allowedZips.includes(value);
}
function isValidEmail(value) {
return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(value);
}
console.log({
  name,
  address,
  city,
  phone,
  email,
  zip,
  validZip: isValidZip(zip),
  serviceableZip: isServiceableZip(zip),
  validEmail: isValidEmail(email)
});
const isFormValid =
name &&
address &&
city &&
phone &&
email &&
isValidZip(zip) &&
isServiceableZip(zip) &&
isValidEmail(email);

function clearForm() {
  setName("");
  setAddress("");
  setCity("");
  setZip("");
  setUnit("");
  setPhone("");
  setEmail("");
  setError("");
}

function handleNext() {
if (!isFormValid) {
setError("Please complete all required fields correctly.");
return;
}
setError("");

setBookingData({
  ...bookingData,
  name,
  address,
  city,
  stateValue: "CA",
  zip,
  unit,

  deliveryAddress,
  deliveryCity,
  deliveryZip,
  deliveryUnit,
  differentDeliveryAddress,

  phone,
  email
});

navigate("/booking/step3/detergent");

}
const card = {
background: "white",
padding: "20px",
marginTop: "20px",
borderRadius: "12px",
boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
display: "flex",
flexDirection: "column",
alignItems: "center"
};
const inputStyle = {
width: "90%",
padding: "10px",
marginTop: "10px",
borderRadius: "8px",
border: "1px solid #ccc"
};
const rowStyle = {
  display: "flex",
  gap: "5px",
  width: "90%",
  marginTop: "10px",
  marginLeft: "5%",
  alignItems: "stretch"
};
const cityInput = {
  width: "60%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const zipInput = {
  width: "20%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc"
};

const navButton = {
padding: "12px 20px",
borderRadius: "8px",
border: "none",
color: "white"
};
const errorStyle = {
color: "red",
fontSize: "12px",
marginTop: "4px",
width: "90%",
textAlign: "left"
};
return (
<div style={{ minHeight: "100vh", backgroundColor: "#f5f9ff", padding: "30px" }}>
<div style={{ maxWidth: "500px", margin: "0 auto", textAlign: "center" }}>


    <h2 style={{ color: "#1e3a8a" }}>Contact Information</h2>

    <div style={card}>

      <input placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      {!name && <p style={errorStyle}>Required</p>}

<label
  style={{
    display: "block",
    marginTop: "15px",
    marginBottom: "10px"
  }}
>
  <input
    type="checkbox"
    checked={differentDeliveryAddress}
    onChange={(e) =>
      setDifferentDeliveryAddress(e.target.checked)
    }
    style={{ marginRight: "8px" }}
  />
  Delivery address is different from pickup address
</label>

      <input placeholder="Pickup Address" value={address} onChange={(e) => setAddress(e.target.value)} style={inputStyle} />
      {!address && <p style={errorStyle}>Required</p>}

      <div style={rowStyle}>
  <input
    placeholder="City"
    value={city}
    onChange={(e) => setCity(e.target.value)}
    style={cityInput}
  />

  <input
    placeholder="ZIP"
    value={zip}
    onChange={(e) => setZip(formatZip(e.target.value))}
    style={zipInput}
  />
</div>

      {(!city || !zip) && <p style={errorStyle}>City and ZIP required</p>}
      {zip && !isValidZip(zip) && <p style={errorStyle}>ZIP must be 5 digits</p>}
      {zip && isValidZip(zip) && !isServiceableZip(zip) && (
        <p style={errorStyle}>We do not service this area</p>
      )}

      <input placeholder="Apt / Unit / Gate Code (Optional)" value={unit} onChange={(e) => setUnit(e.target.value)} style={inputStyle} />

{differentDeliveryAddress && (
  <>
    <h3 style={{ marginTop: "20px" }}>
      Delivery Address
    </h3>

    <input
      placeholder="Delivery Address"
      value={deliveryAddress}
      onChange={(e) =>
        setDeliveryAddress(e.target.value)
      }
      style={inputStyle}
    />

    <div style={rowStyle}>
      <input
        placeholder="City"
        value={deliveryCity}
        onChange={(e) =>
          setDeliveryCity(e.target.value)
        }
        style={cityInput}
      />

      <input
        placeholder="ZIP"
        value={deliveryZip}
        onChange={(e) =>
          setDeliveryZip(
            formatZip(e.target.value)
          )
        }
        style={zipInput}
      />

      {deliveryZip &&
  !isValidZip(deliveryZip) && (
    <p style={errorStyle}>
      ZIP must be 5 digits
    </p>
)}

{deliveryZip &&
  isValidZip(deliveryZip) &&
  !isServiceableZip(deliveryZip) && (
    <p style={errorStyle}>
      We do not service this area
    </p>
)}
    </div>

    <input
      placeholder="Apt / Unit / Gate Code (Optional)"
      value={deliveryUnit}
      onChange={(e) =>
        setDeliveryUnit(e.target.value)
      }
      style={inputStyle}
    />
  </>
)}

      <input placeholder="Phone Number" value={phone} onChange={(e) => setPhone(formatPhoneNumber(e.target.value))} style={inputStyle} />
      {!phone && <p style={errorStyle}>Required</p>}

      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      {!email && <p style={errorStyle}>Required</p>}
      {email && !isValidEmail(email) && <p style={errorStyle}>Invalid email</p>}

    </div>

    <div style={card}>
      <h3>Grand Total</h3>
      <h2 style={{ color: "#1e3a8a" }}>
        ${(bookingData.grandTotal || 0).toFixed(2)}
      </h2>
    </div>

    {error && <p style={{ color: "red" }}>{error}</p>}

    <div
  style={{
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "10px"
  }}
>
  <button
    onClick={() => navigate("/booking/step2")}
    style={{
      ...navButton,
      backgroundColor: "#6b7280"
    }}
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
      cursor: "pointer"
    }}
  >
    Clear Form
  </button>

  <button
    onClick={handleNext}
    disabled={!isFormValid}
    style={{
      ...navButton,
      backgroundColor: isFormValid ? "#2563eb" : "#9ca3af",
      cursor: isFormValid ? "pointer" : "not-allowed"
    }}
  >
    Next →
  </button>
</div>

  </div>
</div>

);
}