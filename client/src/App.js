import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// Components
import OwnerNavbar from "./components/OwnerNavbar.jsx";
import RenterNavbar from "./components/RenterNavbar.jsx";
import AdminNavbar from "./components/AdminNavbar.jsx";
import Footer from "./components/Footer";

// Owner Panel
import VehicleForm from "./pages/owner/VehicleForm.jsx";
import VehicleOwnerList from "./pages/owner/VehicleOwnerList.jsx";
import Home from "./pages/owner/Home.jsx";

// Admin Panel
import AdminApprovals from "./pages/admin/approvals.jsx";

// Renters UI
import RenterHome from "./pages/renters/renterHome.jsx";
import Catalog from "./pages/renters/Catalog";
import CarDetails from "./pages/renters/CarDetails";
import BookingForm from "./pages/renters/BookingForm";
import MyBookings from "./pages/renters/MyBooking.jsx";
import PaymentPage from "./pages/renters/PaymentPage.jsx";
import Wishlist from "./pages/renters/Wishlist.jsx";

// Chat System
import { ChatProvider } from "./context/ChatContext";
import ChatRoom from "./pages/chat/ChatRoom";

import BookingRequests from "./pages/owner/BookingRequests";
import "bootstrap/dist/css/bootstrap.min.css";

import StartPage from './pages/renters/StartPage.jsx';
//import AdminStartPage from './pages/admin/AdminStartPage';
import Register from './pages/renters/Register.jsx';
import Login from './pages/renters/Login.jsx';
import AdminRegister from './pages/admin/AdminRegister';
import { ProtectedAdminRoute, FreeRoute } from './pages/admin/ProtectedAdminRoute.jsx';
import AdminLogin from './pages/admin/AdminLogin';
import UserProfile from './pages/renters/UserProfile.jsx';
import OwnerStartPage from './pages/owner/OwnerStartPage';
import OwnerLogin from './pages/owner/OwnerLogin';
import OwnerRegister from './pages/owner/OwnerRegister';
import { ProtectedOwnerRoute } from './pages/owner/ProtectedOwnerRoute';
import './App.css';

function Layout() {
  const location = useLocation();
  
  // Don't show header/footer on login/register pages
  const noHeaderPaths = [
    '/',
    '/user/register',
    '/user/login',
    '/admin/login',
    '/admin/register',
    '/admin/first-register',
    '/owner/startpage',
    '/owner/login',
    '/owner/register',
  ];
  
  const shouldShowHeaderFooter = !noHeaderPaths.includes(location.pathname);
  
  // Determine which navbar to show based on path
  const getNavbar = () => {
    const path = location.pathname;
    if (path.startsWith('/owner')) {
      return <OwnerNavbar />;
    } else if (path.startsWith('/admin')) {
      return <AdminNavbar />;
    } else {
      return <RenterNavbar />;
    }
  };

  return (
    <>
      {shouldShowHeaderFooter && getNavbar()}
      
      <Routes>
        {/* Free routes (no auth required) */}
        <Route element={<FreeRoute />}>
          <Route path="/" element={<StartPage />} />
          <Route path='/user/register' element={<Register />} />
          <Route path='/user/login' element={<Login />} />
          <Route path='/admin/first-register' element={<AdminRegister isFirstAdmin={true} />} />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/owner/startpage' element={<OwnerStartPage/>}/>
          <Route path='/owner/login' element={<OwnerLogin/>}/>
          <Route path='/owner/register' element={<OwnerRegister/>}/> 
        </Route>

        {/* Public Routes with header/footer */}
        <Route path="/home" element={<RenterHome />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/car/:id" element={<CarDetails />} />
        <Route path="/book/:id" element={<BookingForm />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path='/user/userprofile' element={<UserProfile/>}/>
        
        {/* Chat Routes */}
        <Route path="/chat/:vehicleId/:conversationId" element={<ChatRoom />} />

        {/* Protected Owner Routes */}
        <Route element={<ProtectedOwnerRoute />}>
          <Route path="/owner/home" element={<Home/>} />
          <Route path="/owner/dashboard" element={<VehicleOwnerList />} />
          <Route path="/owner/add-vehicle" element={<VehicleForm />} />
          <Route path="/owner/edit-vehicle/:id" element={<VehicleForm />} />
          <Route path="/owner/my-bookings" element={<BookingRequests />} />
          <Route path="/owner/profile" element={<UserProfile />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path='/admin/dashboard' element={<UserProfile />} />
          <Route path='/admin/register' element={<AdminRegister isFirstAdmin={false} />} />
        </Route>
      </Routes>

      {shouldShowHeaderFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <ChatProvider>
        <Layout />
      </ChatProvider>
    </Router>
  );
}