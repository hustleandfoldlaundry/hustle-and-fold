import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
    localStorage.setItem("adminLoggedIn", "true");
      navigate("/admin/dashboard");
    } catch (err) {
      setError("Invalid email or password.");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f9ff"
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "white",
          padding: "30px",
          borderRadius: "12px",
          width: "350px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
        }}
      >
        <h2>Admin Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px"
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "10px"
          }}
        />

        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          style={{
            marginTop: "15px",
            padding: "12px",
            width: "100%",
            background: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "8px"
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}