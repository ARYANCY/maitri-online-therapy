const mongoose = require("mongoose");
const Joi = require("joi");
const DOCH = require("../models/DOCH");
const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");
const { isValidObjectId } = require("../utils/validation");
const { PRIORITY, PAGINATION, LIMITS } = require("../constants");

const dochSchema = Joi.object({
  name: Joi.string().trim().min(LIMITS.NAME_MIN).max(LIMITS.NAME_MAX).required(),
  email: Joi.string().email().trim().lowercase().max(LIMITS.EMAIL_MAX).required(),
  specialization: Joi.string().trim().max(LIMITS.SPECIALIZATION_MAX).required(),
  experience: Joi.number().min(0).max(LIMITS.EXPERIENCE_MAX).required(),
  priority: Joi.number().min(PRIORITY.MIN).max(PRIORITY.MAX).default(PRIORITY.DEFAULT),
  availability: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      time_slots: Joi.array().items(
        Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      ).min(1).required()
    })
  ).default([]),
  isActive: Joi.boolean().default(true)
});

const updateDOCHSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).optional(),
  preferredName: Joi.string().trim().max(50).allow("").optional(),
  gender: Joi.string().valid("Male", "Female", "Non-binary", "Prefer not to say", "Other").optional(),
  pronouns: Joi.string().valid("He/Him", "She/Her", "They/Them", "Other").optional(),
  profilePhoto: Joi.string().uri().allow("").optional(),
  email: Joi.string().email().trim().lowercase().optional(),
  phone: Joi.string().trim().max(20).allow("").optional(),
  city: Joi.string().trim().max(100).allow("").optional(),
  state: Joi.string().trim().max(100).allow("").optional(),
  country: Joi.string().trim().max(100).allow("").optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    relationship: Joi.string().trim().optional()
  }).optional(),
  roleCategories: Joi.array().items(Joi.string()).optional(),
  highestQualification: Joi.string().trim().max(200).optional(),
  dementiaCertifications: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().optional(),
      issuingBody: Joi.string().trim().optional(),
      year: Joi.number().optional(),
      expiryDate: Joi.date().optional().allow(null)
    })
  ).optional(),
  licenseNumber: Joi.string().trim().max(100).allow("").optional(),
  licenseFiles: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().optional(),
      fileName: Joi.string().optional(),
      uploadedAt: Joi.date().optional()
    })
  ).optional(),
  yearsInDementiaCare: Joi.number().min(0).max(70).optional(),
  previousInstitutions: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().optional(),
      role: Joi.string().trim().optional(),
      duration: Joi.string().trim().optional(),
      location: Joi.string().trim().optional()
    })
  ).optional(),
  dementiaTypesExperienced: Joi.array().items(Joi.string()).optional(),
  dementiaStagesHandled: Joi.array().items(Joi.string()).optional(),
  shortBio: Joi.string().trim().max(1500).allow("").optional(),
  specialSkills: Joi.array().items(Joi.string()).optional(),
  languagesSpoken: Joi.array().items(Joi.string()).optional(),
  sessionDuration: Joi.number().valid(30, 45, 60, 90, 120).optional(),
  preferredCommunicationMode: Joi.array().items(Joi.string()).optional(),
  consultationFee: Joi.object({
    initial: Joi.number().min(0).optional(),
    followUp: Joi.number().min(0).optional(),
    homeVisit: Joi.number().min(0).optional()
  }).optional(),
  acceptsInsurance: Joi.boolean().optional(),
  insuranceProviders: Joi.array().items(Joi.string()).optional(),
  priority: Joi.number().min(1).max(10).optional(),
  availability: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      time_slots: Joi.array().items(
        Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      ).min(1).required()
    })
  ).optional(),
  isActive: Joi.boolean().optional(),
  name: Joi.string().trim().optional(),
  specialization: Joi.string().trim().optional(),
  experience: Joi.number().optional()
});

const applyDOCHSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required(),
  preferredName: Joi.string().trim().max(50).allow("").optional(),
  gender: Joi.string().valid("Male", "Female", "Non-binary", "Prefer not to say", "Other").default("Prefer not to say"),
  pronouns: Joi.string().valid("He/Him", "She/Her", "They/Them", "Other").default("They/Them"),
  profilePhoto: Joi.string().uri().allow("").optional(),
  email: Joi.string().email().trim().lowercase().required(),
  phone: Joi.string().trim().max(20).allow("").optional(),
  city: Joi.string().trim().max(100).allow("").optional(),
  state: Joi.string().trim().max(100).allow("").optional(),
  country: Joi.string().trim().max(100).allow("").optional(),
  emergencyContact: Joi.object({
    name: Joi.string().trim().optional(),
    phone: Joi.string().trim().optional(),
    relationship: Joi.string().trim().optional()
  }).default({}),
  roleCategories: Joi.array().items(Joi.string()).default([]),
  highestQualification: Joi.string().trim().max(200).required(),
  dementiaCertifications: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().optional(),
      issuingBody: Joi.string().trim().optional(),
      year: Joi.number().optional(),
      expiryDate: Joi.date().optional().allow(null)
    })
  ).default([]),
  licenseNumber: Joi.string().trim().max(100).allow("").optional(),
  licenseFiles: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().optional(),
      fileName: Joi.string().optional(),
      uploadedAt: Joi.date().optional()
    })
  ).default([]),
  yearsInDementiaCare: Joi.number().min(0).max(70).required(),
  previousInstitutions: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().optional(),
      role: Joi.string().trim().optional(),
      duration: Joi.string().trim().optional(),
      location: Joi.string().trim().optional()
    })
  ).default([]),
  dementiaTypesExperienced: Joi.array().items(Joi.string()).default([]),
  dementiaStagesHandled: Joi.array().items(Joi.string()).default([]),
  shortBio: Joi.string().trim().max(1500).allow("").optional(),
  specialSkills: Joi.array().items(Joi.string()).default([]),
  languagesSpoken: Joi.array().items(Joi.string()).default(["English"]),
  sessionDuration: Joi.number().valid(30, 45, 60, 90, 120).default(60),
  preferredCommunicationMode: Joi.array().items(Joi.string()).default(["Video"]),
  consultationFee: Joi.object({
    initial: Joi.number().min(0).optional(),
    followUp: Joi.number().min(0).optional(),
    homeVisit: Joi.number().min(0).optional()
  }).default({}),
  acceptsInsurance: Joi.boolean().default(false),
  insuranceProviders: Joi.array().items(Joi.string()).default([]),
  availability: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      time_slots: Joi.array().items(
        Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      ).min(1).required()
    })
  ).default([]),
  name: Joi.string().trim().optional(),
  specialization: Joi.string().trim().optional(),
  experience: Joi.number().optional()
});

exports.applyDOCH = asyncHandler(async (req, res) => {
  const { error, value } = applyDOCHSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid healthcare professional data",
      errors: error.details.map(e => e.message),
    });
  }

  const exists = await DOCH.exists({ email: value.email });
  if (exists) {
    return res.status(409).json({ 
      success: false,
      message: "Email already exists" 
    });
  }

  const professionalData = {
    ...value,
    status: "pending",
    priority: PRIORITY.DEFAULT,
    isActive: false,
    lastStatusUpdate: new Date()
  };

  const professional = await new DOCH(professionalData).save();
  
  logger.info(`New healthcare professional application: ${professional.email}`);
  
  res.status(201).json({
    success: true,
    message: "Application submitted successfully! We will review your application soon.",
    doch: professional.toObject(),
  });
});

exports.getActiveDOCHs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const [professionals, total] = await Promise.all([
    DOCH.find({ isActive: true })
      .select('-__v')
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DOCH.countDocuments({ isActive: true })
  ]);
    
  res.status(200).json({
    success: true,
    dochs: professionals || [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  });
});

exports.getAllDOCHs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;

  const [professionals, total] = await Promise.all([
    DOCH.find()
      .select('-__v')
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DOCH.countDocuments()
  ]);
    
  res.status(200).json({
    success: true,
    dochs: professionals || [],
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  });
});

