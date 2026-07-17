import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Home from "./pages/Home";
import BookingStep1 from "./pages/BookingStep1";
import BookingStep2 from "./pages/BookingStep2";
import BookingStep3Contact from "./pages/BookingStep3Contact";
import BookingStep3Detergent from "./pages/BookingStep3Detergent";
import BookingStep3AddOns from "./pages/BookingStep3AddOns";
import BookingStep3Notes from "./pages/BookingStep3Notes";
import BookingStep4 from "./pages/BookingStep4";
import BookingSuccess from "./pages/BookingSuccess";
import Terms from "./pages/Terms";
import AdminSchedule from "./pages/AdminSchedule";
import AdminServices from "./pages/AdminServices";
import AdminLogin from "./pages/AdminLogin";
import CustomerHome from "./pages/CustomerHome";
import CustomerLogin from "./pages/CustomerLogin";
import CreateAccount from "./pages/CreateAccount";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/" element={<Home />} />
        <Route path="/booking/step1" element={<BookingStep1 />} />
        <Route path="/booking/step2" element={<BookingStep2 />} />
        <Route path="/booking/step3/contact" element={<BookingStep3Contact />} />
        <Route path="/booking/step3/detergent" element={<BookingStep3Detergent />} />
        <Route path="/booking/step3/addons" element={<BookingStep3AddOns />} />
        <Route path="/booking/step3/notes" element={<BookingStep3Notes />} />
        <Route path="/booking/step4" element={<BookingStep4 />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/admin/schedule" element={<AdminSchedule />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/customer" element={<CustomerHome />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </BrowserRouter>
  );
}