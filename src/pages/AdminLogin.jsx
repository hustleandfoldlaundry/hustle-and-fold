import { useState } from "react";
import {
signInWithEmailAndPassword,
signOut
} from "firebase/auth";
import { doc, getDoc } from "@firebase/firestore/lite";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import logo from "../assets/HF Logo.png";


export default function AdminLogin() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");

async function handleLogin(e) {
e.preventDefault();
setError("");

try {
const userCredential =
  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

const user = userCredential.user;

console.log("Logged in UID:", user.uid);

const adminDoc = await getDoc(
doc(db, "admins", user.uid)
);

console.log("Admin doc exists:", adminDoc.exists());

if (adminDoc.exists()) {
console.log("Admin data:", adminDoc.data());
}

if (
!adminDoc.exists() ||
adminDoc.data().active !== true
) {
localStorage.removeItem("adminLoggedIn");
await signOut(auth);

setError(
"Access denied. This account is not an administrator."
);

return;
}

localStorage.setItem(
"adminLoggedIn",
"true"
);

navigate("/admin/dashboard");
} catch (err) {
console.error("Admin login error:", err);

localStorage.removeItem("adminLoggedIn");

setError("Invalid email or password.");
}
}

return (
<div
style={{
minHeight: "100vh",
display: "flex",
justifyContent: "center",
alignItems: "center",
background: "#f5f9ff"
}}
>
<form
onSubmit={handleLogin}
style={{
background: "white",
padding: "30px",
borderRadius: "12px",
width: "350px",
boxShadow:
"0 4px 10px rgba(0,0,0,0.08)"
}}
>
<img
src={logo}
alt="Hustle & Fold Logo"
style={{
width: "350px",
marginBottom: "10px"
}}
/>

<h2>Admin Login</h2>

<input
type="email"
placeholder="Email"
value={email}
onChange={(e) =>
setEmail(e.target.value)
}
required
style={{
width: "95%",
padding: "10px",
marginTop: "10px"
}}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e) =>
setPassword(e.target.value)
}
required
style={{
width: "95%",
padding: "10px",
marginTop: "10px"
}}
/>

{error && (
<p style={{ color: "red" }}>
{error}
</p>
)}

<button
type="submit"
style={{
marginTop: "15px",
padding: "12px",
width: "100%",
background: "#2563eb",
color: "white",
border: "none",
borderRadius: "8px",
cursor: "pointer"
}}
>
Login
</button>
</form>
</div>
);
}