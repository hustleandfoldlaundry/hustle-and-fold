import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { doc, getDoc, getDocs, collection, updateDoc } from "@firebase/firestore/lite";
import { auth, db, storage } from "../firebase";
import { ref, getDownloadURL } from "firebase/storage";

export default function CorporateCustomerDashboard() {

 const navigate = useNavigate();
 const [customer, setCustomer] = useState(null);
 const [editingProfile, setEditingProfile] = useState(false);
 const [profileForm, setProfileForm] = useState({ companyName: "", contactName: "", phone: "", businessType: "", businessAddress: "" });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [contracts, setContracts] = useState([]);
 const [showSignedContracts, setShowSignedContracts] = useState(false);
 const [showServiceHistory, setShowServiceHistory] = useState(false);
 const [serviceHistory, setServiceHistory] = useState([]);
 const [signingContractId, setSigningContractId] = useState(null);
 const [signatureName, setSignatureName] = useState("");
 const [signatureConfirmed, setSignatureConfirmed] = useState(false);

useEffect(() => {

 async function loadCorporateProfile() {
 try {

 const user = auth.currentUser; if (!user) { navigate("/corporate/login");
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

const serviceHistorySnapshot = await getDocs(
  collection(db, "corporateServiceHistory")
);

const customerServiceHistory = serviceHistorySnapshot.docs
  .map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
  }))
  .filter((historyItem) => historyItem.corporateCustomerId === customerId);

setServiceHistory(customerServiceHistory);

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

async function saveProfileChanges() {
  if (
    !profileForm.companyName.trim() ||
    !profileForm.contactName.trim() ||
    !profileForm.phone.trim() ||
    !profileForm.businessType.trim() ||
    !profileForm.businessAddress.trim()
  ) {
    alert("Please complete all company information fields.");
    return;
  }

  try {
    const updatedProfile = {
      companyName: profileForm.companyName.trim(),
      contactName: profileForm.contactName.trim(),
      phone: profileForm.phone.trim(),
      businessType: profileForm.businessType.trim(),
      businessAddress: profileForm.businessAddress.trim(),
      profileUpdatedAt: new Date().toISOString()
    };

    await updateDoc(
      doc(db, "corporateCustomers", customer.id),
      updatedProfile
    );

    setCustomer((currentCustomer) => ({
      ...currentCustomer,
      ...updatedProfile
    }));

    setEditingProfile(false);

    alert("Company information updated successfully.");
  } catch (error) {
    console.error(
      "Error updating company information:",
      error
    );

    alert(
      "Unable to update company information. Please try again."
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

<div
  style={{
    marginTop: "20px",
    padding: "25px",
    backgroundColor: "#eff6ff",
    borderRadius: "12px",
    border: "1px solid #bfdbfe"
  }}
>
  <h2
    style={{
      margin: "0 0 10px",
      color: "#1e3a8a"
    }}
  >
    Welcome, {customer.contactName}
  </h2>

  <p
    style={{
      margin: "0",
      color: "#475569",
      lineHeight: "1.6"
    }}
  >
    Manage your Hustle & Fold corporate account,
    review agreements, sign contracts requiring
    your attention, and access completed documents.
  </p>

  {contracts.some(
    (contract) => contract.status !== "Signed"
  ) && (
    <div
      style={{
        marginTop: "18px",
        padding: "12px 15px",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#991b1b",
        fontWeight: "600"
      }}
    >
      Action Required: You have a contract awaiting
      your signature.
    </div>
  )}
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "20px",
    marginTop: "20px",
    alignItems: "start"
  }}
>
  <div
    style={{
      backgroundColor: "white",
      padding: "18px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      textAlign: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        color: "#64748b",
        marginBottom: "8px"
      }}
    >
      Account Status
    </div>

    <strong style={{ color: "#16a34a" }}>
      Active
    </strong>
  </div>

  <div
    style={{
      backgroundColor: "white",
      padding: "18px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      textAlign: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        color: "#64748b",
        marginBottom: "8px"
      }}
    >
      Service Plan
    </div>

    <strong>
      {customer.servicePlan || "Not set"}
    </strong>
  </div>

  <div
    style={{
      backgroundColor: "white",
      padding: "18px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      textAlign: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        color: "#64748b",
        marginBottom: "8px"
      }}
    >
      Pickup Frequency
    </div>

    <strong>
      {customer.pickupFrequency || "Not set"}
    </strong>
  </div>

  <div
    style={{
      backgroundColor: "white",
      padding: "18px",
      borderRadius: "12px",
      border: "1px solid #e2e8f0",
      textAlign: "center"
    }}
  >
    <div
      style={{
        fontSize: "14px",
        color: "#64748b",
        marginBottom: "8px"
      }}
    >
      Contracts Awaiting Signature
    </div>

    <strong
      style={{
        color: contracts.some(
          (contract) => contract.status !== "Signed"
        )
          ? "#dc2626"
          : "#16a34a"
      }}
    >
      {
        contracts.filter(
          (contract) => contract.status !== "Signed"
        ).length
      }
    </strong>
  </div>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    alignItems: "stretch"
  }}
>

 <div style={{ backgroundColor: "white", padding: "25px", marginTop: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>
 <h2>{customer.companyName}</h2>

<span
  style={{
    display: "inline-block",
    marginBottom: "15px",
    backgroundColor: "#16a34a",
    color: "white",
    padding: "5px 12px",
    borderRadius: "999px",
    fontWeight: "600"
  }}
>
  Account Active
</span>

 <p><strong>Primary Contact:</strong> {customer.contactName}</p>
 <p><strong>Email:</strong> {customer.email}</p>
 <p><strong>Phone:</strong> {customer.phone}</p>
 <p><strong>Business Type:</strong> {customer.businessType}</p>
 <p><strong>Business Address:</strong> {customer.businessAddress}</p>

<button
  type="button"
  onClick={() => {
    setProfileForm({
      companyName: customer.companyName || "",
      contactName: customer.contactName || "",
      phone: customer.phone || "",
      businessType: customer.businessType || "",
      businessAddress: customer.businessAddress || ""
    });

    setEditingProfile(true);
  }}
  style={{
    marginTop: "15px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  Edit Company Information
</button>

{editingProfile && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      backgroundColor: "#f8fafc",
      borderRadius: "10px",
      border: "1px solid #e2e8f0"
    }}
  >
    <h3 style={{ color: "#1e3a8a" }}>
      Update Company Information
    </h3>

    <input
      type="text"
      placeholder="Company Name"
      value={profileForm.companyName}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          companyName: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box"
      }}
    />

    <input
      type="text"
      placeholder="Primary Contact Name"
      value={profileForm.contactName}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          contactName: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box"
      }}
    />

    <input
      type="tel"
      placeholder="Phone Number"
      value={profileForm.phone}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          phone: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box"
      }}
    />

    <input
      type="text"
      placeholder="Business Type"
      value={profileForm.businessType}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          businessType: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box"
      }}
    />

    <input
      type="text"
      placeholder="Business Address"
      value={profileForm.businessAddress}
      onChange={(e) =>
        setProfileForm({
          ...profileForm,
          businessAddress: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "15px",
        boxSizing: "border-box"
      }}
    />

    <button
      type="button"
      onClick={saveProfileChanges}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#16a34a",
        color: "white",
        cursor: "pointer",
        fontWeight: "600"
      }}
    >
      Save Changes
    </button>

    <button
      type="button"
      onClick={() => setEditingProfile(false)}
      style={{
        marginLeft: "10px",
        padding: "10px 16px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        backgroundColor: "white",
        cursor: "pointer"
      }}
    >
      Cancel
    </button>
  </div>
)}

 </div>

