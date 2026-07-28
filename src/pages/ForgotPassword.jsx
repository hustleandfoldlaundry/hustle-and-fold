import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

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
          padding: "30px",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ color: "#1e3a8a" }}>
          Reset Password
        </h1>

        <p>
          Enter your email address and we'll send
          you a password reset link.
        </p>

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "95%",
            padding: "12px",
            marginTop: "15px",
            borderRadius: "8px"
          }}
        />

        <button
          onClick={async () => {
            try {
              await sendPasswordResetEmail(
                auth,
                email
              );

              alert(
                "Password reset email sent!"
              );

              navigate("/customer-login");
            } catch (err) {
              alert(err.message);
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
            cursor: "pointer"
          }}
        >
          Send Reset Email
        </button>
      </div>
    </div>
  );
}