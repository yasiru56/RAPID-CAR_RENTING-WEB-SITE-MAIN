const Booking = require("../models/Booking");

const {
  sendBookingApprovalEmail,
  sendOwnerConfirmationEmail,
} = require("../utils/email");

exports.createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: "Booking request sent!", booking });
  } catch (err) {
    console.error("❌ Booking Error:", err.message);
    res.status(500).json({ message: "Failed to create booking" });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().populate("vehicleId");
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("vehicleId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Booking update error:", error);
    res.status(500).json({ 
      message: "Failed to update booking status",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking successfully cancelled and deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.notifyOwnerOnConfirmation = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId).populate("vehicleId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const ownerEmail = "shanukamaduranga2000@gmail.com" ; // Replace with real field
    const vehicleName = booking.vehicleId.name ;

    await sendOwnerConfirmationEmail(
      ownerEmail,
      booking.renterName,
      vehicleName
    );

    res.json({ message: "Owner notified successfully." });
  } catch (err) {
    console.error("❌ Owner notification error:", err.message);
    res.status(500).json({ message: "Failed to notify owner." });
  }
};
