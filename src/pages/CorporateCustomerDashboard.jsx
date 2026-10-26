import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc, getDocs, collection, updateDoc } from "@firebase/firestore/lite";
import { auth, db, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";

export default function CorporateCustomerDashboard() {

 const navigate = useNavigate();
 const [customer, setCustomer] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [contracts, setContracts] = useState([]);
 const [signingContractId, setSigningContractId] = useState(null);
 const [signatureName, setSignatureName] = useState("");
 const [signatureConfirmed, setSignatureConfirmed] = useState(false);

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

 const contractsSnapshot = await getDocs(collection(db, "corporateContracts"));
 const customerContracts = contractsSnapshot.docs
    .map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
 }))

 .filter((contract) => contract.corporateCustomerId === customerId);

setContracts(customerContracts);

 } catch (err) {
 console.error("Error loading corporate profile:", err);
 setError("Unable to load your corporate customer profile.");
 } finally {
 setLoading(false);
 }
 }

 loadCorporateProfile();
}, [navigate]);

async function signContract(contractId) {
  if (!signatureName.trim() || !signatureConfirmed) {
    alert(
      "Please type your full legal name and confirm your agreement."
    );
    return;
  }

  try {
    const signedAt = new Date().toISOString();
    const signedByUid = auth.currentUser?.uid || "";
    const signedByEmail = auth.currentUser?.email || "";

    await updateDoc(
      doc(db, "corporateContracts", contractId),
      {
        status: "Signed",
        signedAt,
        signedByName: signatureName.trim(),
        signedByUid,
        signedByEmail,
        signatureConfirmed: true
      }
    );

    setContracts((currentContracts) =>
      currentContracts.map((contract) =>
        contract.id === contractId
          ? {
              ...contract,
              status: "Signed",
              signedAt,
              signedByName: signatureName.trim(),
              signedByUid,
              signedByEmail,
              signatureConfirmed: true
            }
          : contract
      )
    );

    setSigningContractId(null);
    setSignatureName("");
    setSignatureConfirmed(false);

    alert("Contract signed successfully.");
  } catch (error) {
    console.error(
      "Error signing contract:",
      error
    );

    alert(
      "Unable to sign the contract. Please try again."
    );
  }
}

async function handleLogout() {
 try {
 await signOut(auth);
 navigate("/corporate/login");
 } catch (error) {
 console.error("Corporate logout error:", error);
 alert("Unable to log out. Please try again.");
 }
}

async function downloadSignedContract(contract) {
 try {
 if (!contract.signedPdfStoragePath) {
 alert("The signed PDF is not available yet.");
 return;
 }

 const pdfReference = ref(
 storage,
 contract.signedPdfStoragePath
 );

 const downloadUrl = await getDownloadURL(pdfReference);
 window.open(downloadUrl, "_blank", "noopener,noreferrer");
 } catch (error) {
 console.error("Error downloading signed contract:", error);
 alert("Unable to download the signed PDF. Please try again.");
 }

}

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
 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

 <h1>Corporate Customer Portal</h1>

 <button
 type="button"
 onClick={handleLogout}
 style={{ padding: "10px 16px", borderRadius: "8px", border: "none", backgroundColor: "#dc2626", color: "white", cursor: "pointer" }}
 >

 Log Out
 </button>

</div>

 <div style={{ backgroundColor: "white", padding: "25px", marginTop: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
 <h2>{customer.companyName}</h2>
 <p><strong>Primary Contact:</strong> {customer.contactName}</p>
 <p><strong>Email:</strong> {customer.email}</p>
 <p><strong>Phone:</strong> {customer.phone}</p>
 <p><strong>Business Type:</strong> {customer.businessType}</p>
 <p><strong>Business Address:</strong> {customer.businessAddress}</p>
 </div>

<div style={{ backgroundColor: "white", padding: "25px", marginTop: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>

 <h2>Contracts</h2>

 {contracts.length === 0 ? (
 <p>No contracts are currently available.</p>
 ) : (

 contracts.map((contract) => (
 <div key={contract.id} style={{ marginTop: "15px", padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
 <h3>{contract.title}</h3>
 <p><strong>Effective Date:</strong> {contract.effectiveDate}</p>
 <p><strong>Expiration Date:</strong> {contract.expirationDate || "None"}</p>
 <p><strong>Status:</strong>{" "} 
 <span style={{
     backgroundColor: contract.status === "Signed" ? "#16a34a" : "#dc2626",
     color: "white",
     padding: "4px 10px",
     borderRadius: "999px",
     fontWeight: "600"
 }}
 >

 {contract.status || "Pending Signature"}

 </span>

{contract.status === "Signed" && contract.signedPdfStoragePath && (

 <button
 type="button"
 onClick={() => downloadSignedContract(contract)}
 style={{
 marginBottom: "15px",
 padding: "10px 16px",
 borderRadius: "8px",
 border: "none",
 backgroundColor: "#2563eb",
 color: "white",
 cursor: "pointer"
 }}
 >

 Download Signed PDF

 </button>

)}

</p> <p><strong>Contract Terms:</strong></p>
 
 <p style={{ whiteSpace: "pre-wrap" }}>{contract.terms}</p>
 {contract.status !== "Signed" && signingContractId !== contract.id && (

 <button
 type="button"
 onClick={() => setSigningContractId(contract.id)}
 style={{ padding: "10px 16px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "white", cursor: "pointer" }}
 >

 Review & Sign Contract
 </button>
)}

{signingContractId === contract.id && (
 <div style={{ marginTop: "15px", padding: "15px", backgroundColor: "white", borderRadius: "8px" }}>
 <h4>Electronic Signature</h4>
 <input
    type="text"
    placeholder="Type your full legal name"
    value={signatureName}
    onChange={(e) => setSignatureName(e.target.value)}
    style={{ width: "100%", padding: "10px", marginBottom: "12px", boxSizing: "border-box" }}
 />

 <label style={{ display: "block", marginBottom: "12px" }}>
 <input
    type="checkbox"
    checked={signatureConfirmed}
    onChange={(e) => setSignatureConfirmed(e.target.checked)}
 />{" "}

 I have reviewed this contract and agree to its terms. I intend my typed name to serve as my electronic signature.
 </label>

 <button
    type="button"
    onClick={() => signContract(contract.id)}
    disabled={!signatureName.trim() || !signatureConfirmed}
    style={{ padding: "10px 16px", borderRadius: "8px", border: "none", backgroundColor: "#16a34a", color: "white", cursor: "pointer" }}
 >

 Sign Contract
 </button>

 <button
    type="button"
    onClick={() => {

 setSigningContractId(null);
 setSignatureName("");
 setSignatureConfirmed(false);
 }}
 style={{ marginLeft: "10px", padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer" }}
 >

 Cancel
 </button>
 </div>
)}
 </div>
 ))
 )}

</div>

 </div>
);
}