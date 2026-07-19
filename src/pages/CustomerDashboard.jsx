import { useNavigate } from "react-router-dom";
import logo from "../assets/HF Logo.png";
import { auth } from "../firebase";
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, collection, getDocs } from "@firebase/firestore/lite";
import { db } from "../firebase";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

export default function CustomerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [preferredDetergent, setPreferredDetergent] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [oxiClean, setOxiClean] = useState(false);
  const [colorSaver, setColorSaver] = useState(false);
  const [vinegarRinse, setVinegarRinse] = useState(false);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(
  auth,
  (currentUser) => {
    setUser(currentUser);
  }
);
    async function loadCustomer() {
    if (!user) return;

    const docRef = doc(db, "customers", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
  const data = docSnap.data();

  setCustomer(data);

  setPreferredDetergent(
    data.preferredDetergent || ""
  );

  setSpecialInstructions(
    data.specialInstructions || ""
  );

setOxiClean(data.oxiClean || false);

setColorSaver(data.colorSaver || false);

setVinegarRinse(data.vinegarRinse || false);

setPickupAddress(data.pickupAddress || "");

setDeliveryAddress(data.deliveryAddress || "");

const ordersSnapshot = await getDocs(
  collection(db, "orders")
);

const customerOrders = ordersSnapshot.docs
  .map((doc) => ({
    id: doc.id,
    ...doc.data()
  }))
  .filter(
    (order) =>
      order.email?.toLowerCase() ===
      user.email?.toLowerCase()
  );

setOrders(customerOrders);

}}

  loadCustomer();
  return () => unsubscribe();
}, [user]);

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
          maxWidth: "1100px",
          margin: "0 auto"
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "20px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
            textAlign: "center",
            marginBottom: "25px"
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
            Customer Dashboard
          </h1>

          <p>
  Welcome back, {customer?.firstName || "Customer"}!
</p>