exports.getDOCHById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid healthcare professional ID"
    });
  }

  const professional = await DOCH.findById(id).lean();
  
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "Healthcare professional not found"
    });
  }

  res.status(200).json({
    success: true,
    doch: professional
  });
});

exports.createDOCH = asyncHandler(async (req, res) => {
  const { error, value } = dochSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid healthcare professional data",
      errors: error.details.map(e => e.message),
    });
  }

  const exists = await DOCH.exists({ email: value.email });
  if (exists) {
    return res.status(409).json({ 
      success: false,
      message: "Email already exists" 
    });
  }

  const professional = await new DOCH(value).save();
  
  logger.info(`New healthcare professional created: ${professional.email}`);
  
  res.status(201).json({
    success: true,
    message: "Healthcare professional created successfully",
    doch: professional.toObject(),
  });
});

const statusSchema = Joi.object({
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

exports.updateDOCHStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid healthcare professional ID"
    });
  }

  const { error, value } = statusSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
      errors: error.details.map(e => e.message),
    });
  }

  const professional = await DOCH.findById(id);
  
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "Healthcare professional not found"
    });
  }

  if (professional.status === value.status) {
    return res.status(200).json({
      success: true,
      message: "Status unchanged",
      doch: professional.toObject()
    });
  }

  professional.status = value.status;
  professional.lastStatusUpdate = new Date();
  
  if (value.status === "accepted") {
    professional.isActive = true;
  } else if (value.status === "rejected") {
    professional.isActive = false;
  }

  await professional.save();

  logger.info(`Healthcare professional status updated: ${professional.email} -> ${value.status}`);
  
  res.status(200).json({
    success: true,
    message: "Status updated successfully",
    doch: professional.toObject()
  });
});

exports.updateDOCH = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid healthcare professional ID"
    });
  }

  const { error, value } = updateDOCHSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid healthcare professional data",
      errors: error.details.map(e => e.message),
    });
  }

  if (value.email) {
    const existing = await DOCH.findOne({ 
      email: value.email,
      _id: { $ne: id }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }
  }

  const professional = await DOCH.findByIdAndUpdate(
    id,
    value,
    { new: true, runValidators: true }
  ).lean();

  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "Healthcare professional not found"
    });
  }

  logger.info(`Healthcare professional updated: ${professional.email}`);
  
  res.status(200).json({
    success: true,
    message: "Healthcare professional updated successfully",
    doch: professional
  });
});

exports.deleteDOCH = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid healthcare professional ID"
    });
  }

  const professional = await DOCH.findByIdAndDelete(id).lean();

  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "Healthcare professional not found"
    });
  }

  logger.info(`DOCH deleted: ${professional.email}`);
  
  res.status(200).json({
    success: true,
    message: "DOCH deleted successfully"
  });
});

const createAppointmentSchema = Joi.object({
  dochId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
  appointmentDate: Joi.date().required(),
  timeSlot: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  patientNotes: Joi.string().trim().max(500).optional().allow("")
});

exports.createAppointment = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  
  const { error, value } = createAppointmentSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment data",
      errors: error.details.map(e => e.message),
    });
  }

  const professional = await DOCH.findById(value.dochId);
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "DOCH not found"
    });
  }

  if (!professional.isActive) {
    return res.status(400).json({
      success: false,
      message: "DOCH is not active"
    });
  }

  const appointmentDate = new Date(value.appointmentDate);
  appointmentDate.setHours(0, 0, 0, 0);
  const dateStr = appointmentDate.toISOString().split('T')[0];
  
  const availabilityEntry = professional.availability.find(avail => {
    const availDateStr = new Date(avail.date).toISOString().split('T')[0];
    return availDateStr === dateStr;
  });

  if (!availabilityEntry || !availabilityEntry.time_slots.includes(value.timeSlot)) {
    return res.status(400).json({
      success: false,
      message: "Selected time slot is not available"
    });
  }

  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);
  
  const existingAppointment = professional.appointments.find(apt => {
    const aptDate = new Date(apt.appointmentDate);
    return aptDate >= startOfDay && aptDate <= endOfDay && 
           apt.timeSlot === value.timeSlot && 
           ["pending", "confirmed"].includes(apt.status);
  });

  if (existingAppointment) {
    return res.status(409).json({
      success: false,
      message: "This time slot is already booked"
    });
  }

  professional.appointments.push({
    userId,
    appointmentDate: appointmentDate,
    timeSlot: value.timeSlot,
    patientNotes: value.patientNotes || "",
    status: "pending"
  });

  await professional.save();

  logger.info(`New appointment created with DOCH: ${professional.email} by user ${userId}`);
  
  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    appointment: professional.appointments[professional.appointments.length - 1]
  });
});

