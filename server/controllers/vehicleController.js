const Vehicle = require("../models/Vehicle");
const fs = require("fs");
const path = require("path");

// CREATE VEHICLE (WITH PENDING STATUS)
exports.createVehicle = async (req, res) => {
  try {
    // Debug what we're receiving
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Owner from request:", req.body.owner);
    console.log("Owner email from request:", req.body.ownerEmail);
    
    // Validate required fields with detailed messages
    const requiredFields = {
      name: 'Vehicle name is required',
      price: 'Price is required and must be a number',
      type: 'Vehicle type is required',
      location: 'Location is required',
      owner: 'Owner ID is required',
      ownerEmail: 'Owner email is required',
    };

    const errors = [];
    Object.entries(requiredFields).forEach(([field, message]) => {
      if (!req.body[field]) {
        errors.push(message);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors 
      });
    }

    // Validate price is a number
    if (isNaN(parseFloat(req.body.price))) {
      return res.status(400).json({
        message: 'Invalid price format',
        details: 'Price must be a valid number'
      });
    }

    // Process images if they exist
    const imagePaths = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];

    const newVehicle = new Vehicle({
      name: req.body.name,
      brand: req.body.brand || '',
      year: parseInt(req.body.year) || 2023,
      price: parseFloat(req.body.price),
      type: req.body.type,
      seats: parseInt(req.body.seats) || 5,
      location: req.body.location,
      description: req.body.description || '',
      ownerContact: req.body.ownerContact || '',
      owner: req.body.owner,
      ownerEmail: req.body.ownerEmail,
      images: imagePaths,
      thumbnail: imagePaths[0] || null,
      status: req.body.status || "pending"
    });

    // Log the vehicle object before saving
    console.log("Attempting to save vehicle:", {
      name: newVehicle.name,
      owner: newVehicle.owner,
      ownerEmail: newVehicle.ownerEmail
    });

    const savedVehicle = await newVehicle.save();
    res.status(201).json(savedVehicle);

  } catch (error) {
    console.error('Database save error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
};

// ADMIN: GET PENDING VEHICLES
exports.getPendingVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: "pending" });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADMIN: APPROVE VEHICLE
exports.approveVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ADMIN: REJECT VEHICLE
exports.rejectVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { 
        status: "rejected",
        rejectionReason: req.body.reason 
      },
      { new: true }
    );
    
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.status(200).json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET APPROVED VEHICLES (FOR CATALOG)
exports.getApprovedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ status: "approved" });
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ (Owner's Vehicles)
exports.getOwnerVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ /* Add owner filtering logic here */ });
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE VEHICLE
exports.updateVehicle = async (req, res) => {
  try {
    const { name, brand, price, type, seats, location, description, thumbnail } = req.body;
    const existingImages = Array.isArray(req.body.existingImages) 
      ? req.body.existingImages 
      : [req.body.existingImages];

    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Clean up removed images
    const imagesToDelete = vehicle.images.filter(img => !existingImages.includes(img));
    imagesToDelete.forEach(imgPath => {
      const fullPath = path.join(__dirname, "..", imgPath);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    });

    // Handle new images
    const newImages = (req.files || []).map(file => file.path.replace(/\\/g, "/"));
    const allImages = [...existingImages, ...newImages];

    // Update thumbnail
    const thumbnailPath = allImages.find(imgPath => 
      path.basename(imgPath) === thumbnail
    ) || allImages[0];

    // Update vehicle
    Object.assign(vehicle, {
      name,
      brand,
      price,
      type,
      seats,
      location,
      description,
      images: allImages,
      thumbnail: thumbnailPath
    });

    await vehicle.save();
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE VEHICLE
exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

    // Delete associated images
    const deleteFile = (path) => {
      if (fs.existsSync(path)) fs.unlinkSync(path);
    };

    vehicle.images.forEach(imgPath => {
      deleteFile(path.join(__dirname, "..", imgPath));
    });

    if (vehicle.thumbnail && !vehicle.images.includes(vehicle.thumbnail)) {
      deleteFile(path.join(__dirname, "..", vehicle.thumbnail));
    }

    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET SINGLE VEHICLE BY ID
exports.getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
