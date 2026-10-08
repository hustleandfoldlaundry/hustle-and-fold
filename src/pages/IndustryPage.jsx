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
    "Professional laundry service for restaurants, cafes, bakeries, and catering businesses.",

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
    <h1>{page.title}</h1>

    <p
  style={{
    fontSize: "18px",
    lineHeight: "1.6"
  }}
>
  {page.description}
</p>

<h2>Services</h2>

<ul>
  {page.services?.map((item) => (
    <li key={item}>{item}</li>
  ))}
</ul>

<h2>Benefits</h2>

<ul>
  {page.benefits?.map((item) => (
    <li key={item}>{item}</li>
  ))}
</ul>

<CorporateLeadForm />

  </div>
);
}