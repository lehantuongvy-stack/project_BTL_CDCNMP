import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Report from "./pages/Report";    
import WarehouseForm from "./pages/WarehouseForm";
import CreateReport from "./pages/CreateReport";
import Parent from "./pages/Parent";
import Home from "./pages/Home";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/report" element={<Report />} />
        <Route path="/create" element={<CreateReport />} />
        <Route path="/home" element={<Home />} />
        <Route path="/warehouse" element={<WarehouseForm />} />
        // Route mặc định chuyển về /report
        {/* <Route path="*" element={<Report />} /> */}
        <Route path="parent" element={<Parent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