<div
  style={{
    backgroundColor: "white",
    padding: "25px",
    marginTop: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  }}
>
  <h2 style={{ color: "#1e3a8a" }}>
    Service Details
  </h2>

  <p>
    <strong>Service Plan:</strong>{" "}
    {customer.servicePlan || "Not set"}
  </p>

  <p>
    <strong>Pickup Frequency:</strong>{" "}
    {customer.pickupFrequency || "Not set"}
  </p>

  <p>
    <strong>Service Days:</strong>{" "}
    {customer.serviceDays || "Not set"}
  </p>

  <p>
    <strong>Estimated Weekly Volume:</strong>{" "}
    {customer.weeklyVolume || "Not set"}
  </p>

  <p>
    <strong>Pricing / Rate:</strong>{" "}
    {customer.pricingRate || "Not set"}
  </p>

  <p>
    <strong>Service Start Date:</strong>{" "}
    {customer.serviceStartDate || "Not set"}
  </p>

  <p>
    <strong>Special Handling Instructions:</strong>{" "}
    {customer.specialInstructions || "None"}
  </p>

  <p
    style={{
      marginTop: "18px",
      fontSize: "14px",
      color: "#64748b"
    }}
  >
    Service details are managed by Hustle & Fold. 
    This information is based off your most recent signed contract.
    Please contact us if changes are needed.
  </p>
