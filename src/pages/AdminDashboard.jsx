import { useEffect, useMemo, useState } from "react";
import { db, storage, functions } from "../firebase";
import { httpsCallable } from "firebase/functions";
import { collection, addDoc, getDocs, doc, updateDoc, setDoc, getDoc, deleteDoc } from "@firebase/firestore/lite";import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import AdminSchedule from "./AdminSchedule";
import AdminServices from "./AdminServices";

export default function AdminDashboard() {
  const isLoggedIn = localStorage.getItem("adminLoggedIn");

if (!isLoggedIn) {
  return <Navigate to="/admin" replace />;
}
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Orders");
  const [savingId, setSavingId] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);

  const [businessName, setBusinessName] = useState("Hustle & Fold");
  const [adminName, setAdminName] = useState("CeCe");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");

  const [businessAddress, setBusinessAddress] = useState("");
  const [serviceRadius, setServiceRadius] = useState("15");
  const [pickupHours, setPickupHours] = useState("");
  const [deliveryHours, setDeliveryHours] = useState("");

  const [businessTagline, setBusinessTagline] = useState( "Hustle hard. Fold with care." );

  const [primaryColor, setPrimaryColor] = useState("#2563eb");
  const [secondaryColor, setSecondaryColor] = useState("#1e3a8a");
  
  const [newOrderNotifications, setNewOrderNotifications] = useState(true);
  const [customerMessageNotifications, setCustomerMessageNotifications] = useState(true);
  const [pickupReminderNotifications, setPickupReminderNotifications] = useState(true);

  const [adminLogoUrl, setAdminLogoUrl] = useState("");
  const [customerLogoUrl, setCustomerLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [customerLogoFile, setCustomerLogoFile] = useState(null);

  const [corporateLeads, setCorporateLeads] = useState([]);
  const navigate = useNavigate();
  const [showCorporateCustomerForm, setShowCorporateCustomerForm] = useState(false);
  const [corporateCustomerForm, setCorporateCustomerForm] = useState({ companyName: "", contactName: "", email: "", phone: "", businessType: "", businessAddress: "" });
  const [corporateCustomers, setCorporateCustomers] = useState([]);
  const [editingServiceCustomerId, setEditingServiceCustomerId] = useState(null);
  const [serviceDetailsForm, setServiceDetailsForm] = useState({ servicePlan: "", pickupFrequency: "", serviceDays: "", weeklyVolume: "", pricingRate: "", specialInstructions: "", serviceStartDate: "" });
  const [contractCustomerId, setContractCustomerId] = useState(null);
  const [corporateContracts, setCorporateContracts] = useState([]);
  const [showSignedContracts, setShowSignedContracts] = useState({});
  const [contractForm, setContractForm] = useState({ title: "", effectiveDate: "", expirationDate: "", terms: "" });
  const [serviceHistoryCustomerId, setServiceHistoryCustomerId] = useState(null);
  const [serviceHistoryForm, setServiceHistoryForm] = useState({ serviceDate: "", serviceType: "", serviceStatus: "", volume: "", amountCharged: "", notes: "" });
  const [editingCorporateCustomerId, setEditingCorporateCustomerId] = useState(null);
  const [corporateProfileForm, setCorporateProfileForm] = useState({ companyName: "", contactName: "", phone: "", businessType: "", businessAddress: "" });

async function createCorporateCustomer() {

if (
  !corporateCustomerForm.companyName.trim() ||
  !corporateCustomerForm.contactName.trim() ||
  !corporateCustomerForm.email.trim() ||
  !corporateCustomerForm.phone.trim() ||
  !corporateCustomerForm.businessType.trim() ||
  !corporateCustomerForm.businessAddress.trim()
) {
  alert("Please complete all corporate customer fields.");
  return;
}

  try {
    await addDoc(
      collection(db, "corporateCustomers"),
      {
        companyName: corporateCustomerForm.companyName,
        contactName: corporateCustomerForm.contactName,
        email: corporateCustomerForm.email,
        phone: corporateCustomerForm.phone,
        businessType: corporateCustomerForm.businessType,
        businessAddress: corporateCustomerForm.businessAddress,
        status: "Active",
        accountStatus: "Pending Invitation",
        createdAt: new Date().toISOString()
      }
    );

    alert("Corporate customer created successfully.");

    setCorporateCustomerForm({
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      businessType: "",
      businessAddress: ""
    });

    setShowCorporateCustomerForm(false);
  } catch (error) {
    console.error(
      "Error creating corporate customer:",
      error
    );

    alert(
      "Unable to create corporate customer. Please try again."
    );
  }
}
  
async function loadCorporateCustomers() {
 try {
 const snapshot = await getDocs(collection(db, "corporateCustomers"));
 const data = snapshot.docs.map((docItem) => ({
    id: docItem.id,
     ...docItem.data()
 }));

 setCorporateCustomers(data);
 } catch (error) {
 console.error("Error loading corporate customers:", error);
 }
}

async function loadCorporateContracts() {
 try {
 const snapshot = await getDocs(collection(db, "corporateContracts"));
 const data = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data()
 }));

 setCorporateContracts(data);
 } catch (error) {
 console.error("Error loading corporate contracts:", error);
 }
}

async function sendCorporateCustomerInvite(customerId) {
 try {
 const sendInvite = httpsCallable(functions, "sendCorporateCustomerInvite");
 await sendInvite({ customerId });
 alert("Login invitation sent successfully.");
 await loadCorporateCustomers();
 } catch (error) {
 console.error("Error sending corporate customer invitation:", error);
 alert(error?.message || "Unable to send the login invitation.");
 }
}

async function saveCorporateProfileChanges(customerId) {
  if (
    !corporateProfileForm.companyName.trim() ||
    !corporateProfileForm.contactName.trim() ||
    !corporateProfileForm.phone.trim() ||
    !corporateProfileForm.businessType.trim() ||
    !corporateProfileForm.businessAddress.trim()
  ) {
    alert("Please complete all company information fields.");
    return;
  }

  try {
    const updatedProfile = {
      companyName: corporateProfileForm.companyName.trim(),
      contactName: corporateProfileForm.contactName.trim(),
      phone: corporateProfileForm.phone.trim(),
      businessType: corporateProfileForm.businessType.trim(),
      businessAddress: corporateProfileForm.businessAddress.trim(),
      profileUpdatedAt: new Date().toISOString()
    };

    await updateDoc(
      doc(db, "corporateCustomers", customerId),
      updatedProfile
    );

    setCorporateCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              ...updatedProfile
            }
          : customer
      )
    );

    setEditingCorporateCustomerId(null);

    alert("Company information updated successfully.");
  } catch (error) {
    console.error(
      "Error updating corporate customer:",
      error
    );

    alert(
      "Unable to update company information. Please try again."
    );
  }
}

async function saveCorporateServiceDetails(customerId) {
  try {
    const updatedServiceDetails = {
      servicePlan: serviceDetailsForm.servicePlan.trim(),
      pickupFrequency: serviceDetailsForm.pickupFrequency.trim(),
      serviceDays: serviceDetailsForm.serviceDays.trim(),
      weeklyVolume: serviceDetailsForm.weeklyVolume.trim(),
      pricingRate: serviceDetailsForm.pricingRate.trim(),
      specialInstructions:
        serviceDetailsForm.specialInstructions.trim(),
      serviceStartDate: serviceDetailsForm.serviceStartDate,
      serviceDetailsUpdatedAt: new Date().toISOString()
    };

    await updateDoc(
      doc(db, "corporateCustomers", customerId),
      updatedServiceDetails
    );

    setCorporateCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === customerId
          ? {
              ...customer,
              ...updatedServiceDetails
            }
          : customer
      )
    );

    setEditingServiceCustomerId(null);

    alert("Service details updated successfully.");
  } catch (error) {
    console.error(
      "Error updating service details:",
      error
    );

    alert(
      "Unable to update service details. Please try again."
    );
  }
}