exports.getDOCHByEmail = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;
  
  const professional = await DOCH.findOne({ email: userEmail })
    .select('-__v -appointments')
    .lean();
  
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "No healthcare professional profile found with your email"
    });
  }
  
  res.status(200).json({
    success: true,
    doch: professional
  });
});

exports.getDOCHAppointments = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;
  
  const professional = await DOCH.findOne({ email: userEmail })
    .populate('appointments.userId', 'name email')
    .lean();
  
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "DOCH not found with your email"
    });
  }
  
  res.status(200).json({
    success: true,
    appointments: professional.appointments || [],
    professional: {
      name: professional.name,
      email: professional.email,
      specialization: professional.specialization
    }
  });
});

const Notification = require("../models/Notification");

const appointmentStatusSchema = Joi.object({
  status: Joi.string().valid("accepted", "rejected", "cancelled", "completed").required(),
  message: Joi.string().trim().max(500).optional().allow("")
});

exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;
  const { appointmentId } = req.params;
  
  const { error, value } = appointmentStatusSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
      errors: error.details.map(e => e.message)
    });
  }
  
  const professional = await DOCH.findOne({ email: userEmail });
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "DOCH profile not found"
    });
  }
  
  const appointment = professional.appointments.id(appointmentId);
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found"
    });
  }
  
  const oldStatus = appointment.status;
  appointment.status = value.status;
  await professional.save();
  
  // Create notification for the patient
  const notificationTitle = value.status === "accepted" 
    ? "Appointment Accepted! 🎉" 
    : value.status === "rejected" 
    ? "Appointment Declined" 
    : value.status === "completed"
    ? "Appointment Completed"
    : "Appointment Cancelled";
    
  let notificationMessage = value.status === "accepted"
    ? `Your appointment with ${professional.fullName || professional.name} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot} has been accepted.`
    : value.status === "rejected"
    ? `Unfortunately, your appointment request with ${professional.fullName || professional.name} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot} has been declined.`
    : value.status === "completed"
    ? `Your appointment with ${professional.fullName || professional.name} on ${new Date(appointment.appointmentDate).toLocaleDateString()} has been marked as completed.`
    : `Your appointment with ${professional.fullName || professional.name} on ${new Date(appointment.appointmentDate).toLocaleDateString()} at ${appointment.timeSlot} has been cancelled.`;
  
  // Add custom message if provided
  if (value.message && value.message.trim()) {
    notificationMessage += `\n\n📝 Message from ${professional.fullName || professional.name}:\n"${value.message.trim()}"`;
  }
  
  await Notification.create({
    userId: appointment.userId,
    type: value.status === "accepted" ? "appointment_accepted" : value.status === "rejected" ? "appointment_rejected" : "general",
    title: notificationTitle,
    message: notificationMessage,
    relatedId: appointmentId
  });
  
  logger.info(`Appointment ${appointmentId} status updated from ${oldStatus} to ${value.status} by DOCH: ${userEmail}`);
  
  res.status(200).json({
    success: true,
    message: `Appointment ${value.status} successfully`,
    appointment: {
      _id: appointment._id,
      status: appointment.status,
      appointmentDate: appointment.appointmentDate,
      timeSlot: appointment.timeSlot
    }
  });
});
