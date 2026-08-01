import { useEffect, useMemo, useState } from "react";
import { db, storage } from "../firebase";
import { collection, getDocs, doc, updateDoc, setDoc, getDoc } from "@firebase/firestore/lite";import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminSchedule from "./AdminSchedule";
import AdminServices from "./AdminServices";

export default function AdminDashboard() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

if (!isLoggedIn) {
  return <Navigate to="/admin" replace />;
}
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Orders");
  const [savingId, setSavingId] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const [businessName, setBusinessName] = useState("Hustle & Fold");
  const [adminName, setAdminName] = useState("CeCe");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");

  const [businessAddress, setBusinessAddress] = useState("");
  const [serviceRadius, setServiceRadius] = useState("15");
  const [pickupHours, setPickupHours] = useState("");
  const [deliveryHours, setDeliveryHours] = useState("");

  const [businessTagline, setBusinessTagline] = useState( "Hustle hard. Fold with care." );

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#1e3a8a");
  
  const [newOrderNotifications, setNewOrderNotifications] = useState(true);
  const [customerMessageNotifications, setCustomerMessageNotifications] = useState(true);
  const [pickupReminderNotifications, setPickupReminderNotifications] = useState(true);

  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);

  const navigate = useNavigate();
  

  async function loadOrders() {
    try {
      const snapshot = await getDocs(collection(db, "orders"));

      const data = snapshot.docs.map((docItem) => {
        const order = docItem.data();

        const estimatedLbs =
          Number(order.washFoldLbs || 0) + Number(order.foldOnlyLbs || 0);

        return {
          id: docItem.id,
          ...order,
          deliveryDate: order.deliveryDate || "",
          deliveryTime: order.deliveryTime || "",
          status: order.status || "",
          tagColor: order.tagColor || "",
          paid: order.paid || false,
          archived: order.archived || false,
          finalWeight: order.finalWeight || estimatedLbs,
          finalCost: order.finalCost || Number(order.grandTotal || 0)
        };
      });

      setOrders(data.reverse());
      setOrders(data);

const customerSnapshot = await getDocs(
  collection(db, "customers")
);

const customerData = customerSnapshot.docs.map(
  (doc) => ({
    id: doc.id,
    ...doc.data()
  })
);

setCustomers(customerData);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(
        doc(db, "settings", "business")
      );

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();

        setBusinessName(data.businessName || "");
        setAdminName(data.adminName || "");
        setAdminEmail(data.adminEmail || "");
        setAdminPhone(data.adminPhone || "");
        setBusinessAddress(data.businessAddress || "");
        setServiceRadius(data.serviceRadius || "");
        setPickupHours(data.pickupHours || "");
        setDeliveryHours(data.deliveryHours || "");

        setBusinessTagline( data.businessTagline || "Hustle hard. Fold with care." );
        
        setPrimaryColor( data.primaryColor || "#2563eb" );
        setSecondaryColor( data.secondaryColor || "#1e3a8a" );

        setNewOrderNotifications( data.newOrderNotifications ?? true );
        setCustomerMessageNotifications( data.customerMessageNotifications ?? true );
        setPickupReminderNotifications( data.pickupReminderNotifications ?? true );

        setLogoUrl(data.logoUrl || "");
      }

    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  loadSettings();
}, []);

  function computeFinalCost(order, weightValue) {
    const finalWeight = Number(weightValue || 0);

    const washFoldLbs = Number(order.washFoldLbs || 0);
    const foldOnlyLbs = Number(order.foldOnlyLbs || 0);
    const totalOriginalLbs = washFoldLbs + foldOnlyLbs;

    let laundryTotal = 0;

    if (totalOriginalLbs > 0) {
      const washRatio = washFoldLbs / totalOriginalLbs;
      const foldRatio = foldOnlyLbs / totalOriginalLbs;

      const finalWashFold = finalWeight * washRatio;
      const finalFoldOnly = finalWeight * foldRatio;

      laundryTotal = finalWashFold * 2.25 + finalFoldOnly * 1.0;
    } else if (order.washFold) {
      laundryTotal = finalWeight * 2.25;
    } else if (order.foldOnly) {
      laundryTotal = finalWeight * 1.0;
    }

    const beddingTotal = Number(order.beddingSets || 0) * 25;
    const comforterTotal = Number(order.comforter || 0) * 18;
    const sleepingBagTotal = Number(order.sleepingBag || 0) * 15;
    const rugTotal = Number(order.rug || 0) * 20;

    const deliveryTotal = Number(order.step2Total || 0);
    const detergentTotal = Number(order.detergentTotal || 0);
    const addonsTotal = Number(order.addonsTotal || 0);
    const hangingCareTotal = Number(order.hangingCareTotal || 0);
    const hangerTotal = Number(order.hangerTotal || 0);

    return (
      laundryTotal +
      beddingTotal +
      comforterTotal +
      sleepingBagTotal +
      rugTotal +
      deliveryTotal +
      detergentTotal +
      addonsTotal +
      hangingCareTotal +
      hangerTotal
    );
  }

  function updateField(id, field, value) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;

        const updated = {
          ...order,
          [field]: value
        };

        if (field === "finalWeight") {
          updated.finalCost = computeFinalCost(updated, value);
        }

        return updated;
      })
    );
  }

  async function saveOrder(order) {
    try {
      setSavingId(order.id);

      await updateDoc(doc(db, "orders", order.id), {
        name: order.name || "",
        phone: order.phone || "",
        email: order.email || "",
        address: order.address || "",
        cityStateZip: order.cityStateZip || "",
        unit: order.unit || "",
        pickupDate: order.pickupDate || "",
        pickupTime: order.pickupTime || "",
        detergentChoice: order.detergentChoice || "",
        notes: order.notes || "",
        status: order.status || "",
        tagColor: order.tagColor || "",
        paid: order.paid || false,
        archived: order.archived || false,
        finalWeight: Number(order.finalWeight || 0),
        finalCost: Number(order.finalCost || 0)
      });

      setSavingId("");
    } catch (err) {
      console.error("Error saving order:", err);
      setSavingId("");
    }
  }

  async function archiveOrder(id) {
    const confirmArchive = window.confirm(
      "Archive this order? You can restore it later."
    );
    if (!confirmArchive) return;

    try {
      await updateDoc(doc(db, "orders", id), {
        archived: true
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, archived: true } : order
        )
      );
    } catch (err) {
      console.error("Error archiving order:", err);
      alert("Failed to archive order");
    }
  }

  async function restoreOrder(id) {
    try {
      await updateDoc(doc(db, "orders", id), {
        archived: false
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, archived: false } : order
        )
      );
    } catch (err) {
      console.error("Error restoring order:", err);
      alert("Failed to restore order");
    }
  }

  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      if (showArchived) return order.archived;
      return !order.archived;
    });

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((order) => {
        return (
          String(order.orderId || "").toLowerCase().includes(q) ||
          String(order.name || "").toLowerCase().includes(q) ||
          String(order.phone || "").toLowerCase().includes(q) ||
          String(order.email || "").toLowerCase().includes(q) ||
          String(order.address || "").toLowerCase().includes(q)
        );
      });
    }

    if (filter !== "All") {
      result = result.filter((order) => order.status === filter);
    }

    return result;
  }, [orders, search, filter, showArchived]);

  const totalOrders = orders.filter((o) => !o.archived).length;
  const pendingOrders = orders.filter(
    (o) =>
      !o.archived &&
      (o.status === "Pending Pickup" || o.status === "Accepted")
  ).length;
  const inProcessOrders = orders.filter(
    (o) => !o.archived && o.status === "In Process"
  ).length;
  const revenue = orders
    .filter((o) => !o.archived)
    .reduce((sum, o) => sum + Number(o.finalCost || 0), 0);

  function getColor(tag) {
    if (!tag) return "#e5e7eb";
    if (tag === "Yellow") return "#fef9c3";
    if (tag === "Purple") return "#ede9fe";
    if (tag === "Pink") return "#fce7f3";
    if (tag === "Teal") return "#ccfbf1";
    return "#e5e7eb";
  }

  function getAddonsText(order) {
    const list = [];

    if (order.addons?.oxi) list.push("OxiClean");
    if (order.addons?.color) list.push("Color Saver");
    if (order.addons?.vinegar) list.push("Vinegar Rinse");
    if (order.addons?.delicates) list.push("Delicates Care");

    if (order.hangItems > 0) {
      list.push("Hang Items: " + order.hangItems);
      list.push(
        order.hangerOption === "needed"
          ? "Hangers Needed"
          : "Hangers Provided"
      );
    }

    return list.length ? list.join(", ") : "None";
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "#f5f9ff",
    padding: "30px"
  };

  const containerStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center"
  };

  const topButton = (label) => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: activeTab === label ? "#2563eb" : "#dbeafe",
    color: activeTab === label ? "white" : "#1e3a8a",
    cursor: "pointer",
    fontWeight: "600"
  });

  const statCard = {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
    flex: 1,
    minWidth: "180px"
  };

  const searchStyle = {
    width: "100%",
    maxWidth: "700px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    marginTop: "20px"
  };

  const filterButton = (label) => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: filter === label ? "#2563eb" : "#dbeafe",
    color: filter === label ? "white" : "#1e3a8a",
    cursor: "pointer",
    margin: "6px"
  });

  const orderCard = {
    borderRadius: "12px",
    padding: "18px",
    marginTop: "18px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  };

  const fieldLabel = {
    fontSize: "13px",
    color: "#374151",
    marginBottom: "4px",
    fontWeight: "600"
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "280px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1"
  };

  const selectStyle = {
    width: "100%",
    maxWidth: "280px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "white"
  };

  const saveButton = {
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer"
  };

const saveSettings = async () => {
  try {
    let savedLogoUrl = logoUrl;

    if (logoFile) {
  const logoRef = ref(
    storage,
    `branding/logo-${Date.now()}-${logoFile.name}`
  );

  await uploadBytes(logoRef, logoFile);

  savedLogoUrl = await getDownloadURL(logoRef);
}

    await setDoc(doc(db, "settings", "business"), {
  businessName,
  adminName,
  adminEmail,
  adminPhone,
  businessAddress,
  serviceRadius,
  pickupHours,
  deliveryHours,
  newOrderNotifications,
  customerMessageNotifications,
  pickupReminderNotifications,
  businessTagline,
  primaryColor,
  secondaryColor,
  logoUrl: savedLogoUrl
});

    alert("Settings saved successfully!");
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("Failed to save settings.");
  }
};

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h2 style={{ color: "#1e3a8a", marginBottom: "20px" }}>
          Admin Dashboard
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px"
          }}
        >
          {["Orders", "Schedule", "Services", "Customers", "Messages", "Settings"].map((label) => (
            <button
              key={label}
              style={topButton(label)}
              onClick={() => {
  setActiveTab(label);
}}
>
              {label}
            </button>
          ))}

          <button style={topButton("Refresh")} onClick={loadOrders}>
            Refresh
          </button>
        </div>

