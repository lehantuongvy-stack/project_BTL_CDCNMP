import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ThuvienMonan from "./pages/thuvienmonan";
import ChitietMon from "./pages/chitietmonan";
import Login from "./pages/login";  

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ThuvienMonan />} />
        <Route path="/mon/:id" element={<ChitietMon />} />
        
      </Routes>
    </Router>
  );
}

export default App;