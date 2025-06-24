const express = require("express");
const {
  createVehicle,
  getOwnerVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  getPendingVehicles,
  approveVehicle,
  rejectVehicle,
  getApprovedVehicles
} = require("../controllers/vehicleController");
const upload = require("../middlewares/upload");

const router = express.Router();

// TODO: Add authentication middleware later
router.post("/", upload.array("images", 6), createVehicle);
router.get("/", getOwnerVehicles);
router.get("/pending", getPendingVehicles); // New admin endpoint
router.get("/:id", getVehicleById);
router.put("/:id", upload.array("images", 6), updateVehicle);
router.delete("/:id", deleteVehicle);

// Approval system endpoints
router.patch("/:id/approve", approveVehicle);
router.patch("/:id/reject", rejectVehicle);
router.get("/approved", getApprovedVehicles);

module.exports = router;