async function saveCorporateServiceRecord(customerId) {
  if (
    !serviceHistoryForm.serviceDate ||
    !serviceHistoryForm.serviceType.trim() ||
    !serviceHistoryForm.serviceStatus
  ) {
    alert(
      "Please enter the service date, service type, and service status."
    );
    return;
  }

  try {
    await addDoc(
      collection(db, "corporateServiceHistory"),
      {
        corporateCustomerId: customerId,
        serviceDate: serviceHistoryForm.serviceDate,
        serviceType: serviceHistoryForm.serviceType.trim(),
        serviceStatus: serviceHistoryForm.serviceStatus,
        volume: serviceHistoryForm.volume.trim(),
        amountCharged:
          serviceHistoryForm.amountCharged.trim(),
        notes: serviceHistoryForm.notes.trim(),
        createdAt: new Date().toISOString()
      }
    );

    alert("Service record saved successfully.");

    setServiceHistoryForm({
      serviceDate: "",
      serviceType: "",
      serviceStatus: "",
      volume: "",
      amountCharged: "",
      notes: ""
    });

    setServiceHistoryCustomerId(null);
  } catch (error) {
    console.error(
      "Error saving corporate service record:",
      error
    );

    alert(
      "Unable to save the service record. Please try again."
    );
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

async function saveCorporateContract(customerId) {
 if (!contractForm.title.trim() || !contractForm.effectiveDate || !contractForm.terms.trim()) {
 alert("Please complete the contract title, effective date, and terms.");
 return;
 }
 try {
 
  await addDoc(collection(db, "corporateContracts"), {
    corporateCustomerId: customerId,
    title: contractForm.title.trim(),
    effectiveDate: contractForm.effectiveDate,
    expirationDate: contractForm.expirationDate,
    terms: contractForm.terms.trim(),
    status: "Pending Signature",
    signedAt: null,
    createdAt: new Date().toISOString()
 });

 alert("Contract saved successfully.");
 setContractForm({
    title: "",
    effectiveDate: "",
    expirationDate: "",
    terms: ""
 });

 setContractCustomerId(null);
 } catch (error) {
 console.error("Error saving corporate contract:", error);
 alert("Unable to save the contract. Please try again.");
 }
}

async function deleteCorporateContract(contract) {
 if (contract.status === "Signed") {
 alert("Signed contracts cannot be deleted.");
 return;
 }

 const confirmed = window.confirm(
 "Are you sure you want to delete this contract?"
 );

 if (!confirmed) {
 return;
 }

 try {
 await deleteDoc(doc(db, "corporateContracts", contract.id));
 setCorporateContracts((currentContracts) =>
 currentContracts.filter((item) => item.id !== contract.id)
 );

 alert("Contract deleted successfully.");
 } catch (error) {
 console.error("Error deleting corporate contract:", error);
 alert("Unable to delete the contract. Please try again.");
 }
}

function getContractLifecycleStatus(contract) {
 if (!contract.expirationDate) {
 return "Active";
 }

 const today = new Date();

 const expiration = new Date(contract.expirationDate + "T23:59:59");
 if (expiration < today) {
 return "Expired";
 }

 const thirtyDaysFromNow = new Date();
 thirtyDaysFromNow.setDate(today.getDate() + 30);
 if (expiration <= thirtyDaysFromNow) {
 return "Expiring Soon";
 }

 return "Active";
}

  async function loadOrders() {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const data = snapshot.docs.map((docItem) => {
      const order = docItem.data();
      const estimatedLbs = Number(order.washFoldLbs || 0) + Number(order.foldOnlyLbs || 0);

        return {
          id: docItem.id,
          ...order,
          deliveryDate: order.deliveryDate || "",
          deliveryTime: order.deliveryTime || "",
          status: order.status || "",
          adminViewed:
            order.status === "Accepted"
              ? true
              : order.adminViewed ?? false,
          tagColor: order.tagColor || "",
          paid: order.paid || false,
          archived: order.archived || false,
          finalWeight: order.finalWeight || estimatedLbs,
          finalCost: order.finalCost || Number(order.grandTotal || 0)
        };
      });

      setOrders(data);

      const unreadOrders = data.filter(
        (order) => order.adminViewed === false
      );

      setNewOrderCount(unreadOrders.length);

const customerSnapshot = await getDocs(
  collection(db, "customers")
);

const customerData = customerSnapshot.docs.map(
  (doc) => ({
    id: doc.id,
    ...doc.data()
  })
);

setCustomers(customerData);
const corporateSnapshot = await getDocs(
  collection(db, "corporateLeads")
);

const corporateData = corporateSnapshot.docs.map(
  (doc) => ({
    id: doc.id,
    ...doc.data()
  })
);

setCorporateLeads(corporateData);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
  }

  useEffect(() => {
    loadOrders();
    loadCorporateCustomers();
    loadCorporateContracts();
  }, []);

  useEffect(() => {
  const loadSettings = async () => {
    try {
      const settingsDoc = await getDoc(
        doc(db, "settings", "business")
      );

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();

        setBusinessName(data.businessName || "");
        setAdminName(data.adminName || "");
        setAdminEmail(data.adminEmail || "");
        setAdminPhone(data.adminPhone || "");
        setBusinessAddress(data.businessAddress || "");
        setServiceRadius(data.serviceRadius || "");
        setPickupHours(data.pickupHours || "");
        setDeliveryHours(data.deliveryHours || "");

        setBusinessTagline( data.businessTagline || "Hustle hard. Fold with care." );
        
        setPrimaryColor( data.primaryColor || "#2563eb" );
        setSecondaryColor( data.secondaryColor || "#1e3a8a" );

        setNewOrderNotifications( data.newOrderNotifications ?? true );
        setCustomerMessageNotifications( data.customerMessageNotifications ?? true );
        setPickupReminderNotifications( data.pickupReminderNotifications ?? true );

        setAdminLogoUrl(data.logoUrl || "");
        setCustomerLogoUrl(data.customerLogoUrl || "");
      }

    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  loadSettings();
}, []);

  function computeFinalCost(order, weightValue) {
    const finalWeight = Number(weightValue || 0);

    const washFoldLbs = Number(order.washFoldLbs || 0);
    const foldOnlyLbs = Number(order.foldOnlyLbs || 0);
    const totalOriginalLbs = washFoldLbs + foldOnlyLbs;

    let laundryTotal = 0;

    if (totalOriginalLbs > 0) {
      const washRatio = washFoldLbs / totalOriginalLbs;
      const foldRatio = foldOnlyLbs / totalOriginalLbs;

      const finalWashFold = finalWeight * washRatio;
      const finalFoldOnly = finalWeight * foldRatio;

      laundryTotal = finalWashFold * 2.25 + finalFoldOnly * 1.0;
    } else if (order.washFold) {
      laundryTotal = finalWeight * 2.25;
    } else if (order.foldOnly) {
      laundryTotal = finalWeight * 1.0;
    }

    const beddingTotal = Number(order.beddingSets || 0) * 25;
    const comforterTotal = Number(order.comforter || 0) * 18;
    const sleepingBagTotal = Number(order.sleepingBag || 0) * 15;
    const rugTotal = Number(order.rug || 0) * 20;

    const deliveryTotal = Number(order.step2Total || 0);
    const detergentTotal = Number(order.detergentTotal || 0);
    const addonsTotal = Number(order.addonsTotal || 0);
    const hangingCareTotal = Number(order.hangingCareTotal || 0);
    const hangerTotal = Number(order.hangerTotal || 0);

    return (
      laundryTotal +
      beddingTotal +
      comforterTotal +
      sleepingBagTotal +
      rugTotal +
      deliveryTotal +
      detergentTotal +
      addonsTotal +
      hangingCareTotal +
      hangerTotal
    );
  }

  function updateField(id, field, value) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;

        const updated = {
          ...order,
          [field]: value
        };

        if (field === "finalWeight") {
          updated.finalCost = computeFinalCost(updated, value);
        }

        return updated;
      })
    );
  }

