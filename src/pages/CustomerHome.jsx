import { useNavigate } from "react-router-dom";
import logo from "../assets/HF Logo.png";

export default function CustomerHome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f9ff",
        padding: "30px"
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
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

        <h1
          style={{
            color: "#1e3a8a",
            marginBottom: "10px"
          }}
        >
          Built for busy lives.
        </h1>

        <h2>Welcome to Hustle & Fold</h2>

        <p
          style={{
            fontSize: "18px",
            color: "#555",
            maxWidth: "700px",
            margin: "0 auto 30px auto"
          }}
        >
          Professional pickup, wash, fold, and delivery laundry service
          designed around your schedule.
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "40px"
          }}
        >
          <button
            onClick={() => navigate("/booking/step1")}
            style={{
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "18px 30px",
              fontSize: "18px",
              cursor: "pointer",
              minWidth: "240px"
            }}
          >
            Start New Order
          </button>

          <button
            style={{
              backgroundColor: "#1f2937",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "18px 30px",
              fontSize: "18px",
              cursor: "pointer",
              minWidth: "240px"
            }}
          >
            Customer Login
          </button>

          <button
            style={{
              backgroundColor: "#059669",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "18px 30px",
              fontSize: "18px",
              cursor: "pointer",
              minWidth: "240px"
            }}
          >
            Create Account
          </button>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            textAlign: "left"
          }}
        >
          <div
  style={{
    backgroundColor: "#1e3a8a",
    color: "white",
    padding: "40px 30px",
    borderRadius: "20px",
    textAlign: "center",
    marginBottom: "25px"
  }}
>
  <h2 style={{ margin: "0 0 15px 0" }}>
    Laundry Done For You
  </h2>

  <p
    style={{
      fontSize: "18px",
      margin: 0,
      lineHeight: "1.6"
    }}
  >
    Luxury Laundry Care Designed Around Your Life.
    <br />
    <br />
    Too busy? Let us handle the laundry so you don't have to.
    Save hours every week while enjoying professionally cleaned,
    folded, and delivered laundry.
  </p>
</div>

<div
  style={{
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "25px"
  }}
>

    <div
  style={{
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    flex: "1",
    minWidth: "300px",
    maxWidth: "450px",
    textAlign: "center"
  }}
>
    
  <h2 style={{ color: "#1e3a8a", marginTop: 0 }}>
    About Hustle & Fold Laundry
  </h2>

  <p style={{ lineHeight: "1.8", color: "#444" }}>
    Proudly owned and operated by a local mom who understands the
    demands of a busy life. Hustle & Fold was created to provide a
    reliable, professional laundry service that gives families,
    professionals, and busy individuals more time to focus on what
    matters most.
  </p>
</div>

<div
  style={{
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    flex: "1",
    minWidth: "300px",
    maxWidth: "450px",
    textAlign: "center"
  }}
>
  <h2 style={{ color: "#1e3a8a", marginTop: 0 }}>
    What We Offer
  </h2>

  <p style={{ lineHeight: "1.8", color: "#444" }}>
    From pickup to delivery, every order is handled with care,
    consistency, and attention to detail.
  </p>

  <ul
    style={{
      textAlign: "left",
      display: "inline-block",
      lineHeight: "2"
    }}
  >
    <li>Premium Wash, Dry & Fold Service</li>
    <li>Convenient Pickup & Delivery</li>
    <li>Same-Day & Next-Day Turnaround Options</li>
    <li>Care for Delicates & Specialty Items</li>
    <li>Professionally Organized Folding</li>
  </ul>
</div>
</div>

<div
  style={{
    height: "6px",
    backgroundColor: "#1e3a8a",
    borderRadius: "999px",
    margin: "30px auto",
    maxWidth: "750px"
  }}
/>

<div
  style={{
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "25px"
  }}
>

    <div
  style={{
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    flex: "1",
    minWidth: "300px",
    maxWidth: "450px",
    textAlign: "center"
  }}
