import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Report from "./pages/Report";
import WarehouseForm from "./pages/WarehouseForm";
import CreateReport from "./pages/CreateReport";
import HealthManager from "./pages/HealthManager";
import HealthStudent from "./pages/HealthStudent";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ListStudent from "./pages/ListStudent";
import KitchenMenu from "./pages/KitchenMenu";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/kitchenmenu" element={<KitchenMenu />} />
        <Route path="/health" element={<HealthManager />} />
        <Route path="/healthstudent" element={<HealthStudent />} />
        <Route path="/report" element={<Report />} />
        <Route path="/create" element={<CreateReport />} />
        <Route path="/warehouse" element={<WarehouseForm />} />
        <Route path="/students" element={<ListStudent />} />

      </Routes>
    </BrowserRouter>

  );
}

export default App;
