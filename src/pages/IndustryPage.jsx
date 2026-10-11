import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import CorporateLeadForm from "../components/CorporateLeadForm";

export default function IndustryPage() {
  const { industry } = useParams();
  const navigate = useNavigate();

  const industryData = {

  "sports-teams": {
  title: "Sports Teams",
  description:
    "Keep your athletes focused on the game while we handle the laundry.",
  
  image: "/images/sports-teams-hero.png",

  services: [
    "Practice Uniforms",
    "Game Uniforms",
    "Training Apparel",
    "Warm-Up Gear",
    "Team Towels"
  ],

  benefits: [
    "Fast Turnaround",
    "Pickup & Delivery",
    "Team Volume Capacity",
    "Consistent Cleaning",
    "Professional Care"
  ]
},

"restaurants": {
  title: "Restaurants",
  description:
    "Professional laundry service for restaurants, cafes, bakeries, and catering businesses. Keep your resturant running smoothly with clean, professional-quality linens, uniforms, and towels delivered on schedule.",

  image: "/images/resturants-hero.png",

  services: [
    "Aprons",
    "Kitchen Towels",
    "Bar Towels",
    "Table Linens",
    "Staff Uniforms"
  ],

  benefits: [
    "Pickup & Delivery",
    "Reliable Scheduling",
    "Fast Turnaround",
    "Professional Cleaning",
    "Flexible Service Plans"
  ]
},

  "salons-spas": {
  title: "Salons & Spas",
  description:
    "Professional laundry service for salons, spas, massage studios, and beauty professionals.",

  image: "/images/salons-spas-hero.png",

  services: [
    "Towels",
    "Face Cloths",
    "Spa Linens",
    "Robes",
    "Massage Table Covers"
  ],

  benefits: [
    "Pickup & Delivery",
    "Reliable Scheduling",
    "Fresh Clean Towels",
    "Professional Presentation",
    "Flexible Service Plans"
  ]
},

"fitness-studios": {
  title: "Fitness Studios",
  description:
    "Keep your members happy with fresh towels and professionally cleaned laundry.",

  image: "/images/fitness-studios-hero.png",

  services: [
    "Gym Towels",
    "Staff Uniforms",
    "Yoga Towels",
    "Cleaning Cloths",
    "Event Apparel"
  ],

  benefits: [
    "Fast Turnaround",
    "Pickup & Delivery",
    "Scalable Service",
    "Reliable Scheduling",
    "Professional Care"
  ]
},

"medical-offices": {
  title: "Medical Offices",
  description:
    "Dependable laundry service for healthcare professionals and medical facilities.",

  image: "/images/medical-offices-hero.png",

  services: [
    "Exam Table Covers",
    "Patient Blankets",
    "Towels",
    "Uniforms",
    "Cleaning Linens"
  ],

  benefits: [
    "Professional Handling",
    "Reliable Pickup",
    "Consistent Quality",
    "Flexible Schedules",
    "Dependable Service"
  ]
},

"hotels-motels": {
  title: "Hotels & Motels",
  description:
    "Hospitality laundry solutions designed to keep guests comfortable and properties running smoothly.",

  image: "/images/hotels-motels-hero.png",

  services: [
    "Bed Linens",
    "Bath Towels",
    "Wash Cloths",
    "Pool Towels",
    "Staff Uniforms"
  ],

  benefits: [
    "Fast Turnaround",
    "Pickup & Delivery",
    "High Volume Capacity",
    "Professional Folding",
    "Reliable Service"
  ]
},

"airbnb-vacation-rentals": {
  title: "Airbnb & Vacation Rentals",
  description:
    "Spend less time doing laundry and more time focusing on your guests.",

  image: "/images/airbnb-vacation-hero.png",

  services: [
    "Sheets",
    "Pillow Cases",
    "Comforter Covers",
    "Bath Towels",
    "Kitchen Linens"
  ],

  benefits: [
    "Apartment Turnovers",
    "Quick Service",
    "Pickup & Delivery",
    "Professional Folding",
    "Flexible Scheduling"
  ]
},
};

const page =
  industryData[industry] || {
    title: "Corporate Laundry Solutions",
    description:
      "Customized laundry solutions for your business.",
  };

return (
  <div
    style={{
      maxWidth: "1000px",
      margin: "40px auto",
      padding: "30px",
      background: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}
  >

<button
  onClick={() => navigate("/corporate")}
  style={{
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontSize: "16px",
    padding: "0",
    marginBottom: "20px",
    fontWeight: "600"
  }}
>
  ← Back to Corporate Solutions
</button>

    <div
  style={{
    backgroundColor: "#eff6ff",
    borderRadius: "12px",
    marginBottom: "30px",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: page.image ? "1fr 1fr" : "1fr",
    alignItems: "stretch"
  }}
>
  <div
    style={{
      padding: "40px 30px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      alignItems: "center"
    }}
  >
    <h1
      style={{
        color: "#1e3a8a",
        marginBottom: "15px"
      }}
    >
      {page.title}
    </h1>

    <p
      style={{
        fontSize: "18px",
        lineHeight: "1.6",
        margin: "0"
      }}
    >
      {page.description}
    </p>
  </div>

  {page.image && (
  <div
    role="img"
    aria-label={page.title}
    style={{
      width: "100%",
      minHeight: "300px",
      backgroundImage: "url(" + page.image + ")",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}
  />
)}
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginTop: "30px"
  }}
>
  <div
    style={{
      backgroundColor: "#ffffff",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}
  >
    <h2 style={{ color: "#1e3a8a" }}>
      Services
    </h2>

    <ul
      style={{
        lineHeight: "1.9",
        fontSize: "17px"
      }}
    >
      {page.services?.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>

  <div
    style={{
      backgroundColor: "#ffffff",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}
  >
    <h2 style={{ color: "#1e3a8a" }}>
      Benefits
    </h2>

    <ul
      style={{
        lineHeight: "1.9",
        fontSize: "17px"
      }}
    >
      {page.benefits?.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
</div>

<div
  style={{
    marginTop: "40px",
    padding: "30px",
    backgroundColor: "#f8fafc",
    borderRadius: "12px",
    textAlign: "center"
  }}
>

  <h2 style={{ color: "#1e3a8a" }}>
    Why Hustle & Fold?
  </h2>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "15px",
      marginTop: "20px",
      alignItems: "center",
      textAlign: "center"
    }}
  >
    <div>✅ Scheduled Pickup & Delivery</div>
    <div>✅ Flexible Service Plans</div>
    <div>✅ Fast Turnaround Times</div>
    <div>✅ Dedicated Account Support</div>
    <div>✅ Volume Pricing Available</div>
    <div>✅ Reliable Local Service</div>
  </div>
</div>

<CorporateLeadForm />

  </div>
);
}