>
  <h2 style={{ color: "#1e3a8a", marginTop: 0 }}>
    Clean & Sanitized
    <br />
    Every Time
  </h2>

  <ul
    style={{
      textAlign: "left",
      display: "inline-block",
      lineHeight: "1.8"
    }}
  >
    <li>Washer drum, lid, and detergent compartments are disinfected between customers.</li>
    <li>Machines are regularly sanitized using hot-water cleaning cycles.</li>
    <li>Only one customer's laundry is washed at a time.</li>
    <li>Dryer drums are cleaned and lint traps cleared after every load.</li>
    <li>Fresh laundry bags are used for every order.</li>
  </ul>
</div>

<div
  style={{
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    flex: "1",
    minWidth: "300px",
    maxWidth: "450px",
    textAlign: "center"
  }}
>
  <h2 style={{ color: "#1e3a8a", marginTop: 0 }}>
    Extra Care We Take
  </h2>

  <ul
    style={{
      textAlign: "left",
      display: "inline-block",
      lineHeight: "1.8"
    }}
  >
    <li>Hands are washed or sanitized before handling every order.</li>
    <li>High-quality detergent is used for a thorough clean.</li>
    <li>Special instructions and garment care requests are always followed.</li>
  </ul>
</div>

</div>

<div
  style={{
    height: "6px",
    backgroundColor: "#1e3a8a",
    borderRadius: "999px",
    margin: "30px auto",
    maxWidth: "750px"
  }}
/>

<div
  style={{
    display: "flex",
    gap: "25px",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: "25px"
  }}
>

    <div
  style={{
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    flex: "1",
    minWidth: "300px",
    maxWidth: "450px",
    textAlign: "center"
  }}
>
  <h2 style={{ color: "#1e3a8a", marginTop: 0 }}>
    Our Promise
  </h2>

  <p
    style={{
      lineHeight: "1.8",
      color: "#444"
    }}
  >
    Your laundry is handled in a clean, controlled environment with
    attention to detail every step of the way.
  </p>

  <p
    style={{
      lineHeight: "1.8",
      color: "#444",
      marginBottom: 0
    }}
  >
    Equipment is sanitized regularly using hot-water cycles and
    disinfecting solutions to help eliminate bacteria, residue, and
    unwanted odors.
  </p>
</div>

<div
  style={{
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "20px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    flex: "1",
    minWidth: "300px",
    maxWidth: "450px",
    textAlign: "center"
  }}
>
  <h2 style={{ color: "#1e3a8a", marginTop: 0 }}>
    Perfect For
  </h2>

  <ul
    style={{
      textAlign: "left",
      display: "inline-block",
      lineHeight: "2"
    }}
  >
    <li>Busy Families</li>
    <li>Working Professionals</li>
    <li>Parents Juggling It All</li>
    <li>Anyone Who Wants Their Time Back</li>
  </ul>
</div>

</div>

<div
  style={{
    height: "6px",
    backgroundColor: "#1e3a8a",
    borderRadius: "999px",
    margin: "30px auto",
    maxWidth: "750px"
  }}
/>

<p
  style={{
    textAlign: "center",
    color: "#1e3a8a",
    fontWeight: "600",
    marginTop: "40px",
    fontSize: "18px"
  }}
>
  Built for busy lives.
</p>

<div
  style={{
    height: "6px",
    backgroundColor: "#1e3a8a",
    borderRadius: "999px",
    margin: "30px auto",
    maxWidth: "750px"
  }}
/>

<p style={{ textAlign: "center" }}>
  <a
    href="mailto:hustleandfoldlaundry@gmail.com"
    style={{
      textAlign: "center",
      color: "#1e3a8a",
      fontWeight: "600",
      textDecoration: "underline"
    }}
  >
    <strong>Contact us</strong>
  </a>{" "}
  for assistance with orders, scheduling, or service availability.
</p>

          <p style={{ textAlign: "center" }}>
            <strong>Service Area:</strong> Murrieta, Temecula, Menifee and
            surrounding communities.
          </p>
        </div>
        </div>
      </div>
  );
}