import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Report from "./pages/Report";    
import WarehouseForm from "./pages/WarehouseForm";
import CreateReport from "./pages/CreateReport";

function App() {
  return (

    <BrowserRouter>
      <Routes>
        <Route path="/report" element={<Report />} />
        <Route path="/create" element={<CreateReport />} />
        {/* <Route path="/warehouse" element={<WarehouseForm />} /> */}
        {/* Route mặc định chuyển về /report */}
        <Route path="*" element={<Report />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;
