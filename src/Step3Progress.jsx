import { useNavigate, useLocation } from "react-router-dom";

export default function Step3Progress() {
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    "/booking/step3/contact",
    "/booking/step3/detergent",
    "/booking/step3/addons",
    "/booking/step3/notes"
  ];

  const labels = ["Contact", "Detergent", "Add‑Ons", "Notes"];

  const currentIndex = steps.findIndex((path) =>
    location.pathname.includes(path)
  );

  return (
    <div style={{ marginTop: "10px", marginBottom: "20px" }}>
      <div style={{ display: "flex" }}>
        {labels.map((label, index) => (
          <button
            key={index}
            onClick={() => navigate(steps[index])}
            style={{
              flex: 1,
              padding: "10px",
              border: "none",
              backgroundColor:
                currentIndex === index ? "#2563eb" : "#dbeafe",
              color: currentIndex === index ? "white" : "#1e3a8a",
              cursor: "pointer"
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        style={{
          height: "4px",
          backgroundColor: "#2563eb",
          width: `${(currentIndex + 1) * 25}%`,
          transition: "width 0.3s ease"
        }}
      />
    </div>
  );
}