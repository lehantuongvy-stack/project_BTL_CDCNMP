import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ChaoGa from "./chao-ga";
import CanhRauNgot from "./canh-rau-ngot";
import ComTrang from "./com-trang";
import DuaHau from "./dua-hau";
import SuaChua from "./sua-chua";
import XoiLac from "./xoi-lac";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h2>Trang chủ</h2>} />
        <Route path="/chao-ga" element={<ChaoGa />} />
        <Route path="/canh-rau-ngot" element={<CanhRauNgot />} />
        <Route path="/com-trang" element={<ComTrang />} />
        <Route path="/dua-hau" element={<DuaHau />} />
        <Route path="/sua-chua" element={<SuaChua />} />
        <Route path="/xoi-lac" element={<XoiLac />} />
      </Routes>
    </Router>
  );
}

export default App;