import { useLocation, useNavigate } from "react-router-dom";

export default function OrderDetails() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  const statuses = [
  "Accepted",
  "Pending Pickup",
  "Picked Up",
  "In Process",
  "Ready for Drop-off",
  "Delivered",
  "Order Complete"
];

const currentStatusIndex =
  statuses.indexOf(order?.status);


  if (!order) {
    return (
      <div style={{ padding: "30px" }}>
        <h2>Order not found.</h2>
      </div>
    );
  }

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
          maxWidth: "800px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "20px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        }}
      >
        <h1 style={{ color: "#1e3a8a" }}>
          Order Details
        </h1>

        <p><strong>Order #:</strong> {order.orderId}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <h3>Order Progress</h3>
        {order.status === "Cancelled" ? (
  <>
    <p>✅ Accepted</p>
    <p style={{ color: "#dc2626", fontWeight: "bold" }}>
      ❌ Cancelled
    </p>
  </>
) : (
  statuses.map((status, index) => (
    <p key={status}>
      {index <= currentStatusIndex ? "✅" : "⚪"}{" "}
      {status}
    </p>
  ))
)}
        <p><strong>Pickup Date:</strong> {order.pickupDate}</p>
        <p><strong>Pickup Time:</strong> {order.pickupTime}</p>
        <p><strong>Delivery Speed:</strong> {order.deliverySpeed}</p>

        <hr />

        <h3>Services</h3>

        {order.washFold && (
          <p>Wash & Fold</p>
        )}

        {order.foldOnly && (
          <p>Fold Only</p>
        )}

        <hr />

<h3>Pricing Breakdown</h3>

<p>
  <strong>Laundry Services:</strong> $
  {order.step1Total || 0}
</p>

<p>
  <strong>Delivery:</strong> $
  {order.step2Total || 0}
</p>

<p>
  <strong>Detergent:</strong> $
  {order.detergentTotal || 0}
</p>

<p>
  <strong>Add-Ons:</strong> $
  {order.addonsTotal || 0}
</p>

<p>
  <strong>Hanging Care:</strong> $
  {order.hangingCareTotal || 0}
</p>

<p>
  <strong>Hangers:</strong> $
  {order.hangerTotal || 0}
</p>

<hr />

<p
  style={{
    fontSize: "20px",
    fontWeight: "bold",
    color: "#1e3a8a"
  }}
>
  Grand Total: ${order.grandTotal}
</p>

        <hr />

<h3>Pickup Address</h3>

<p>{order.address}</p>

<p>
  {order.city}, CA {order.zip}
</p>

<p>
  {order.unit || "No Unit / Gate Code Provided"}
</p>

<hr />

<h3>Delivery Address</h3>

{order.deliveryAddress ? (
  <>
    <p>{order.deliveryAddress}</p>

    <p>
      {order.deliveryCity}, CA {order.deliveryZip}
    </p>

    <p>
      {order.deliveryUnit ||
        "No Unit / Gate Code Provided"}
    </p>
  </>
) : (
  <p>Same as Pickup Address</p>
)}

        <hr />

<h3>Service Details</h3>

{order.washFoldBedding > 0 && (
  <p>
    Wash & Fold Bedding: {order.washFoldBedding}
  </p>
)}

{order.foldOnlyBedding > 0 && (
  <p>
    Fold Only Bedding: {order.foldOnlyBedding}
  </p>
)}

{order.washFoldComforter > 0 && (
  <p>
    Wash & Fold Comforters: {order.washFoldComforter}
  </p>
)}

{order.foldOnlyComforter > 0 && (
  <p>
    Fold Only Comforters: {order.foldOnlyComforter}
  </p>
)}

{order.washFoldSleepingBag > 0 && (
  <p>
    Wash & Fold Sleeping Bags: {order.washFoldSleepingBag}
  </p>
)}

{order.foldOnlySleepingBag > 0 && (
  <p>
    Fold Only Sleeping Bags: {order.foldOnlySleepingBag}
  </p>
)}

{order.washFoldRug > 0 && (
  <p>
    Wash & Fold Rugs: {order.washFoldRug}
  </p>
)}

{order.foldOnlyRug > 0 && (
  <p>
    Fold Only Rugs: {order.foldOnlyRug}
  </p>
)}

{order.otherCount > 0 && (
  <>
    <p>
      Other Items: {order.otherCount}
    </p>

    <p>
      Description: {order.otherText}
    </p>
  </>
)}

        <hr />

<h3>Detergent</h3>

<p>
  <strong>Type:</strong>{" "}
  {order.detergentType || "Not Selected"}
</p>

<p>
  <strong>Choice:</strong>{" "}
  {order.detergentChoice || "Not Selected"}
</p>

        <hr />

<h3>Add-Ons</h3>

<p>
  OxiClean:{" "}
  {order.addons?.oxi ? "Yes" : "No"}
</p>

<p>
  Color Saver:{" "}
  {order.addons?.color ? "Yes" : "No"}
</p>

<p>
  Vinegar Rinse:{" "}
  {order.addons?.vinegar ? "Yes" : "No"}
</p>

<p>
  Delicates:{" "}
  {order.addons?.delicates ? "Yes" : "No"}
</p>

        <hr />

        <h3>Notes</h3>

        <p>
          {order.notes || "No notes provided."}
        </p>

        <button
  onClick={() =>
    navigate("/booking/step1", {
      state: { reorderData: order }
    })
  }
  style={{
    marginTop: "20px",
    marginRight: "10px",
    padding: "10px 20px",
    backgroundColor: "#1e3a8a",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  Reorder This Order
</button>

        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            backgroundColor: "#1e3a8a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}