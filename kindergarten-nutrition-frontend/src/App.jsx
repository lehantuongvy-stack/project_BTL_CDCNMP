import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Report from "./pages/Report";
import WarehouseForm from "./pages/WarehouseForm";
import CreateReport from "./pages/CreateReport";
import HealthManager from "./pages/HealthManager";
import HealthStudent from "./pages/HealthStudent";
import Home from "./pages/Home";
import Login from "./pages/login";
import ThuvienMonan from "./pages/thuvienmonan";
import ChitietMon from "./pages/chitietmonan";
import AdminDashboard from "./pages/AdminDashboard";
import UserRegistration from "./pages/UserRegistration";
import ParentRegistration from "./pages/ParentRegistration";
import ChildRegistrationForm from "./pages/ChildRegistrationForm";
import AccountInfo from "./pages/AccountInfo";
import ParentCorner from "./pages/ParentCorner";
import Tre from "./pages/Tre";
import KitchenMenu from "./pages/KitchenMenu";
import ListStudent from "./pages/ListStudent";

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
          <Route path="/admin/register/type/:type" element={
            <ProtectedRoute requiredRole="admin">
              <ParentRegistration />
            </ProtectedRoute>
          } />
          <Route path="/admin/create-child" element={
            <ProtectedRoute requiredRole="admin">
              <ChildRegistrationForm />
            </ProtectedRoute>
          } />
          <Route path="/account-info" element={
            <ProtectedRoute>
              <AccountInfo />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
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
            <ProtectedRoute requiredRole="parent">
              <HealthStudent />
            </ProtectedRoute>
          } />
          <Route path="/health-manager" element={
            <ProtectedRoute requiredRole="teacher">
              <HealthManager />
            </ProtectedRoute>
          } />
          <Route path="/thuvienmonan" element={
            <ProtectedRoute>
              <ThuvienMonan />
            </ProtectedRoute>
          } />
          <Route path="/kitchen-menu" element={
            <ProtectedRoute requiredRole="teacher">
              <KitchenMenu />
            </ProtectedRoute>
          } />
          <Route path="/tre" element={
            <ProtectedRoute requiredRole="parent">
              <Tre />
            </ProtectedRoute>
          } />
          <Route path="/list-students" element={
            <ProtectedRoute requiredRole="teacher">
              <ListStudent />
            </ProtectedRoute>
          } />
          <Route path="/report" element={
            <ProtectedRoute requiredRole={["teacher", "admin"]}>
              <Report />
            </ProtectedRoute>} />
          <Route path="/create" element={<CreateReport />} />
          <Route path="/reports/:id" element={
            <ProtectedRoute requiredRole={["teacher", "admin"]}>
              <CreateReport readOnly={true} />
            </ProtectedRoute>
          } />
          <Route path="/mon/:id" element={<ChitietMon />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
