import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Report from "./pages/Report";
import WarehouseForm from "./pages/WarehouseForm";
import CreateReport from "./pages/CreateReport";
import HealthManager from "./pages/HealthManager";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Login from "./pages/login";
import ThuvienMonan from "./pages/thuvienmonan";
import ChitietMon from "./pages/chitietmonan";
import AdminDashboard from "./pages/AdminDashboard";
import UserRegistration from "./pages/UserRegistration";
import ParentRegistration from "./pages/ParentRegistration";
import About from "./pages/About";
import ParentCorner from "./pages/ParentCorner";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/register" element={
            <ProtectedRoute requiredRole="admin">
              <ParentRegistration />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          } />
          <Route path="/warehouse" element={
            <ProtectedRoute>
              <WarehouseForm />
            </ProtectedRoute>
          } />
          <Route path="/parent" element={
            <ProtectedRoute>
              <ParentCorner />
            </ProtectedRoute>
          } />
          <Route path="/health" element={
            <ProtectedRoute>
              <HealthManager />
            </ProtectedRoute>
          } />
          <Route path="/thuvienmonan" element={
            <ProtectedRoute>
              <ThuvienMonan />
            </ProtectedRoute>
          } />
          <Route path="/menu" element={<Menu />} />
          <Route path="/report" element={<Report />} />
          <Route path="/create" element={<CreateReport />} />
          <Route path="/mon/:id" element={<ChitietMon />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
