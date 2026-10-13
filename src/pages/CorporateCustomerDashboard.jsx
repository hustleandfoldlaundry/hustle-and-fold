import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore/lite";
import { auth, db } from "../firebase";

export default function CorporateCustomerDashboard() {

 const navigate = useNavigate();
 const [customer, setCustomer] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");

useEffect(() => {

 async function loadCorporateProfile() {
 try {

 const user = auth.currentUser;
 if (!user) {
 navigate("/corporate/login");
 return;
 }
 const tokenResult = await user.getIdTokenResult(true);
 const customerId = tokenResult.claims.corporateCustomerId;
 if (tokenResult.claims.role !== "corporateCustomer" || !customerId) {
 await signOut(auth);
 navigate("/corporate/login");
 return;
 }
 const customerSnapshot = await getDoc(
 doc(db, "corporateCustomers", customerId)
 );
 if (!customerSnapshot.exists()) {
 setError("Corporate customer profile was not found.");
 return;
 }
 setCustomer({
 id: customerSnapshot.id,
 ...customerSnapshot.data()
 });

 } catch (err) {
 console.error("Error loading corporate profile:", err);
 setError("Unable to load your corporate customer profile.");
 } finally {
 setLoading(false);
 }
 }

 loadCorporateProfile();
}, [navigate]);

if (loading) {

 return <p style={{ padding: "30px" }}>Loading corporate account...</p>;

}

if (error) {

 return <p style={{ padding: "30px", color: "#dc2626" }}>{error}</p>;

}

if (!customer) {

 return null;

}

return (

 <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>

 <h1>Corporate Customer Portal</h1>

 <div style={{ backgroundColor: "white", padding: "25px", marginTop: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>

 <h2>{customer.companyName}</h2>

 <p><strong>Primary Contact:</strong> {customer.contactName}</p>

 <p><strong>Email:</strong> {customer.email}</p>

 <p><strong>Phone:</strong> {customer.phone}</p>

 <p><strong>Business Type:</strong> {customer.businessType}</p>

 <p><strong>Business Address:</strong> {customer.businessAddress}</p>

 </div>

 </div>

);

}