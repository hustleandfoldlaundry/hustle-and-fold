import { useNavigate } from "react-router-dom";
import logo from "../assets/HF Logo.png";

export default function Home() {
  const navigate = useNavigate();

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
          maxWidth: "800px",
          width: "100%",
          textAlign: "center",
          backgroundColor: "white",
          padding: "40px 30px",
          borderRadius: "18px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.1)"
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

        <h1
          style={{
            color: "#1e3a8a",
            marginBottom: "10px"
          }}
        >
          Built for busy lives.
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "18px",
            marginBottom: "35px"
          }}
        >
          Professional pickup, wash, fold, and delivery laundry service.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap"
          }}
        >
          <button
            onClick={() => navigate("/customer")}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "18px 30px",
              fontSize: "18px",
              cursor: "pointer",
              minWidth: "230px"
            }}
          >
            Customers Enter Here
          </button>

          <button
            onClick={() => navigate("/admin")}
            style={{
              backgroundColor: "#1f2937",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "18px 30px",
              fontSize: "18px",
              cursor: "pointer",
              minWidth: "230px"
            }}
          >
            Admin Enter Here
          </button>
        </div>
      </div>
    </div>
  );
}