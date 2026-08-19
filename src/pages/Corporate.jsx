import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "@firebase/firestore/lite";


export default function Corporate() {
    const [companyName, setCompanyName] = useState("");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [weeklyVolume, setWeeklyVolume] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
  
async function handleSubmit(e) {
  e.preventDefault();

  try {
    await addDoc(
      collection(db, "corporateLeads"),
      {
        companyName,
        contactName,
        phone,
        email,
        businessType,
        weeklyVolume,
        message,
        createdAt: new Date().toISOString()
      }
    );

    setSubmitted(true);
  } catch (error) {
    console.error(
      "Error saving corporate lead:",
      error
    );

    alert(
      "Unable to submit request. Please try again."
    );
  }
}

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f9ff",
        padding: "40px",
        textAlign: "center"
      }}
    >
      <h1 style={{ color: "#1e3a8a" }}>
        Corporate Laundry Solutions
      </h1>

      <p
        style={{
          maxWidth: "700px",
          margin: "20px auto",
          fontSize: "18px"
        }}
      >
        Laundry services for Airbnb hosts,
        hotels, medical offices, gyms,
        restaurants, and local businesses.
      </p>

      {submitted ? (
  <div style={{ marginTop: "30px" }}>
    <h2 style={{ color: "#16a34a" }}>
      Thank You!
    </h2>

    <p>
      Your request has been submitted.
      We'll contact you soon.
    </p>
  </div>
) : (
  <form
    onSubmit={handleSubmit}
    style={{
      maxWidth: "600px",
      margin: "30px auto",
      display: "flex",
      flexDirection: "column",
      gap: "12px"
    }}
  >
    <input
      placeholder="Company Name"
      value={companyName}
      onChange={(e) =>
        setCompanyName(e.target.value)
      }
    />

    <input
      placeholder="Contact Name"
      value={contactName}
      onChange={(e) =>
        setContactName(e.target.value)
      }
    />

    <input
      placeholder="Phone Number"
      value={phone}
      onChange={(e) =>
        setPhone(e.target.value)
      }
    />

    <input
      placeholder="Email"
      value={email}
      onChange={(e) =>
        setEmail(e.target.value)
      }
    />

    <input
      placeholder="Business Type"
      value={businessType}
      onChange={(e) =>
        setBusinessType(e.target.value)
      }
    />

    <select
      value={weeklyVolume}
      onChange={(e) =>
        setWeeklyVolume(e.target.value)
      }
    >
      <option value="">
        Estimated Weekly Volume
      </option>
      <option value="Under 10 lbs">
        Under 10 lbs
      </option>
      <option value="10-50 lbs">
        10-50 lbs
      </option>
      <option value="50-100 lbs">
        50-100 lbs
      </option>
      <option value="100+ lbs">
        100+ lbs
      </option>
    </select>

    <textarea
      rows="5"
      placeholder="Tell us about your business and laundry needs"
      value={message}
      onChange={(e) =>
        setMessage(e.target.value)
      }
    />

    <button
      type="submit"
      style={{
        backgroundColor: "#2563eb",
        color: "white",
        border: "none",
        padding: "12px",
        borderRadius: "8px",
        cursor: "pointer"
      }}
    >
      Request Consultation
    </button>
  </form>
)}
    </div>
  );
}