<div
          style={{
            textAlign: "center",
            marginTop: "30px"
          }}
        >
          <button
            onClick={() => navigate("/booking/step1")}
            style={{
              backgroundColor: "#1e3a8a",
              color: "white",
              border: "none",
              borderRadius: "12px",
              padding: "15px 30px",
              cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Start New Order
          </button>
          
        </div>
        <button
  onClick={async () => {
    await signOut(auth);
    navigate("/customer");
  }}
  style={{
    marginTop: "15px",
    padding: "10px 20px",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Logout
</button>
        </div>
        <div
          style={{
            display: "flex",
            gap: "25px",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              flex: "1",
              minWidth: "300px"
            }}
          >
            <h2 style={{ color: "#1e3a8a" }}>
              Upcoming Orders
            </h2>

            <p>No upcoming orders.</p>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              flex: "1",
              minWidth: "300px"
            }}
          >
            <h2 style={{ color: "#1e3a8a" }}>
              Order History
            </h2>

<p>
  Logged in as: {user?.email}
</p>

<p>
  Orders found: {orders.length}
</p>


            {orders.length === 0 ? (
  <p>No previous orders.</p>
) : (
  orders.map((order, index) => (
    <div
      key={index}
      style={{
        padding: "10px",
        marginBottom: "10px",
        border: "1px solid #e5e7eb",
        borderRadius: "8px"
      }}
    >
      <p>
        <strong>Date:</strong> {order.pickupDate}
      </p>

      <p>
        <strong>Status:</strong> {order.status}
      </p>

      <p>
  <strong>Services:</strong>
</p>

<ul style={{ marginTop: "5px" }}>
  {order.washFold && <li>Wash & Fold</li>}
  {order.foldOnly && <li>Fold Only</li>}
</ul>

      <p>
  <strong>Total:</strong> ${order.grandTotal}
</p>

<button
  onClick={() =>
  navigate("/booking/step1", {
    state: { reorderData: order }
  })
}
  style={{
    marginTop: "10px",
    padding: "8px 16px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Reorder
</button>

    </div>
  ))
)}

          </div>
        </div>

        <div
          style={{
            height: "6px",
            backgroundColor: "#1e3a8a",
            borderRadius: "999px",
            margin: "30px auto",
            maxWidth: "300px"
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "25px",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              flex: "1",
              minWidth: "300px"
            }}
          >
            <h2 style={{ color: "#1e3a8a" }}>
              Laundry Preferences
            </h2>

            <p>
  <strong>Preferred Detergent:</strong>
</p>

<select
value={preferredDetergent}
onChange={(e) =>
  setPreferredDetergent(e.target.value)
}
  style={{
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "8px"
  }}
>
  <option>All Free & Clear</option>
  <option>Gain Original</option>
  <option>Tide Original</option>
  <option>All Sensitive Fresh (+$3.00)</option>
  <option>Tide Free & Gentle (+$3.00)</option>
  <option>Customer Provided (-$1.50)</option>
</select>

<p>
  <strong>Preferred Add-Ons:</strong>
</p>

<label>
<input
  type="checkbox"
  checked={oxiClean}
  onChange={(e) =>
    setOxiClean(e.target.checked)
  }
/> OxiClean
</label>
<br />

<label>
<input
  type="checkbox"
  checked={colorSaver}
  onChange={(e) =>
    setColorSaver(e.target.checked)
  }
/> Color Saver
</label>
<br />

<label>
<input
  type="checkbox"
  checked={vinegarRinse}
  onChange={(e) =>
    setVinegarRinse(e.target.checked)
  }
/> Vinegar Rinse
</label>

<p style={{ marginTop: "15px" }}>
  <strong>Special Instructions:</strong>
</p>

<textarea
value={specialInstructions}
onChange={(e) =>
  setSpecialInstructions(e.target.value)
}
  rows="4"
  placeholder="Ex: Hang dry delicate items, fragrance-free detergent only, etc."
  style={{
    width: "95%",
    padding: "10px",
    borderRadius: "8px",
    resize: "vertical"
  }}
/>

<button
  onClick={async () => {
    try {
      await updateDoc(
  doc(db, "customers", user.uid),
  {
    preferredDetergent,
    specialInstructions,
    oxiClean,
    colorSaver,
    vinegarRinse
  }
);

      alert("Preferences saved!");
    } catch (err) {
      alert(err.message);
    }
  }}
  style={{
    width: "100%",
    marginTop: "15px",
    padding: "12px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Save Preferences
</button>

          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "25px",
              borderRadius: "20px",
              boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
              flex: "1",
              minWidth: "300px"
            }}
          >
            <h2 style={{ color: "#1e3a8a" }}>
              Account Information
            </h2>

            <p>
  <strong>Name:</strong>{" "}
  {customer
    ? `${customer.firstName} ${customer.lastName}`
    : "Loading..."}
</p>

<p>
  <strong>Email:</strong>{" "}
  {customer?.email || "Loading..."}
</p>

<p>
  <strong>Phone:</strong>{" "}
  {customer?.phone || "Loading..."}
</p>


<textarea
value={pickupAddress}
onChange={(e) =>
  setPickupAddress(e.target.value)
}
  rows="3"
  placeholder="Enter pickup address"
  style={{
    width: "95%",
    padding: "10px",
    borderRadius: "8px",
    resize: "vertical",
    marginBottom: "15px"
  }}
/>

<p>
  <strong>Delivery Address:</strong>
</p>

<textarea
value={deliveryAddress}
onChange={(e) =>
  setDeliveryAddress(e.target.value)
}
  rows="3"
  placeholder="Enter delivery address"
  style={{
    width: "95%",
    padding: "10px",
    borderRadius: "8px",
    resize: "vertical"
  }}
/>

<button
  onClick={async () => {
    try {
      await updateDoc(
        doc(db, "customers", user.uid),
        {
          pickupAddress,
          deliveryAddress
        }
      );

      alert("Addresses saved!");
    } catch (err) {
      alert(err.message);
    }
  }}
  style={{
    width: "100%",
    marginTop: "15px",
    padding: "12px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Save Addresses
</button>

          </div>
        </div>
      </div>
    </div>
  );
}