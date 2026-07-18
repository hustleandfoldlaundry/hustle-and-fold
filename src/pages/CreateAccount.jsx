import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/HF Logo.png";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { db } from "../firebase";
import { doc, setDoc } from "@firebase/firestore/lite";


export default function CreateAccount() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f9ff",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px"
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
          maxWidth: "600px",
          width: "100%",
          textAlign: "center"
        }}
      >
        <img
                  src={logo}
                  alt="Hustle & Fold Logo"
                  style={{
                    width: "400px",
                    marginBottom: "10px"
                  }}
                  />

        <h1 style={{ color: "#1e3a8a" }}>
          Create Your Account
        </h1>

        <p style={{ color: "#555" }}>
          Create an account to manage orders, schedule pickups,
          and save your information for future bookings.
        </p>

        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          style={inputStyle}
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        <button
  onClick={async () => {
    try {
      const userCredential =
  await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await setDoc(
  doc(db, "customers", userCredential.user.uid),
  {
    firstName,
    lastName,
    email,
    phone,
    createdAt: new Date().toISOString()
  }
);

      alert("Account created successfully!");

      navigate("/customer-login");
    } catch (err) {
      alert(err.message);
    }
  }}
  style={{
            width: "100%",
            marginTop: "20px",
            padding: "14px",
            backgroundColor: "#059669",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Create Account
        </button>

        <button
          onClick={() => navigate("/customer")}
          style={{
            marginTop: "15px",
            background: "none",
            border: "none",
            color: "#1e3a8a",
            cursor: "pointer"
          }}
        >
          ← Back to Customer Home
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "15px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  boxSizing: "border-box"
};