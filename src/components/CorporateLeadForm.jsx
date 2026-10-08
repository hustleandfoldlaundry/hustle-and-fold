export default function CorporateLeadForm() {
  return (
    <div
      style={{
        marginTop: "50px",
        paddingTop: "30px",
        borderTop: "1px solid #e5e7eb"
      }}
    >
      <h2 style={{ color: "#1e3a8a" }}>
        Let's Build a Laundry Solution for Your Business
      </h2>

      <p>
        Whether you need weekly linen service,
        vacation rental turnovers, towel service,
        or a custom laundry plan, our team can
        create a solution tailored to your needs.
      </p>

      <p
        style={{
          fontWeight: "bold",
          color: "#2563eb"
        }}
      >
        Request a consultation below and we'll
        contact you to discuss pricing, pickup
        schedules, and service options.
      </p>

      <button
        style={{
          backgroundColor: "#2563eb",
          color: "white",
          border: "none",
          padding: "12px 20px",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Request Consultation
      </button>
    </div>
  );
}