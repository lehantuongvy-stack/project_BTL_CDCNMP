const express = require("express");
const router = express.Router();
const NutritionReportController = require("../controllers/NutritionrpController");

// Truyền db vào controller
module.exports = (db) => {
  const controller = new NutritionrpController(db);

  router.get("/nutritionrp", (req, res) => controller.getAllReports(req, res));
  router.post("/nutritionrp", (req, res) => controller.createReport(req, res));
  router.get("/nutritionrp/:id", (req, res) => controller.getReportById(req, res));
  router.put("/nutritionrp/:id", (req, res) => controller.updateReport(req, res));
  router.delete("/nutritionrp/:id", (req, res) => controller.deleteReport(req, res));
  router.get("/search", (req, res) => controller.searchReports(req, res));

  return router;
};