<button
  onClick={() => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin");
  }}
  style={{
    marginLeft: "10px",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "white",
    cursor: "pointer"
  }}
>
  Logout
</button>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Total Orders</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              {totalOrders}
            </div>
          </div>

          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Pending Orders</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              {pendingOrders}
            </div>
          </div>

          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>In Process Orders</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              {inProcessOrders}
            </div>
          </div>

          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Revenue</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              ${revenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setShowArchived(false)}
            style={{
              marginRight: "10px",
              backgroundColor: !showArchived ? "#2563eb" : "#dbeafe",
              color: !showArchived ? "white" : "#1e3a8a",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Active Orders
          </button>

          <button
            onClick={() => setShowArchived(true)}
            style={{
              backgroundColor: showArchived ? "#2563eb" : "#dbeafe",
              color: showArchived ? "white" : "#1e3a8a",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Archived Orders
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchStyle}
          />
        </div>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          {[
            "All",
            "Accepted",
            "Pending Pickup",
            "Picked Up",
            "In Process",
            "Ready For Drop-Off",
            "Delivered",
            "Order Complete",
            "Cancelled"
          ].map((label) => (
            <button
              key={label}
              style={filterButton(label)}
              onClick={() => setFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>

{activeTab === "Schedule" && (
  <AdminSchedule />
)}

{activeTab === "Services" && (
  <AdminServices />
)}

{activeTab === "Settings" && (
  <div style={{ marginTop: "20px" }}>
    <h2>Admin Settings</h2>

  <div
    style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px",
        alignItems: "start"
    }}
  >
    {/* LEFT COLUMN */}

    <div>

<h3>Business Information</h3>

    <div style={{ marginBottom: "12px" }}>
      
      <label>Business Name</label>
      <input
  type="text"
  value={businessName}
  onChange={(e) => setBusinessName(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
      
      <label>Admin Name</label>
      <input
  type="text"
  value={adminName}
  onChange={(e) => setAdminName(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
      
      <label>Admin Email</label>
      <input
  type="email"
  value={adminEmail}
  onChange={(e) => setAdminEmail(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
  
      <label>Admin Phone</label>
      <input
  type="text"
  value={adminPhone}
  onChange={(e) => setAdminPhone(e.target.value)}
  style={inputStyle}
/>
    </div>

<div style={{ marginBottom: "12px" }}>
  
      <label>Business Address</label>
      <input
  type="text"
  value={businessAddress}
  onChange={(e) => setBusinessAddress(e.target.value)}
  style={inputStyle}
/>
    </div>

<div style={{ marginBottom: "12px" }}>
  
      <label>Service Radius</label>
      <input
  type="text"
  value={serviceRadius}
  onChange={(e) => setServiceRadius(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
  
      <label>Pickup Hours</label>
      <input
  type="text"
  value={pickupHours}
  onChange={(e) => setPickupHours(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
  
      <label>Delivery Hours</label>
      <input
  type="text"
  value={deliveryHours}
  onChange={(e) => setDeliveryHours(e.target.value)}
  style={inputStyle}
/>
    </div>
</div>

{/* RIGHT COLUMN */}
<div>
<h3>Notification Preferences</h3>

{/* Notification Checkboxes */}

<div style={{ marginBottom: "10px" }}>
  <label>
    <input
      type="checkbox"
      checked={newOrderNotifications}
      onChange={(e) =>
        setNewOrderNotifications(e.target.checked)
      }
    />
    {" "}New Order Notifications
  </label>
</div>

<div style={{ marginBottom: "10px" }}>
  <label>
    <input
      type="checkbox"
      checked={customerMessageNotifications}
      onChange={(e) =>
        setCustomerMessageNotifications(e.target.checked)
      }
    />
    {" "}Customer Message Notifications
  </label>
</div>

<div style={{ marginBottom: "20px" }}>
  <label>
    <input
      type="checkbox"
      checked={pickupReminderNotifications}
      onChange={(e) =>
        setPickupReminderNotifications(e.target.checked)
      }
    />
    {" "}Pickup Reminder Notifications
  </label>
  </div>

  <div style={{ marginTop: "30px" }}>
    <h3>Branding</h3>

    <div style={{ marginBottom: "12px" }}>
  <label>Business Tagline</label>
  <input
    type="text"
    value={businessTagline}
    onChange={(e) => setBusinessTagline(e.target.value)}
    style={inputStyle}
  />
</div>

<div style={{ marginBottom: "12px" }}>
  <label>Primary Brand Color</label>
  <input
    type="color"
    value={primaryColor}
    onChange={(e) => setPrimaryColor(e.target.value)}
  />
</div>

<div style={{ marginBottom: "12px" }}>
  <label>Secondary Brand Color</label>
  <input
    type="color"
    value={secondaryColor}
    onChange={(e) => setSecondaryColor(e.target.value)}
  />
</div>

   <div style={{ marginBottom: "12px" }}>
  <label>Business Logo</label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        setLogoFile(file);

        const previewUrl = URL.createObjectURL(file);
        setLogoUrl(previewUrl);
      }
    }}
  />
</div>

{logoUrl && (
  <div style={{ marginTop: "15px" }}>
    <img
      src={logoUrl}
      alt="Business Logo"
      style={{
        maxWidth: "200px",
        maxHeight: "120px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1"
      }}
      />
      </div>
)}

  </div>
</div>

</div>

{/* END GRID */}

<div style={{ marginTop: "30px" }}>
  <button
    onClick={saveSettings}
    style={saveButton}
  >
    Save Settings
  </button>
</div>

</div>
)}

          {activeTab === "Customers" && (
  <div style={{ marginTop: "20px" }}>
    <h2>Customers</h2>

{selectedCustomer && (
  <div
    style={{
      backgroundColor: "#eff6ff",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "20px"
    }}
  >
    <h2>
      {selectedCustomer.firstName}{" "}
      {selectedCustomer.lastName}
    </h2>

    <p>
      <strong>Email:</strong>{" "}
      {selectedCustomer.email}
    </p>

    <p>
      <strong>Phone:</strong>{" "}
      {selectedCustomer.phone}
    </p>

    <p>
      <strong>Preferred Detergent:</strong>{" "}
      {selectedCustomer.preferredDetergent ||
        "None"}
    </p>

    <p>
      <strong>Special Instructions:</strong>{" "}
      {selectedCustomer.specialInstructions ||
        "None"}
    </p>

    <hr />

<h3>Pickup Address</h3>

<p>
  {selectedCustomer.pickupAddress ||
    "No pickup address saved"}
</p>

<p>
  {selectedCustomer.pickupCity}, CA{" "}
  {selectedCustomer.pickupZip}
</p>

<p>
  {selectedCustomer.pickupUnit ||
    "No Unit / Gate Code"}
</p>

<hr />

<h3>Delivery Address</h3>

{selectedCustomer.deliveryAddress ? (
  <>
    <p>{selectedCustomer.deliveryAddress}</p>

    <p>
      {selectedCustomer.deliveryCity}, CA{" "}
      {selectedCustomer.deliveryZip}
    </p>

    <p>
      {selectedCustomer.deliveryUnit ||
        "No Unit / Gate Code"}
    </p>
  </>
) : (
  <p>Same as Pickup Address</p>
)}

<hr />

<h3>Customer Metrics</h3>

<p>
  <strong>Total Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
        selectedCustomer.email?.toLowerCase()
    ).length
  }
</p>

<p>
  <strong>Active Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
          selectedCustomer.email?.toLowerCase() &&
        order.status !== "Order Complete" &&
        order.status !== "Cancelled"
    ).length
  }
</p>

<p>
  <strong>Lifetime Spend:</strong> $
  {orders
    .filter(
      (order) =>
        order.email?.toLowerCase() ===
        selectedCustomer.email?.toLowerCase()
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.grandTotal || 0),
      0
    )
    .toFixed(2)}
</p>

<hr />

<h3>Recent Orders</h3>

{orders
  .filter(
    (order) =>
      order.email?.toLowerCase() ===
      selectedCustomer.email?.toLowerCase()
  )
  .slice(0, 5)
  .map((order) => (
    <div
      key={order.id}
      style={{
        backgroundColor: "#f8fafc",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px"
      }}
    >
      <button
  onClick={() => {
    setActiveTab("Orders");

    const orderElement =
      document.getElementById(
        `order-${order.id}`
      );

    if (orderElement) {
      orderElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }}
  style={{
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "bold",
    padding: 0
  }}
>
  {order.orderId}
</button>


      <p>
        Status: {order.status}
      </p>

      <p>
        Total: $
        {Number(order.grandTotal || 0).toFixed(2)}
      </p>

      <p>
        Pickup: {order.pickupDate || "Not Set"}
      </p>
    </div>
  ))}

  </div>
)}

    {customers.length === 0 ? (
  <p>No customers found.</p>
) : (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px"
    }}
  >
    {customers.map((customer) => (
      <div
        key={customer.id}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
        }}
      >
        <h3>
          {customer.firstName} {customer.lastName}
        </h3>

        <p>
          <strong>Email:</strong> {customer.email}
        </p>

        <p>
          <strong>Phone:</strong> {customer.phone}
        </p>

        <p>
  <strong>Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
        customer.email?.toLowerCase()
    ).length
  }
</p>

<p>
  <strong>Active Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
          customer.email?.toLowerCase() &&
        order.status !== "Order Complete" &&
        order.status !== "Cancelled"
    ).length
  }
</p>

<p>
  <strong>Lifetime Spend:</strong> $
  {orders
    .filter(
      (order) =>
        order.email?.toLowerCase() ===
        customer.email?.toLowerCase()
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.grandTotal || 0),
      0
    )
    .toFixed(2)}
</p>

<button
  onClick={() =>
    setSelectedCustomer(customer)
  }
  style={{
    marginTop: "10px",
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  View Profile
</button>

      </div>
    ))}
  </div>
)}
</div>)}

{activeTab === "Orders" && (

        <div style={{ marginTop: "20px" }}>
          {filteredOrders.length === 0 ? (
            <div style={statCard}>No matching orders found</div>
          ) : (
            filteredOrders.map((order) => {
              const estimatedLbs =
                Number(order.washFoldLbs || 0) + Number(order.foldOnlyLbs || 0);

              return (
                <div
  id={`order-${order.id}`}
  key={order.id}
  style={{
                    ...orderCard,
                    backgroundColor: getColor(order.tagColor)
                  }}
                >
                  <h3>{order.orderId || "No Order Number"}</h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "16px",
                      justifyItems: "center"
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <div style={fieldLabel}>Customer Name</div>
                      <input
                        value={order.name || ""}
                        onChange={(e) => updateField(order.id, "name", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Phone</div>
                      <input
                        value={order.phone || ""}
                        onChange={(e) => updateField(order.id, "phone", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Email</div>
                      <input
                        value={order.email || ""}
                        onChange={(e) => updateField(order.id, "email", e.target.value)}
               style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Address</div>
                      <input
                        value={order.address || ""}
                        onChange={(e) => updateField(order.id, "address", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>City / State / ZIP</div>
                      <input
                        value={order.cityStateZip || ""}
                        onChange={(e) => updateField(order.id, "cityStateZip", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Pickup / Delivery</div>
                      <div>
                        <p>Pickup: {order.pickupDate || "No Date"} {order.pickupTime || ""}</p>
                        <p>Delivery: {order.deliveryDate || "Not set"}</p>
                      </div>
                    </div>

                    <div style={{ width: "100%" }}>
                      <div style={fieldLabel}>Status</div>
                      <select
                        value={order.status || ""}
                        onChange={(e) => updateField(order.id, "status", e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">Select Status</option>
                        <option>Accepted</option>
                        <option>Pending Pickup</option>
                        <option>Picked Up</option>
                        <option>In Process</option>
                        <option>Ready For Drop-Off</option>
                        <option>Delivered</option>
                        <option>Order Complete</option>
                        <option>Cancelled</option>
                      </select>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Color Tag</div>
                      <select
                        value={order.tagColor || ""}
                        onChange={(e) => updateField(order.id, "tagColor", e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">Select Color</option>
                        <option>Yellow</option>
                        <option>Purple</option>
                        <option>Pink</option>
                        <option>Teal</option>
                      </select>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Paid / Unpaid</div>
                      <select
                        value={order.paid ? "Paid" : "Unpaid"}
                        onChange={(e) => updateField(order.id, "paid", e.target.value === "Paid")}
                        style={selectStyle}
                      >
                        <option>Unpaid</option>
                        <option>Paid</option>
                      </select>

                      <p style={{ marginTop: "10px" }}>
                        <strong>{order.paid ? "Paid" : "Unpaid"}</strong>
                      </p>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Detergent</div>
                      <input
                        value={order.detergentChoice || ""}
                        onChange={(e) => updateField(order.id, "detergentChoice", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Add-Ons</div>
                      <textarea
                        value={getAddonsText(order)}
                        readOnly
                        style={{ ...inputStyle, minHeight: "70px" }}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Estimated Weight</div>
                      <p>{estimatedLbs} lbs</p>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Customer Total</div>
                      <p>${Number(order.grandTotal || 0).toFixed(2)}</p>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Final Weight (lbs)</div>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={order.finalWeight}
                        onChange={(e) => updateField(order.id, "finalWeight", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Final Cost</div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={Number(order.finalCost || 0).toFixed(2)}
                        onChange={(e) => updateField(order.id, "finalCost", Number(e.target.value))}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Notes</div>
                      <textarea
                        value={order.notes || ""}
                        onChange={(e) => updateField(order.id, "notes", e.target.value)}
                        style={{ ...inputStyle, minHeight: "90px" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "18px", textAlign: "center" }}>
                    <button
                      onClick={() => saveOrder(order)}
                      style={saveButton}
                    >
                      {savingId === order.id ? "Saving..." : "Save"}
                    </button>
                    <button
  onClick={() =>
    navigate(`/admin/messages/${order.id}`)
  }
  style={{
    marginLeft: "10px",
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6366f1",
    color: "white",
    cursor: "pointer"
  }}
>
  Message Customer
</button>
                    {showArchived ? (
                      <button
                        onClick={() => restoreOrder(order.id)}
                        style={{
                          marginLeft: "10px",
                          padding: "12px 18px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#16a34a",
                          color: "white",
                          cursor: "pointer"
                        }}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveOrder(order.id)}
                        style={{
                          marginLeft: "10px",
                          padding: "12px 18px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#f59e0b",
                          color: "white",
                          cursor: "pointer"
                        }}
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
)}
      </div>
    </div>
  );
}