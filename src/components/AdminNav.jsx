import { useNavigate } from "react-router-dom";

export default function AdminNav({ activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const topButton = (label) => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: activeTab === label ? "#2563eb" : "#dbeafe",
    color: activeTab === label ? "white" : "#1e3a8a",
    cursor: "pointer",
    fontWeight: "600"
  });

  return (
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
            if (label === "Orders") {
  navigate("/admin/dashboard");
}
 else if (label === "Schedule") {
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
    </div>
  );
}