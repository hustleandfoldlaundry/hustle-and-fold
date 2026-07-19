import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc} from "@firebase/firestore/lite";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

if (!isLoggedIn) {
  return <Navigate to="/admin" replace />;
}
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Orders");
  const [savingId, setSavingId] = useState("");
  const [showArchived, setShowArchived] = useState(false);
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
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  }

  useEffect(() => {
    loadOrders();
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
                if (label === "Schedule") {
                  navigate("/admin/schedule");
                } else if (label === "Services") {
                  navigate("/admin/services");
                } else {
                  setActiveTab(label);
                }
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

        <div style={{ marginTop: "20px" }}>
          {filteredOrders.length === 0 ? (
            <div style={statCard}>No matching orders found</div>
          ) : (
            filteredOrders.map((order) => {
              const estimatedLbs =
                Number(order.washFoldLbs || 0) + Number(order.foldOnlyLbs || 0);

              return (
                <div
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
      </div>
    </div>
  );
}