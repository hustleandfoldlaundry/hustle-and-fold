import { useLocation, useNavigate } from "react-router-dom";

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId || "N/A";

  const card = {
    background: "white",
    padding: "30px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  };

  const buttonStyle = {
    padding: "12px 20px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer"
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f9ff",
        display: "flex",
        justifyContent: "center",
        padding: "30px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "500px" }}>
        <div style={card}>
          <h1 style={{ color: "#1e3a8a" }}>Order Confirmed ✅</h1>

          <p>Your laundry pickup request has been submitted.</p>

          <h2 style={{ marginTop: "15px", color: "#2563eb" }}>
            Order #: {orderId}
          </h2>

          <div style={{ marginTop: "20px" }}>
            <button onClick={() => navigate("/")} style={buttonStyle}>
              Back to Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}