</div>
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(360px, 1fr))",
    gap: "20px",
    marginTop: "20px",
    alignItems: "start"
  }}
>

<div style={{ backgroundColor: "white", padding: "25px", marginTop: "20px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)" }}>

 <h2>Contracts</h2>

<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>

 <span style={{ backgroundColor: "#dc2626", color: "white", padding: "6px 12px", borderRadius: "999px", fontWeight: "600" }}>
 Pending Signature: {contracts.filter((contract) => contract.status !== "Signed").length}
 </span>

 <span style={{ backgroundColor: "#16a34a", color: "white", padding: "6px 12px", borderRadius: "999px", fontWeight: "600" }}>
 Signed: {contracts.filter((contract) => contract.status === "Signed").length}
 </span>

</div>

<button
 type="button"
 onClick={() => setShowSignedContracts((prev) => !prev)}

 style={{
 marginBottom: "15px",
 padding: "8px 14px",
 borderRadius: "8px",
 border: "1px solid #cbd5e1",
 backgroundColor: "white",
 color: "#334155",
 cursor: "pointer",
 fontWeight: "600"
 }}
>

 {showSignedContracts ? "Hide Signed Contracts" : "Show Signed Contracts"}

</button>

 {contracts.length === 0 ? (
 <p>No contracts are currently available.</p>
 ) : (
contracts

.filter((contract) => contract.status !== "Signed" || showSignedContracts)
.slice()
.sort((a, b) => (a.status === "Signed" ? 1 : 0) - (b.status === "Signed" ? 1 : 0))
.map((contract) => (
 <div
  key={contract.id}
  style={{
    marginTop: "15px",
    padding: "20px",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      flexWrap: "wrap"
    }}
  >
    <h3
      style={{
        margin: "0",
        color: "#1e3a8a"
      }}
    >
      {contract.title}
    </h3>

    <span
      style={{
        backgroundColor:
          contract.status === "Signed"
            ? "#16a34a"
            : "#dc2626",
        color: "white",
        padding: "5px 12px",
        borderRadius: "999px",
        fontWeight: "600"
      }}
    >
      {contract.status || "Pending Signature"}
    </span>
  </div>

  <div
    style={{
      marginTop: "15px",
      color: "#475569"
    }}
  >
    <p style={{ margin: "6px 0" }}>
      <strong>Effective Date:</strong>{" "}
      {contract.effectiveDate}
    </p>

    <p style={{ margin: "6px 0" }}>
      <strong>Expiration Date:</strong>{" "}
      {contract.expirationDate || "None"}
    </p>
  </div>

  <div
    style={{
      marginTop: "18px",
      paddingTop: "15px",
      borderTop: "1px solid #e2e8f0"
    }}
  >
    <strong>Contract Terms</strong>

    <p
      style={{
        whiteSpace: "pre-wrap",
        lineHeight: "1.6",
        color: "#334155"
      }}
    >
      {contract.terms}
    </p>
  </div>

  {contract.status === "Signed" &&
    contract.signedPdfStoragePath && (
      <button
        type="button"
        onClick={() =>
          downloadSignedContract(contract)
        }
        style={{
          marginTop: "10px",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        Download Signed PDF
      </button>
    )}

  {contract.status !== "Signed" &&
    signingContractId !== contract.id && (
      <button
        type="button"
        onClick={() =>
          setSigningContractId(contract.id)
        }
        style={{
          marginTop: "10px",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer",
          fontWeight: "600"
        }}
      >
        Review & Sign Contract
      </button>
    )}

  {signingContractId === contract.id && (
    <div
      style={{
        marginTop: "18px",
        padding: "18px",
        backgroundColor: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: "10px"
      }}
    >
      <h4
        style={{
          marginTop: "0",
          color: "#1e3a8a"
        }}
      >
        Electronic Signature
      </h4>

      <input
        type="text"
        placeholder="Type your full legal name"
        value={signatureName}
        onChange={(e) =>
          setSignatureName(e.target.value)
        }
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          boxSizing: "border-box"
        }}
      />

      <label
        style={{
          display: "block",
          marginBottom: "15px",
          lineHeight: "1.5"
        }}
      >
        <input
          type="checkbox"
          checked={signatureConfirmed}
          onChange={(e) =>
            setSignatureConfirmed(e.target.checked)
          }
        />{" "}
        I have reviewed this contract and agree
        to its terms. I intend my typed name to
        serve as my electronic signature.
      </label>

      <button
        type="button"
        onClick={() =>
          signContract(contract.id)
        }
        disabled={
          !signatureName.trim() ||
          !signatureConfirmed
        }
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#16a34a",
          color: "white",
          cursor: "pointer",
          fontWeight: "600"
        }}
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
        style={{
          marginLeft: "10px",
          padding: "10px 16px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          backgroundColor: "white",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  )}
</div>
 ))
 )}

</div>

<div
  style={{
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px"
    }}
  >
    <h2 style={{ margin: "0" }}>
      Service History
    </h2>

    <button
      type="button"
      onClick={() =>
        setShowServiceHistory((prev) => !prev)
      }
      style={{
        padding: "8px 14px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1",
        backgroundColor: "white",
        color: "#334155",
        cursor: "pointer",
        fontWeight: "600"
      }}
    >
      {showServiceHistory ? "Hide History" : "View History"}
    </button>
  </div>

{showServiceHistory && (
  <div
    style={{
      marginTop: "20px",
      paddingTop: "15px",
      borderTop: "1px solid #e2e8f0"
    }}
  >
    {serviceHistory.length === 0 ? (
      <p
        style={{
          color: "#64748b",
          margin: "0"
        }}
      >
        No service history is available yet.
      </p>
    ) : (
      serviceHistory.map((historyItem) => (
        <div
  key={historyItem.id}
  style={{
    padding: "18px",
    marginBottom: "12px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px"
  }}
>
         <div style={{ color: "#334155", lineHeight: "1.6" }}>
  <p style={{ margin: "4px 0" }}>
    <strong>Service Date:</strong>{" "}
{historyItem.serviceDate
  ? new Date(`${historyItem.serviceDate}T00:00:00`).toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric"
      }
    )
  : "N/A"}
  </p>

  <p style={{ margin: "4px 0" }}>
    <strong>Service Type:</strong> {historyItem.serviceType || "N/A"}
  </p>

  <p style={{ margin: "4px 0" }}>
<p style={{ margin: "4px 0" }}>
  <strong>Status:</strong>{" "}
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: "999px",
      fontSize: "13px",
      fontWeight: "600",
      backgroundColor:
        historyItem.serviceStatus === "Completed"
          ? "#dcfce7"
          : historyItem.serviceStatus === "Picked Up"
          ? "#dbeafe"
          : "#f1f5f9",
      color:
        historyItem.serviceStatus === "Completed"
          ? "#166534"
          : historyItem.serviceStatus === "Picked Up"
          ? "#1e40af"
          : "#475569"
    }}
  >
    {historyItem.serviceStatus || "N/A"}
  </span>
</p>
  </p>

  <p style={{ margin: "4px 0" }}>
    <strong>Volume:</strong> {historyItem.volume || "N/A"}
  </p>

  <p style={{ margin: "4px 0" }}>
    <strong>Amount Charged:</strong> {historyItem.amountCharged || "N/A"}
  </p>

  {historyItem.notes && (
    <p style={{ margin: "4px 0" }}>
      <strong>Notes:</strong> {historyItem.notes}
    </p>
  )}
</div>
        </div>
      ))
    )}
  </div>
)}
</div>
</div>

 </div>
);
}