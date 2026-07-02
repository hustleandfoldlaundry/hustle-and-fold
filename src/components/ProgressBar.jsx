export default function ProgressBar({ step }) {
  const percent = (step / 4) * 100;

  return (
    <div style={{ marginBottom: "20px" }}>
      <div
        style={{
          height: "8px",
          backgroundColor: "#e5e7eb",
          borderRadius: "10px",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            width: percent + "%",
            height: "100%",
            backgroundColor: "#2563eb",
            transition: "width 0.3s ease"
          }}
        ></div>
      </div>

      <p style={{ textAlign: "center", marginTop: "8px", color: "#1e3a8a" }}>
        Step {step} of 4
      </p>
    </div>
  );
}