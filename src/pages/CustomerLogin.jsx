import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/HF Logo.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function CustomerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
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
          maxWidth: "500px",
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
  Customer Login
</h1>

        <p style={{ color: "#555" }}>
          Sign in to manage your orders and account.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "20px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            boxSizing: "border-box"
          }}
        />

        <button
  onClick={async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login successful!");

    } catch (err) {
      alert("Invalid email or password.");
    }
  }}
  style={{
            width: "100%",
            marginTop: "20px",
            padding: "14px",
            backgroundColor: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          Sign In
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