async function deleteLead(leadId) {
  if (
    !window.confirm(
      "Are you sure you want to permanently delete this lead?"
    )
  ) {
    return;
  }

  try {
    await deleteDoc(
      doc(db, "corporateLeads", leadId)
    );

    setCorporateLeads((prev) =>
      prev.filter((lead) => lead.id !== leadId)
    );
  } catch (error) {
    console.error(
      "Error deleting lead:",
      error
    );
  }
}

  async function saveOrder(order) {
    try {
      setSavingId(order.id);

      await updateDoc(doc(db, "orders", order.id), {
        name: order.name || "",
        phone: order.phone || "",
        email: order.email || "",
        address: order.address || "",
        cityStateZip: order.cityStateZip || "",
        unit: order.unit || "",
        pickupDate: order.pickupDate || "",
        pickupTime: order.pickupTime || "",
        detergentChoice: order.detergentChoice || "",
        notes: order.notes || "",
        status: order.status || "",
        tagColor: order.tagColor || "",
        paid: order.paid || false,
        archived: order.archived || false,
        finalWeight: Number(order.finalWeight || 0),
        finalCost: Number(order.finalCost || 0)
      });

      setSavingId("");
    } catch (err) {
      console.error("Error saving order:", err);
      setSavingId("");
    }
  }

  async function deleteOrder(orderId) {
  if (
    !window.confirm(
      "Are you sure? This will permanently delete the order."
    )
  ) {
    return;
  }

  try {
    await deleteDoc(doc(db, "orders", orderId));

    setOrders((prev) =>
      prev.filter((order) => order.id !== orderId)
    );

    alert("Order deleted.");
  } catch (error) {
    console.error("Delete error:", error);
    alert("Failed to delete order.");
  }
}

  async function archiveOrder(id) {
    const confirmArchive = window.confirm(
      "Archive this order? You can restore it later."
    );
    if (!confirmArchive) return;

    try {
      await updateDoc(doc(db, "orders", id), {
        archived: true
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, archived: true } : order
        )
      );
    } catch (err) {
      console.error("Error archiving order:", err);
      alert("Failed to archive order");
    }
  }

  async function updateLeadNotes(
  leadId,
  notes
) {
  try {
    await updateDoc(
      doc(db, "corporateLeads", leadId),
      {
        notes
      }
    );

    setCorporateLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, notes }
          : lead
      )
    );
  } catch (error) {
    console.error(
      "Error updating lead notes:",
      error
    );
  }
}

async function updateLeadDates(
  leadId,
  lastContactDate,
  nextFollowUpDate
) {
  try {
    await updateDoc(
      doc(db, "corporateLeads", leadId),
      {
        lastContactDate,
        nextFollowUpDate
      }
    );

    setCorporateLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              lastContactDate,
              nextFollowUpDate
            }
          : lead
      )
    );
  } catch (error) {
    console.error(
      "Error updating follow-up dates:",
      error
    );
  }
}

async function updateLeadStatus(
  leadId,
  status
) {
  try {
    await updateDoc(
      doc(db, "corporateLeads", leadId),
      {
        status
      }
    );

    setCorporateLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, status }
          : lead
      )
    );
  } catch (error) {
    console.error(
      "Error updating lead status:",
      error
    );
  }
}

  async function restoreOrder(id) {
    try {
      await updateDoc(doc(db, "orders", id), {
        archived: false
      });

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, archived: false } : order
        )
      );
    } catch (err) {
      console.error("Error restoring order:", err);
      alert("Failed to restore order");
    }
  }

  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      if (showArchived) return order.archived;
      return !order.archived;
    });

    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((order) => {
        return (
          String(order.orderId || "").toLowerCase().includes(q) ||
          String(order.name || "").toLowerCase().includes(q) ||
          String(order.phone || "").toLowerCase().includes(q) ||
          String(order.email || "").toLowerCase().includes(q) ||
          String(order.address || "").toLowerCase().includes(q)
        );
      });
    }

    if (filter !== "All") {
      result = result.filter((order) => order.status === filter);
    }

    return result;
  }, [orders, search, filter, showArchived]);

  const totalOrders = orders.filter((o) => !o.archived).length;
  const pendingOrders = orders.filter(
    (o) =>
      !o.archived &&
      (o.status === "Pending Pickup" || o.status === "Accepted")
  ).length;
  const inProcessOrders = orders.filter(
    (o) => !o.archived && o.status === "In Process"
  ).length;
  const revenue = orders
    .filter((o) => !o.archived)
    .reduce((sum, o) => sum + Number(o.finalCost || 0), 0);

  function getColor(tag) {
    if (!tag) return "#e5e7eb";
    if (tag === "Yellow") return "#fef9c3";
    if (tag === "Purple") return "#ede9fe";
    if (tag === "Pink") return "#fce7f3";
    if (tag === "Teal") return "#ccfbf1";
    return "#e5e7eb";
  }

  function getAddonsText(order) {
    const list = [];

    if (order.addons?.oxi) list.push("OxiClean");
    if (order.addons?.color) list.push("Color Saver");
    if (order.addons?.vinegar) list.push("Vinegar Rinse");
    if (order.addons?.delicates) list.push("Delicates Care");

    if (order.hangItems > 0) {
      list.push("Hang Items: " + order.hangItems);
      list.push(
        order.hangerOption === "needed"
          ? "Hangers Needed"
          : "Hangers Provided"
      );
    }

    return list.length ? list.join(", ") : "None";
  }

  const pageStyle = {
    minHeight: "100vh",
    background: "#f5f9ff",
    padding: "30px"
  };

  const containerStyle = {
    maxWidth: "1100px",
    margin: "0 auto",
    textAlign: "center"
  };

  const topButton = (label) => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: activeTab === label ? "#2563eb" : "#dbeafe",
    color: activeTab === label ? "white" : "#1e3a8a",
    cursor: "pointer",
    fontWeight: "600"
  });

  const statCard = {
    background: "white",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center",
    flex: 1,
    minWidth: "180px"
  };

  const searchStyle = {
    width: "100%",
    maxWidth: "700px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    marginTop: "20px"
  };

  const filterButton = (label) => ({
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: filter === label ? "#2563eb" : "#dbeafe",
    color: filter === label ? "white" : "#1e3a8a",
    cursor: "pointer",
    margin: "6px"
  });

  const orderCard = {
    borderRadius: "12px",
    padding: "18px",
    marginTop: "18px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "center"
  };

  const fieldLabel = {
    fontSize: "13px",
    color: "#374151",
    marginBottom: "4px",
    fontWeight: "600"
  };

  const inputStyle = {
    width: "100%",
    maxWidth: "280px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1"
  };

  const selectStyle = {
    width: "100%",
    maxWidth: "280px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "white"
  };

  const saveButton = {
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer"
  };

const saveSettings = async () => {
  try {
    let savedLogoUrl = adminLogoUrl;
    let savedCustomerLogoUrl = customerLogoUrl;

    if (logoFile) {
  const logoRef = ref(
    storage,
    `branding/logo-${Date.now()}-${logoFile.name}`
  );

  await uploadBytes(logoRef, logoFile);

  savedLogoUrl = await getDownloadURL(logoRef);
}

if (customerLogoFile) {
  const customerLogoRef = ref(
    storage,
    `branding/customer-logo-${Date.now()}-${customerLogoFile.name}`
  );

  await uploadBytes(customerLogoRef, customerLogoFile);

  savedCustomerLogoUrl = await getDownloadURL(customerLogoRef);
}

    await setDoc(doc(db, "settings", "business"), {
  businessName,
  adminName,
  adminEmail,
  adminPhone,
  businessAddress,
  serviceRadius,
  pickupHours,
  deliveryHours,
  newOrderNotifications,
  customerMessageNotifications,
  pickupReminderNotifications,
  businessTagline,
  primaryColor,
  secondaryColor,
  logoUrl: savedLogoUrl,
  customerLogoUrl: savedCustomerLogoUrl,
});

    alert("Settings saved successfully!");
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("Failed to save settings.");
  }
};

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px"
  }}
>
  {adminLogoUrl && (
    <img
    src={adminLogoUrl}
    alt="Business Logo"
    style={{
      width: "50px",
      height: "50px"
    }}
    ></img>
  )}
  
  <h2 style={{ color: "#1e3a8a", margin: 0 }}>
    Admin Dashboard
  </h2>
</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "10px"
          }}
        >
          {[
            "Orders",
            "Schedule",
            "Services",
            "Customers",
            "Corporate Leads",
            "Corporate Customers",
            "Messages"
          ].map((label) => (
            <button
              key={label}
              style={{
                ...topButton(label),
                position: "relative"
              }}
              onClick={() => {
                setActiveTab(label);
              }}
            >
              {label}

              {label === "Orders" && newOrderCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-8px",
                    right: "-8px",
                    minWidth: "20px",
                    height: "20px",
                    padding: "0 5px",
                    borderRadius: "999px",
                    backgroundColor: "#dc2626",
                    color: "white",
                    fontSize: "12px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {newOrderCount}
                </span>
              )}
            </button>
          ))}

        </div>

        <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginTop: "12px"
  }}
