import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "@firebase/firestore/lite";
import { useNavigate } from "react-router-dom";

export default function Corporate() {
    const [companyName, setCompanyName] = useState("");
    const [contactName, setContactName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [businessType, setBusinessType] = useState("");
    const [weeklyVolume, setWeeklyVolume] = useState("");
    const [message, setMessage] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

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
        status: "New",
        lastContactDate: "",
        nextFollowUpDate: "",
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

        <div
  style={{
    maxWidth: "900px",
    margin: "40px auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px"
  }}
>
  {[
    "Airbnb & Vacation Rentals",
    "Hotels & Motels",
    "Medical Offices",
    "Fitness Studios",
    "Restaurants",
    "Salons & Spas",
    "Sports Teams"
  ].map((industry) => (
    
    <div
  key={industry}
  onClick={() =>
  navigate(
    `/corporate/${industry
      .toLowerCase()
      .replace(/ & /g, "-")
      .replace(/\s+/g, "-")}`
  )
}
  style={{
    background: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    cursor: "pointer",
    textAlign: "center",
    fontWeight: "600"
  }}
>
  {industry}
</div>
  ))}
</div>

<div
  style={{
    maxWidth: "900px",
    margin: "40px auto",
    background: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  }}
>
  <h2 style={{ color: "#1e3a8a" }}>
    Why Hustle & Fold?
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginTop: "20px"
    }}
  >
    <div>✅ Scheduled Pickup & Delivery</div>
    <div>✅ Flexible Service Plans</div>
    <div>✅ Fast Turnaround Times</div>
    <div>✅ Dedicated Account Support</div>
    <div>✅ Volume Pricing Available</div>
    <div>✅ Reliable Local Service</div>
  </div>
</div>

<div
  style={{
    maxWidth: "900px",
    margin: "40px auto",
    textAlign: "center"
  }}
>
  <h2 style={{ color: "#1e3a8a" }}>
    Let's Build a Laundry Solution for Your Business
  </h2>

  <p
    style={{
      fontSize: "18px",
      maxWidth: "700px",
      margin: "15px auto"
    }}
  >
    Whether you need weekly linen service,
    vacation rental turnovers, towel service,
    or a custom laundry plan, our team can
    create a solution tailored to your needs.
  </p>

  <p
    style={{
      fontWeight: "bold",
      color: "#2563eb"
    }}
  >
    Request a consultation below and we'll
    contact you to discuss pricing, pickup
    schedules, and service options.
  </p>
</div>

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