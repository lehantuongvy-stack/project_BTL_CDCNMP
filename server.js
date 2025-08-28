const express = require("express");
const app = express();
const PORT = 3000;

// Middleware để parse JSON
app.use(express.json());

// Route test
app.get("/", (req, res) => {
  res.send("Hello, backend đã chạy thành công!");
});

// Chạy server
app.listen(PORT, () => {
  console.log(`✅ Server đang chạy tại http://localhost:${PORT}`);
});
