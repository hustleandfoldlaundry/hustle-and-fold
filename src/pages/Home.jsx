import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Welcome to Hustle & Fold</h2>
      <p>Schedule your laundry pickup with ease.</p>

      <br />

      <Link to="/booking/step1">
        <button style={{ padding: "10px 20px" }}>
          Start Booking
        </button>
      </Link>
    </div>
  );
}