>

<button
  onClick={() => setActiveTab("Settings")}
  style={{
    marginLeft: "10px",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#2563eb",
    color: "white",
    cursor: "pointer"
  }}
>
  Settings
</button>

<button
  onClick={loadOrders}
  style={{
    marginLeft: "10px",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#16a34a",
    color: "white",
    cursor: "pointer"
  }}
>
  Refresh
</button>

<button
  onClick={() => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/admin");
  }}
  style={{
    marginLeft: "10px",
    padding: "8px 14px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "white",
    cursor: "pointer"
  }}
>
  Logout
</button>
</div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "20px",
            flexWrap: "wrap",
            justifyContent: "center"
          }}
        >
          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Total Orders</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              {totalOrders}
            </div>
          </div>

          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Pending Orders</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              {pendingOrders}
            </div>
          </div>

          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>In Process Orders</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              {inProcessOrders}
            </div>
          </div>

          <div style={statCard}>
            <div style={{ color: "#6b7280", fontSize: "14px" }}>Revenue</div>
            <div style={{ fontSize: "28px", color: "#1e3a8a", fontWeight: "700" }}>
              ${revenue.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setShowArchived(false)}
            style={{
              marginRight: "10px",
              backgroundColor: !showArchived ? "#2563eb" : "#dbeafe",
              color: !showArchived ? "white" : "#1e3a8a",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Active Orders
          </button>

          <button
            onClick={() => setShowArchived(true)}
            style={{
              backgroundColor: showArchived ? "#2563eb" : "#dbeafe",
              color: showArchived ? "white" : "#1e3a8a",
              padding: "10px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Archived Orders
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={searchStyle}
          />
        </div>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          {[
            "All",
            "Accepted",
            "Pending Pickup",
            "Picked Up",
            "In Process",
            "Ready For Drop-Off",
            "Delivered",
            "Order Complete",
            "Cancelled"
          ].map((label) => (
            <button
              key={label}
              style={filterButton(label)}
              onClick={() => setFilter(label)}
            >
              {label}
            </button>
          ))}
        </div>

{activeTab === "Schedule" && (
  <AdminSchedule />
)}

{activeTab === "Services" && (
  <AdminServices />
)}

{activeTab === "Corporate Leads" && (
  <div style={{ marginTop: "20px" }}>
    <h2>Corporate Leads</h2>

    {corporateLeads.length === 0 ? (
      <p>No corporate leads found.</p>
    ) : (
      corporateLeads.map((lead) => (
        <div
          key={lead.id}
          style={{
            background: "white",
            padding: "20px",
            marginTop: "10px",
            borderRadius: "12px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
          }}
        >
          <h3>{lead.companyName}</h3>

          <p>
  <strong>Status:</strong>{" "}
  <span
    style={{
      padding: "4px 10px",
      borderRadius: "999px",
      color: "white",
      backgroundColor:
        lead.status === "Customer"
          ? "#16a34a"
          : lead.status === "Quoted"
          ? "#9333ea"
          : lead.status === "Contacted"
          ? "#f59e0b"
          : lead.status === "Closed"
          ? "#6b7280"
          : "#2563eb"
    }}
  >
    {lead.status || "New"}
  </span>
</p>

<button
  onClick={() => deleteLead(lead.id)}
  style={{
    marginTop: "10px",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "white",
    cursor: "pointer"
  }}
>
  Delete Lead
</button>

          <div
  style={{
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "10px"
  }}
>
  <button
    onClick={() =>
      updateLeadStatus(
        lead.id,
        "Contacted"
      )
    }
  >
    Contacted
  </button>

  <button
    onClick={() =>
      updateLeadStatus(
        lead.id,
        "Quoted"
      )
    }
  >
    Quoted
  </button>

  <button
    onClick={() =>
      updateLeadStatus(
        lead.id,
        "Customer"
      )
    }
  >
    Customer
  </button>

  <button
    onClick={() =>
      updateLeadStatus(
        lead.id,
        "Closed"
      )
    }
  >
    Closed
  </button>
</div>

          <p>
            <strong>Contact:</strong>{" "}
            {lead.contactName}
          </p>

          <p>
            <strong>Phone:</strong> {lead.phone}
          </p>

          <p>
            <strong>Email:</strong> {lead.email}
          </p>

          <p>
            <strong>Business Type:</strong>{" "}
            {lead.businessType}
          </p>

          <p>
            <strong>Weekly Volume:</strong>{" "}
            {lead.weeklyVolume}
          </p>

          <p>
  <strong>Last Contact:</strong>{" "}
  {lead.lastContactDate || "Not set"}
</p>

<p>
  <strong>Next Follow-Up:</strong>{" "}
  {lead.nextFollowUpDate || "Not set"}
</p>

<div style={{ marginTop: "10px" }}>
  <label>
    Last Contact Date:
  </label>

  <input
    type="date"
    defaultValue={lead.lastContactDate || ""}
    id={`last-contact-${lead.id}`}
    style={{
      display: "block",
      marginTop: "5px",
      marginBottom: "10px"
    }}
  />

  <label>
    Next Follow-Up Date:
  </label>

  <input
    type="date"
    defaultValue={lead.nextFollowUpDate || ""}
    id={`next-followup-${lead.id}`}
    style={{
      display: "block",
      marginTop: "5px"
    }}
  />

  <button
    onClick={() =>
      updateLeadDates(
        lead.id,
        document.getElementById(
          `last-contact-${lead.id}`
        ).value,
        document.getElementById(
          `next-followup-${lead.id}`
        ).value
      )
    }
    style={{
      marginTop: "10px",
      padding: "8px 14px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#2563eb",
      color: "white",
      cursor: "pointer"
    }}
  >
    Save Follow-Up
  </button>
</div>

          <p>
            <strong>Message:</strong>{" "}
            {lead.message}
          </p>

          <div style={{ marginTop: "10px" }}>
  <strong>Notes:</strong>

  <textarea
    defaultValue={lead.notes || ""}
    id={`notes-${lead.id}`}
    rows="4"
    style={{
      width: "100%",
      marginTop: "8px",
      padding: "8px",
      borderRadius: "8px"
    }}
  />

  <button
    onClick={() =>
      updateLeadNotes(
        lead.id,
        document.getElementById(
          `notes-${lead.id}`
        ).value
      )
    }
    style={{
      marginTop: "8px",
      padding: "8px 14px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#2563eb",
      color: "white",
      cursor: "pointer"
    }}
  >
    Save Notes
  </button>
</div>


        </div>
      ))
    )}
  </div>
)}

{activeTab === "Corporate Customers" && (
  <div style={{ marginTop: "20px" }}>
    <h2>Corporate Customers</h2>

    <button
      onClick={() => {
        setShowCorporateCustomerForm(true);
      }}
      style={{
        padding: "10px 16px",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#2563eb",
        color: "white",
        cursor: "pointer"
      }}
    >
      + Create Corporate Customer
    </button>

{showCorporateCustomerForm && (
  <div
    style={{
      maxWidth: "600px",
      margin: "20px auto",
      padding: "25px",
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
    }}
  >
    <h3>Create Corporate Customer</h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        marginTop: "20px"
      }}
    >
      <input
  type="text"
  placeholder="Company Name"
  value={corporateCustomerForm.companyName}
  onChange={(e) =>
    setCorporateCustomerForm({
      ...corporateCustomerForm,
      companyName: e.target.value
    })
  }
/>

<input
  type="text"
  placeholder="Primary Contact Name"
  value={corporateCustomerForm.contactName}
  onChange={(e) =>
    setCorporateCustomerForm({
      ...corporateCustomerForm,
      contactName: e.target.value
    })
  }
/>

<input
  type="email"
  placeholder="Primary Contact Email"
  value={corporateCustomerForm.email}
  onChange={(e) =>
    setCorporateCustomerForm({
      ...corporateCustomerForm,
      email: e.target.value
    })
  }
/>

<input
  type="tel"
  placeholder="Phone Number"
  value={corporateCustomerForm.phone}
  onChange={(e) =>
    setCorporateCustomerForm({
      ...corporateCustomerForm,
      phone: e.target.value
    })
  }
/>  

<input
  type="text"
  placeholder="Business Type"
  value={corporateCustomerForm.businessType}
  onChange={(e) =>
    setCorporateCustomerForm({
      ...corporateCustomerForm,
      businessType: e.target.value
    })
  }
/>

<input
  type="text"
  placeholder="Business Address"
  value={corporateCustomerForm.businessAddress}
  onChange={(e) =>
    setCorporateCustomerForm({
      ...corporateCustomerForm,
      businessAddress: e.target.value
    })
  }
/>

      <button
        type="button"
        onClick={createCorporateCustomer}
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#16a34a",
          color: "white",
          cursor: "pointer"
        }}
      >
        Create Corporate Customer
      </button>

      <button
        type="button"
        onClick={() =>
          setShowCorporateCustomerForm(false)
        }
        style={{
          padding: "10px 16px",
          borderRadius: "8px",
          border: "1px solid #cbd5e1",
          backgroundColor: "white",
          color: "#334155",
          cursor: "pointer"
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}

{corporateCustomers.length === 0 ? (

 <p>No corporate customers found.</p>

) : (

 corporateCustomers.map((customer) => (

<div key={customer.id} style={{ backgroundColor: "white", padding: "20px", marginTop: "15px", borderRadius: "12px", boxShadow: "0 4px 10px rgba(0,0,0,0.08)", textAlign: "left" }}>

<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
    marginTop: "20px",
    alignItems: "stretch"
  }}
>
  {/* COMPANY INFORMATION */}
  <div
    style={{
      padding: "20px",
      backgroundColor: "#f8fafc",
      borderRadius: "10px",
      border: "1px solid #e2e8f0"
    }}
  >
    <h4
      style={{
        marginTop: "0",
        color: "#1e3a8a"
      }}
    >
      Company Information
    </h4>

    <h3>{customer.companyName}</h3>

    <p>
      <strong>Contact:</strong>{" "}
      {customer.contactName}
    </p>

    <p>
      <strong>Email:</strong>{" "}
      {customer.email}
    </p>

    <p>
      <strong>Phone:</strong>{" "}
      {customer.phone}
    </p>

    <p>
      <strong>Business Type:</strong>{" "}
      {customer.businessType}
    </p>

    <p>
      <strong>Business Address:</strong>{" "}
      {customer.businessAddress}
    </p>

<button
  type="button"
  onClick={() => {
  setCorporateProfileForm({
    companyName: customer.companyName || "",
    contactName: customer.contactName || "",
    phone: customer.phone || "",
    businessType: customer.businessType || "",
    businessAddress: customer.businessAddress || ""
  });

  setEditingCorporateCustomerId(customer.id);
}}
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
  Edit Company Information
</button>

  </div>

  {/* SERVICE DETAILS */}
  <div
    style={{
      padding: "20px",
      backgroundColor: "#f8fafc",
      borderRadius: "10px",
      border: "1px solid #e2e8f0"
    }}
  >
    <h4
      style={{
        marginTop: "0",
        color: "#1e3a8a"
      }}
    >
      Service Details
    </h4>

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
      <strong>
        Special Handling Instructions:
      </strong>{" "}
      {customer.specialInstructions || "None"}
    </p>

    <button
      type="button"
      onClick={() => {
        setServiceDetailsForm({
          servicePlan:
            customer.servicePlan || "",
          pickupFrequency:
            customer.pickupFrequency || "",
          serviceDays:
            customer.serviceDays || "",
          weeklyVolume:
            customer.weeklyVolume || "",
          pricingRate:
            customer.pricingRate || "",
          specialInstructions:
            customer.specialInstructions || "",
          serviceStartDate:
            customer.serviceStartDate || ""
        });

        setEditingServiceCustomerId(
          customer.id
        );
      }}
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
      Edit Service Details
    </button>

<button
  type="button"
  onClick={() => setServiceHistoryCustomerId(customer.id)}
  style={{
    marginTop: "10px",
    marginLeft: "10px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#16a34a",
    color: "white",
    cursor: "pointer",
    fontWeight: "600"
  }}
>
  + Add Service Record
</button>

{serviceHistoryCustomerId === customer.id && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      backgroundColor: "#f8fafc",
      borderRadius: "10px",
      border: "1px solid #e2e8f0"
    }}
  >
    <h4
      style={{
        marginTop: "0",
        color: "#1e3a8a"
      }}
    >
      Add Service Record
    </h4>

    <label>Service Date</label>
    <input
      type="date"
      value={serviceHistoryForm.serviceDate}
      onChange={(e) =>
        setServiceHistoryForm({
          ...serviceHistoryForm,
          serviceDate: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginTop: "5px",
        marginBottom: "12px",
        boxSizing: "border-box"
      }}
    />

    <input
      type="text"
      placeholder="Service Type"
      value={serviceHistoryForm.serviceType}
      onChange={(e) =>
        setServiceHistoryForm({
          ...serviceHistoryForm,
          serviceType: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        boxSizing: "border-box"
      }}
    />

    <select
      value={serviceHistoryForm.serviceStatus}
      onChange={(e) =>
        setServiceHistoryForm({
          ...serviceHistoryForm,
          serviceStatus: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        boxSizing: "border-box"
      }}
    >
      <option value="">Service Status</option>
      <option value="Picked Up">Picked Up</option>
      <option value="In Process">In Process</option>
      <option value="Delivered">Delivered</option>
      <option value="Completed">Completed</option>
    </select>

    <input
      type="text"
      placeholder="Weight / Volume"
      value={serviceHistoryForm.volume}
      onChange={(e) =>
        setServiceHistoryForm({
          ...serviceHistoryForm,
          volume: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        boxSizing: "border-box"
      }}
    />

    <input
      type="text"
      placeholder="Amount Charged"
      value={serviceHistoryForm.amountCharged}
      onChange={(e) =>
        setServiceHistoryForm({
          ...serviceHistoryForm,
          amountCharged: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "12px",
        boxSizing: "border-box"
      }}
    />

    <textarea
      rows="4"
      placeholder="Service Notes"
      value={serviceHistoryForm.notes}
      onChange={(e) =>
        setServiceHistoryForm({
          ...serviceHistoryForm,
          notes: e.target.value
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
      onClick={() =>
  saveCorporateServiceRecord(customer.id)
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
      Save Service Record
    </button>

    <button
      type="button"
      onClick={() => {
        setServiceHistoryCustomerId(null);
        setServiceHistoryForm({
          serviceDate: "",
          serviceType: "",
          serviceStatus: "",
          volume: "",
          amountCharged: "",
          notes: ""
        });
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

{editingServiceCustomerId === customer.id && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      backgroundColor: "white",
      borderRadius: "10px",
      border: "1px solid #cbd5e1"
    }}
  >
    <h4 style={{ color: "#1e3a8a" }}>
      Update Service Details
    </h4>

    <input
      type="text"
      placeholder="Service Plan"
      value={serviceDetailsForm.servicePlan}
      onChange={(e) =>
        setServiceDetailsForm({
          ...serviceDetailsForm,
          servicePlan: e.target.value
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
      placeholder="Pickup Frequency"
      value={serviceDetailsForm.pickupFrequency}
      onChange={(e) =>
        setServiceDetailsForm({
          ...serviceDetailsForm,
          pickupFrequency: e.target.value
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
      placeholder="Service Days"
      value={serviceDetailsForm.serviceDays}
      onChange={(e) =>
        setServiceDetailsForm({
          ...serviceDetailsForm,
          serviceDays: e.target.value
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
      placeholder="Estimated Weekly Volume"
      value={serviceDetailsForm.weeklyVolume}
      onChange={(e) =>
        setServiceDetailsForm({
          ...serviceDetailsForm,
          weeklyVolume: e.target.value
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
      placeholder="Pricing / Rate"
      value={serviceDetailsForm.pricingRate}
      onChange={(e) =>
        setServiceDetailsForm({
          ...serviceDetailsForm,
          pricingRate: e.target.value
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
      type="date"
      value={serviceDetailsForm.serviceStartDate}
      onChange={(e) =>
        setServiceDetailsForm({
          ...serviceDetailsForm,
          serviceStartDate: e.target.value
        })
      }
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        boxSizing: "border-box"
      }}
    />

    <textarea
      rows="4"
      placeholder="Special Handling Instructions"
      value={serviceDetailsForm.specialInstructions}
      onChange={(e) =>
        setServiceDetailsForm({
          ...serviceDetailsForm,
          specialInstructions: e.target.value
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
      onClick={() =>
  saveCorporateServiceDetails(customer.id)
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
      Save Service Details
    </button>

    <button
      type="button"
      onClick={() =>
        setEditingServiceCustomerId(null)
      }
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
</div>

{editingCorporateCustomerId === customer.id && (
  <div
    style={{
      marginTop: "20px",
      padding: "20px",
      backgroundColor: "#f8fafc",
      borderRadius: "10px",
      border: "1px solid #e2e8f0"
    }}
  >
    <h3
      style={{
        marginTop: "0",
        color: "#1e3a8a"
      }}
    >
      Update Company Information
    </h3>

    <input
      type="text"
      placeholder="Company Name"
      value={corporateProfileForm.companyName}
      onChange={(e) =>
        setCorporateProfileForm({
          ...corporateProfileForm,
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
      value={corporateProfileForm.contactName}
      onChange={(e) =>
        setCorporateProfileForm({
          ...corporateProfileForm,
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
      value={corporateProfileForm.phone}
      onChange={(e) =>
        setCorporateProfileForm({
          ...corporateProfileForm,
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
      value={corporateProfileForm.businessType}
      onChange={(e) =>
        setCorporateProfileForm({
          ...corporateProfileForm,
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
      value={corporateProfileForm.businessAddress}
      onChange={(e) =>
        setCorporateProfileForm({
          ...corporateProfileForm,
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
      onClick={() =>
    saveCorporateProfileChanges(customer.id)
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
      Save Changes
    </button>

    <button
      type="button"
      onClick={() =>
        setEditingCorporateCustomerId(null)
      }
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

<p>

 <strong>Account Status:</strong>{" "}

 <span style={{ backgroundColor: "#f59e0b", color: "white", padding: "4px 10px", borderRadius: "999px", fontWeight: "600" }}>

 {customer.accountStatus || "Pending Invitation"}

 </span>

</p>

<button
 type="button"
 onClick={() => sendCorporateCustomerInvite(customer.id)}
 style={{
  marginTop: "10px",
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#2563eb",
  color: "white",
  cursor: "pointer"
 }}
>
 Send Login Invitation
</button>

<div style={{ marginTop: "20px", paddingTop: "15px", borderTop: "1px solid #e5e7eb" }}>

<h4>Contracts</h4>

<div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "15px" }}>
 <span style={{ backgroundColor: "#dc2626", color: "white", padding: "6px 12px", borderRadius: "999px", fontWeight: "600" }}>
 Pending Signature: {corporateContracts.filter((contract) => contract.corporateCustomerId === customer.id && contract.status !== "Signed").length}
 </span>
 <span style={{ backgroundColor: "#16a34a", color: "white", padding: "6px 12px", borderRadius: "999px", fontWeight: "600" }}>
 Signed: {corporateContracts.filter((contract) => contract.corporateCustomerId === customer.id && contract.status === "Signed").length}
 </span>
</div>

<button
 type="button"
 onClick={() =>
 setShowSignedContracts((prev) => ({
 ...prev,
 [customer.id]: !prev[customer.id]
 }))
 }

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

 {showSignedContracts[customer.id]
 ? "Hide Signed Contracts"
 : "Show Signed Contracts"}

</button>

{corporateContracts.filter((contract) => contract.corporateCustomerId === customer.id).length === 0 ? (
 <p>No contract has been added yet.</p>

) : (
 corporateContracts
 .filter((contract) => contract.corporateCustomerId === customer.id && (contract.status !== "Signed" || showSignedContracts[customer.id]))
 .sort((a, b) => (a.status === "Signed" ? 1 : 0) - (b.status === "Signed" ? 1 : 0))
 .map((contract) => (
 <div

 key={contract.id}
 style={{
   marginBottom: "15px",
   padding: "20px",
   backgroundColor: "white",
   borderRadius: "12px",
   border: "1px solid #e2e8f0",
   boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
 }}
>

 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
 <h3 style={{ margin: "0", color: "#1e3a8a" }}>
 {contract.title}
 </h3>
 <span
 style={{
   backgroundColor: contract.status === "Signed" ? "#16a34a" : "#dc2626",
   color: "white",
   padding: "5px 12px",
   borderRadius: "999px",
   fontWeight: "600"
 }}
 >

 {contract.status || "Pending Signature"}
 </span>
 </div>

 {(() => {
 const lifecycle = getContractLifecycleStatus(contract);

 const lifecycleColor =
 lifecycle === "Expired"
 ? "#475569"
 : lifecycle === "Expiring Soon"
 ? "#f59e0b"
 : "#2563eb";
 return (

 <span
 style={{
 display: "inline-block",
 marginTop: "10px",
 backgroundColor: lifecycleColor,
 color: "white",
 padding: "5px 12px",
 borderRadius: "999px",
 fontWeight: "600"
 }}
 >
 {lifecycle}
 </span>
 );
})()}

{getContractLifecycleStatus(contract) === "Expiring Soon" && (
 <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#fff7ed", border: "1px solid #fdba74", borderRadius: "8px", color: "#9a3412" }}>
 <strong>Renewal Reminder</strong>
 <p style={{ margin: "5px 0 0" }}>

 This contract expires on {contract.expirationDate}. Prepare a renewal agreement for this customer.

 </p>
 </div>
)}

{getContractLifecycleStatus(contract) === "Expired" && (
 <div style={{ marginTop: "12px", padding: "12px", backgroundColor: "#f1f5f9", border: "1px solid #94a3b8", borderRadius: "8px", color: "#334155" }}>
 <strong>Contract Expired</strong>
 <p style={{ margin: "5px 0 0" }}>

 This contract expired on {contract.expirationDate}. A new agreement should be created before continuing service under this contract.

 </p>
 </div>
)}

 <div style={{ marginTop: "15px", color: "#475569" }}>

 <p style={{ margin: "6px 0" }}>
 <strong>Effective:</strong> {contract.effectiveDate}
 </p>

 <p style={{ margin: "6px 0" }}>
 <strong>Expires:</strong> {contract.expirationDate || "None"}
 </p>

 </div>

 {contract.status !== "Signed" && (

 <p style={{ marginTop: "15px", color: "#dc2626", fontWeight: "600" }}>

 Awaiting customer signature

 </p>

)}

{contract.status !== "Signed" && (

 <button
 type="button"
 onClick={() => deleteCorporateContract(contract)}
 style={{
   marginTop: "10px",
   padding: "10px 16px",
   borderRadius: "8px",
   border: "none",
   backgroundColor: "#dc2626",
   color: "white",
   cursor: "pointer",
   fontWeight: "600"
 }}
 >

 Delete Contract

 </button>
)}

 {contract.status === "Signed" && (
 <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e2e8f0" }}>

 <p style={{ margin: "6px 0" }}>
 <strong>Signed By:</strong> {contract.signedByName || "Not recorded"}
 </p>

 <p style={{ margin: "6px 0" }}>
 <strong>Signer Email:</strong> {contract.signedByEmail || "Not recorded"}
 </p>

 <p style={{ margin: "6px 0" }}>
 <strong>Signed Date:</strong>{" "}
 {contract.signedAt
 ? new Date(contract.signedAt).toLocaleString()
 : "Not recorded"}
 </p>

 </div>
 )}

 {contract.status === "Signed" && contract.signedPdfStoragePath && (

<button
 type="button"
 onClick={() => downloadSignedContract(contract)}
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

 Download Signed PDF

 </button>

 )}

</div>
 ))
)}

<button
 type="button"
 onClick={() => setContractCustomerId(customer.id)}
 style={{
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  backgroundColor: "#16a34a",
  color: "white",
  cursor: "pointer"
 }}
 >
 + Add Contract
 </button>

{contractCustomerId === customer.id && (
 <div style={{ marginTop: "15px" }}>
 <input
    type="text"
    placeholder="Contract Title"
    value={contractForm.title}
    onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
    style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
 />

 <label>Effective Date</label>

 <input
    type="date"
    value={contractForm.effectiveDate}
    onChange={(e) => setContractForm({ ...contractForm, effectiveDate: e.target.value })}
    style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
 />

 <label>Expiration Date</label>

 <input
    type="date"
    value={contractForm.expirationDate}
    onChange={(e) => setContractForm({ ...contractForm, expirationDate: e.target.value })}
    style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
 />

 <textarea
    placeholder="Contract Terms"
    rows="6"
    value={contractForm.terms}
    onChange={(e) => setContractForm({ ...contractForm, terms: e.target.value })}
    style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
 />

 <button
    type="button"
    onClick={() => saveCorporateContract(customer.id)}
    style={{ padding: "10px 16px", borderRadius: "8px", border: "none", backgroundColor: "#2563eb", color: "white", cursor: "pointer" }}
 >

 Save Contract
 </button>

 <button
    type="button"
    onClick={() => setContractCustomerId(null)}
    style={{ marginLeft: "10px", padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", backgroundColor: "white", cursor: "pointer" }}
 >

 Cancel
 </button>

 </div>
)}

</div>
 </div>
 ))
)}
  </div>
)}

{activeTab === "Settings" && (
  <div style={{ marginTop: "20px" }}>
    <h2>Admin Settings</h2>

  <div
    style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "30px",
        alignItems: "start"
    }}
  >
    {/* LEFT COLUMN */}

    <div>

<h3>Business Information</h3>

    <div style={{ marginBottom: "12px" }}>
      
      <label>Business Name</label>
      <input
  type="text"
  value={businessName}
  onChange={(e) => setBusinessName(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
      
      <label>Admin Name</label>
      <input
  type="text"
  value={adminName}
  onChange={(e) => setAdminName(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
      
      <label>Admin Email</label>
      <input
  type="email"
  value={adminEmail}
  onChange={(e) => setAdminEmail(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
  
      <label>Admin Phone</label>
      <input
  type="text"
  value={adminPhone}
  onChange={(e) => setAdminPhone(e.target.value)}
  style={inputStyle}
/>
    </div>

<div style={{ marginBottom: "12px" }}>
  
      <label>Business Address</label>
      <input
  type="text"
  value={businessAddress}
  onChange={(e) => setBusinessAddress(e.target.value)}
  style={inputStyle}
/>
    </div>

<div style={{ marginBottom: "12px" }}>
  
      <label>Service Radius</label>
      <input
  type="text"
  value={serviceRadius}
  onChange={(e) => setServiceRadius(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
  
      <label>Pickup Hours</label>
      <input
  type="text"
  value={pickupHours}
  onChange={(e) => setPickupHours(e.target.value)}
  style={inputStyle}
/>
    </div>

    <div style={{ marginBottom: "12px" }}>
  
      <label>Delivery Hours</label>
      <input
  type="text"
  value={deliveryHours}
  onChange={(e) => setDeliveryHours(e.target.value)}
  style={inputStyle}
/>
    </div>
</div>

{/* RIGHT COLUMN */}
<div>
<h3>Notification Preferences</h3>

{/* Notification Checkboxes */}

<div style={{ marginBottom: "10px" }}>
  <label>
    <input
      type="checkbox"
      checked={newOrderNotifications}
      onChange={(e) =>
        setNewOrderNotifications(e.target.checked)
      }
    />
    {" "}New Order Notifications
  </label>
</div>

<div style={{ marginBottom: "10px" }}>
  <label>
    <input
      type="checkbox"
      checked={customerMessageNotifications}
      onChange={(e) =>
        setCustomerMessageNotifications(e.target.checked)
      }
    />
    {" "}Customer Message Notifications
  </label>
</div>

<div style={{ marginBottom: "20px" }}>
  <label>
    <input
      type="checkbox"
      checked={pickupReminderNotifications}
      onChange={(e) =>
        setPickupReminderNotifications(e.target.checked)
      }
    />
    {" "}Pickup Reminder Notifications
  </label>
  </div>

  <div style={{ marginTop: "30px" }}>
    <h3>Branding</h3>

    <div style={{ marginBottom: "12px" }}>
  <label>Business Tagline</label>
  <input
    type="text"
    value={businessTagline}
    onChange={(e) => setBusinessTagline(e.target.value)}
    style={inputStyle}
  />
</div>

<div style={{ marginBottom: "12px" }}>
  <label>Primary Brand Color</label>
  <input
    type="color"
    value={primaryColor}
    onChange={(e) => setPrimaryColor(e.target.value)}
  />
</div>

<div style={{ marginBottom: "12px" }}>
  <label>Secondary Brand Color</label>
  <input
    type="color"
    value={secondaryColor}
    onChange={(e) => setSecondaryColor(e.target.value)}
  />
</div>

   <div style={{ marginBottom: "12px" }}>
  <label>Admin Logo</label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        setLogoFile(file);

        const previewUrl = URL.createObjectURL(file);
        setAdminLogoUrl(previewUrl);
      }
    }}
  />
</div>

{adminLogoUrl && (
  <div style={{ marginTop: "15px" }}>
    <img
      src={adminLogoUrl}
      alt="Business Logo"
      style={{
        maxWidth: "200px",
        maxHeight: "120px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1"
      }}
      />
      </div>
)}

<div style={{ marginBottom: "12px" }}>
  <label>Customer Logo</label>

  <input
    type="file"
    accept="image/*"
    onChange={(e) => {
      const file = e.target.files?.[0];

      if (file) {
        setCustomerLogoFile(file);

        const previewUrl = URL.createObjectURL(file);
        setCustomerLogoUrl(previewUrl);
      }
    }}
  />
</div>
    
{customerLogoUrl && (
  <div style={{ marginTop: "15px" }}>
    <img
      src={customerLogoUrl}
      alt="Customer Logo"
      style={{
        maxWidth: "200px",
        maxHeight: "120px",
        borderRadius: "8px",
        border: "1px solid #cbd5e1"
      }}
      />
      </div>
)}

  </div>
</div>

</div>

{/* END GRID */}

<div style={{ marginTop: "30px" }}>
  <button
    onClick={saveSettings}
    style={saveButton}
  >
    Save Settings
  </button>
</div>

</div>
)}

          {activeTab === "Customers" && (
  <div style={{ marginTop: "20px" }}>
    <h2>Customers</h2>

{selectedCustomer && (
  <div
    style={{
      backgroundColor: "#eff6ff",
      padding: "20px",
      borderRadius: "12px",
      marginBottom: "20px"
    }}
  >
    <h2>
      {selectedCustomer.firstName}{" "}
      {selectedCustomer.lastName}
    </h2>

    <p>
      <strong>Email:</strong>{" "}
      {selectedCustomer.email}
    </p>

    <p>
      <strong>Phone:</strong>{" "}
      {selectedCustomer.phone}
    </p>

    <p>
      <strong>Preferred Detergent:</strong>{" "}
      {selectedCustomer.preferredDetergent ||
        "None"}
    </p>

    <p>
      <strong>Special Instructions:</strong>{" "}
      {selectedCustomer.specialInstructions ||
        "None"}
    </p>

    <hr />

<h3>Pickup Address</h3>

<p>
  {selectedCustomer.pickupAddress ||
    "No pickup address saved"}
</p>

<p>
  {selectedCustomer.pickupCity}, CA{" "}
  {selectedCustomer.pickupZip}
</p>

<p>
  {selectedCustomer.pickupUnit ||
    "No Unit / Gate Code"}
</p>

<hr />

<h3>Delivery Address</h3>

{selectedCustomer.deliveryAddress ? (
  <>
    <p>{selectedCustomer.deliveryAddress}</p>

    <p>
      {selectedCustomer.deliveryCity}, CA{" "}
      {selectedCustomer.deliveryZip}
    </p>

    <p>
      {selectedCustomer.deliveryUnit ||
        "No Unit / Gate Code"}
    </p>
  </>
) : (
  <p>Same as Pickup Address</p>
)}

<hr />

<h3>Customer Metrics</h3>

<p>
  <strong>Total Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
        selectedCustomer.email?.toLowerCase()
    ).length
  }
</p>

<p>
  <strong>Active Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
          selectedCustomer.email?.toLowerCase() &&
        order.status !== "Order Complete" &&
        order.status !== "Cancelled"
    ).length
  }
</p>

<p>
  <strong>Lifetime Spend:</strong> $
  {orders
    .filter(
      (order) =>
        order.email?.toLowerCase() ===
        selectedCustomer.email?.toLowerCase()
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.grandTotal || 0),
      0
    )
    .toFixed(2)}
</p>

<hr />

<h3>Recent Orders</h3>

{orders
  .filter(
    (order) =>
      order.email?.toLowerCase() ===
      selectedCustomer.email?.toLowerCase()
  )
  .slice(0, 5)
  .map((order) => (
    <div
      key={order.id}
      style={{
        backgroundColor: "#f8fafc",
        padding: "12px",
        borderRadius: "8px",
        marginBottom: "10px"
      }}
    >
      <button
  onClick={() => {
    setActiveTab("Orders");

    const orderElement =
      document.getElementById(
        `order-${order.id}`
      );

    if (orderElement) {
      orderElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }}
  style={{
    background: "none",
    border: "none",
    color: "#2563eb",
    cursor: "pointer",
    fontWeight: "bold",
    padding: 0
  }}
>
  {order.orderId}
</button>


      <p>
        Status: {order.status}
      </p>

      <p>
        Total: $
        {Number(order.grandTotal || 0).toFixed(2)}
      </p>

      <p>
        Pickup: {order.pickupDate || "Not Set"}
      </p>
    </div>
  ))}

  </div>
)}

    {customers.length === 0 ? (
  <p>No customers found.</p>
) : (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px"
    }}
  >
    {customers.map((customer) => (
      <div
        key={customer.id}
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
        }}
      >
        <h3>
          {customer.firstName} {customer.lastName}
        </h3>

        <p>
          <strong>Email:</strong> {customer.email}
        </p>

        <p>
          <strong>Phone:</strong> {customer.phone}
        </p>

        <p>
  <strong>Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
        customer.email?.toLowerCase()
    ).length
  }
</p>

<p>
  <strong>Active Orders:</strong>{" "}
  {
    orders.filter(
      (order) =>
        order.email?.toLowerCase() ===
          customer.email?.toLowerCase() &&
        order.status !== "Order Complete" &&
        order.status !== "Cancelled"
    ).length
  }
</p>

<p>
  <strong>Lifetime Spend:</strong> $
  {orders
    .filter(
      (order) =>
        order.email?.toLowerCase() ===
        customer.email?.toLowerCase()
    )
    .reduce(
      (sum, order) =>
        sum + Number(order.grandTotal || 0),
      0
    )
    .toFixed(2)}
</p>

<button
  onClick={() =>
    setSelectedCustomer(customer)
  }
  style={{
    marginTop: "10px",
    padding: "10px 16px",
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
  }}
>
  View Profile
</button>

      </div>
    ))}
  </div>
)}
</div>)}

{activeTab === "Orders" && (

        <div style={{ marginTop: "20px" }}>
          {filteredOrders.length === 0 ? (
            <div style={statCard}>No matching orders found</div>
          ) : (
            filteredOrders.map((order) => {
              const estimatedLbs =
                Number(order.washFoldLbs || 0) + Number(order.foldOnlyLbs || 0);

              return (
                <div
  id={`order-${order.id}`}
  key={order.id}
  style={{
                    ...orderCard,
                    backgroundColor: getColor(order.tagColor)
                  }}
                >
                  <h3>{order.orderId || "No Order Number"}</h3>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "16px",
                      justifyItems: "center"
                    }}
                  >
                    <div style={{ width: "100%" }}>
                      <div style={fieldLabel}>Customer Name</div>
                      <input
                        value={order.name || ""}
                        onChange={(e) => updateField(order.id, "name", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Phone</div>
                      <input
                        value={order.phone || ""}
                        onChange={(e) => updateField(order.id, "phone", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Email</div>
                      <input
                        value={order.email || ""}
                        onChange={(e) => updateField(order.id, "email", e.target.value)}
               style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Address</div>
                      <input
                        value={order.address || ""}
                        onChange={(e) => updateField(order.id, "address", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>City / State / ZIP</div>
                      <input
                        value={order.cityStateZip || ""}
                        onChange={(e) => updateField(order.id, "cityStateZip", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Pickup / Delivery</div>
                      <div>
                        <p>Pickup: {order.pickupDate || "No Date"} {order.pickupTime || ""}</p>
                        <p>Delivery: {order.estimatedDelivery || "Not set"}</p>
                      </div>
                    </div>

                    <div style={{ width: "100%" }}>
                      <div style={fieldLabel}>Status</div>
                      <select
                        value={order.status || ""}
                        onChange={(e) => updateField(order.id, "status", e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">Select Status</option>
                        <option>Accepted</option>
                        <option>Pending Pickup</option>
                        <option>Picked Up</option>
                        <option>In Process</option>
                        <option>Ready For Drop-Off</option>
                        <option>Delivered</option>
                        <option>Order Complete</option>
                        <option>Cancelled</option>
                      </select>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Color Tag</div>
                      <select
                        value={order.tagColor || ""}
                        onChange={(e) => updateField(order.id, "tagColor", e.target.value)}
                        style={selectStyle}
                      >
                        <option value="">Select Color</option>
                        <option>Yellow</option>
                        <option>Purple</option>
                        <option>Pink</option>
                        <option>Teal</option>
                      </select>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Paid / Unpaid</div>
                      <select
                        value={order.paid ? "Paid" : "Unpaid"}
                        onChange={(e) => updateField(order.id, "paid", e.target.value === "Paid")}
                        style={selectStyle}
                      >
                        <option>Unpaid</option>
                        <option>Paid</option>
                      </select>

                      <p style={{ marginTop: "10px" }}>
                        <strong>{order.paid ? "Paid" : "Unpaid"}</strong>
                      </p>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Detergent</div>
                      <input
                        value={order.detergentChoice || ""}
                        onChange={(e) => updateField(order.id, "detergentChoice", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Add-Ons</div>
                      <textarea
                        value={getAddonsText(order)}
                        readOnly
                        style={{ ...inputStyle, minHeight: "70px" }}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Estimated Weight</div>
                      <p>{estimatedLbs} lbs</p>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Customer Total</div>
                      <p>${Number(order.grandTotal || 0).toFixed(2)}</p>

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Final Weight (lbs)</div>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={order.finalWeight}
                        onChange={(e) => updateField(order.id, "finalWeight", e.target.value)}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Final Cost</div>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={Number(order.finalCost || 0).toFixed(2)}
                        onChange={(e) => updateField(order.id, "finalCost", Number(e.target.value))}
                        style={inputStyle}
                      />

                      <div style={{ ...fieldLabel, marginTop: "10px" }}>Notes</div>
                      <textarea
                        value={order.notes || ""}
                        onChange={(e) => updateField(order.id, "notes", e.target.value)}
                        style={{ ...inputStyle, minHeight: "90px" }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "18px", textAlign: "center" }}>
                    <button
                      onClick={() => saveOrder(order)}
                      style={saveButton}
                    >
                      {savingId === order.id ? "Saving..." : "Save"}
                    </button>
                    <button
  onClick={() =>
    navigate(`/admin/messages/${order.id}`)
  }
  style={{
    marginLeft: "10px",
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#6366f1",
    color: "white",
    cursor: "pointer"
  }}
>
  Message Customer
</button>
                    {showArchived ? (
                      <button
                        onClick={() => restoreOrder(order.id)}
                        style={{
                          marginLeft: "10px",
                          padding: "12px 18px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#16a34a",
                          color: "white",
                          cursor: "pointer"
                        }}
                      >
                        Restore
                      </button>
                    ) : (
                      <button
                        onClick={() => archiveOrder(order.id)}
                        style={{
                          marginLeft: "10px",
                          padding: "12px 18px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#f59e0b",
                          color: "white",
                          cursor: "pointer"
                        }}
                      >
                        Archive
                      </button>
                    )}

<button
  onClick={() => deleteOrder(order.id)}
  style={{
    marginLeft: "10px",
    padding: "12px 18px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#dc2626",
    color: "white",
    cursor: "pointer"
  }}
>
  Delete
</button>

                  </div>
                </div>
              );
            })
          )}
        </div>
)}
      </div>
    </div>
  );
}