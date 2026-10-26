import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, updateDoc } from "@firebase/firestore/lite";

export default function CorporateCustomerLogin() {

 const navigate = useNavigate();
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 async function handleLogin(e) {
 e.preventDefault();
 setError("");
 setLoading(true);
 try {

 const credential = await signInWithEmailAndPassword(auth, email, password);
 const tokenResult = await credential.user.getIdTokenResult(true);

 if (tokenResult.claims.role !== "corporateCustomer") {
 await signOut(auth);
 setError("This account does not have corporate customer access.");
 return;

 }

const customerId = tokenResult.claims.corporateCustomerId;
if (!customerId) {
await signOut(auth);
setError("Corporate customer profile is not connected.");
return;
}

await updateDoc(doc(db, "corporateCustomers", customerId), {
 accountStatus: "Profile Created",
 profileCreatedAt: new Date().toISOString(),
 lastLoginAt: new Date().toISOString()
});

 navigate("/corporate/dashboard");
 } catch (err) {
 console.error("Corporate login error:", err);
 setError("Invalid email or password.");
 } finally {
 setLoading(false);

 }

 }

 return (
 <div style={{ maxWidth: "420px", margin: "80px auto", padding: "30px", backgroundColor: "white", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.10)" }}>

 <h2>Corporate Customer Login</h2>

 <form onSubmit={handleLogin}>
 <input
    type="email"
    placeholder="Email Address"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    style={{ width: "100%", padding: "10px", marginTop: "15px", boxSizing: "border-box" }}
 />

 <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    style={{ width: "100%", padding: "10px", marginTop: "12px", boxSizing: "border-box" }}
 />

 {error && <p style={{ color: "#dc2626" }}>{error}</p>}

 <button
    type="submit"
    disabled={loading}
    style={{ width: "100%", padding: "10px", marginTop: "15px", border: "none", borderRadius: "8px", backgroundColor: "#2563eb", color: "white", cursor: "pointer" }}
 >

 {loading ? "Signing In..." : "Sign In"}

 </button>
 </form>
 </div>
);
}