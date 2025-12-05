const mongoose = require("mongoose");
const Joi = require("joi");
const DOCT = require("../models/DOCT");
const logger = require("../utils/logger");
const asyncHandler = require("express-async-handler");
const { isValidObjectId } = require("../utils/validation");

const doctSchema = Joi.object({
  fullName: Joi.string().trim().min(3).max(100).required(),
  preferredName: Joi.string().trim().max(50).allow("").optional(),
  pronouns: Joi.string().valid("He/Him", "She/Her", "They/Them", "Other").default("They/Them"),
  profilePhoto: Joi.string().uri().allow("").optional(),
  dateOfBirth: Joi.date().optional().allow(null),
  location: Joi.string().trim().max(100).allow("").optional(),
  timeZone: Joi.string().default("Asia/Kolkata"),
  email: Joi.string().email().trim().lowercase().required(),
  primaryQualification: Joi.string().trim().max(200).required(),
  additionalCertifications: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().optional(),
      year: Joi.number().optional(),
      institution: Joi.string().trim().optional()
    })
  ).default([]),
  licensingBody: Joi.string().trim().max(200).allow("").optional(),
  therapistCouncilNumber: Joi.string().trim().max(100).allow("").optional(),
  yearsOfPractice: Joi.number().min(0).max(70).required(),
  licenseFiles: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().optional(),
      fileName: Joi.string().optional(),
      uploadedAt: Joi.date().optional()
    })
  ).default([]),
  specializations: Joi.array().items(Joi.string()).default([]),
  approachesUsed: Joi.array().items(Joi.string()).default([]),
  shortBio: Joi.string().trim().max(1500).allow("").optional(),
  preferredTherapyStyle: Joi.string().valid("Supportive", "Directive", "Analytical", "Holistic", "Trauma-Informed", "Eclectic").default("Supportive"),
  areasComfortableWith: Joi.array().items(Joi.string()).default([]),
  areasNotHandled: Joi.array().items(Joi.string()).default([]),
  languagesForSession: Joi.array().items(Joi.string()).default(["English"]),
  ageGroupsServed: Joi.array().items(Joi.string()).default([]),
  sessionDuration: Joi.number().valid(30, 45, 60, 90).default(60),
  sessionLimitPerDay: Joi.number().min(1).max(20).default(8),
  preferredCommunicationMode: Joi.array().items(Joi.string()).default(["Video"]),
  breakTimeBetweenSessions: Joi.number().min(0).max(60).default(15),
  emergencyResponsePolicy: Joi.string().valid("24h Reply", "Within Business Hours", "Scheduled Only", "Emergency Hotline Referral").default("Within Business Hours"),
  sessionFee: Joi.object({
    individual: Joi.number().min(0).optional(),
    couple: Joi.number().min(0).optional(),
    family: Joi.number().min(0).optional(),
    group: Joi.number().min(0).optional()
  }).default({}),
  refundReschedulePolicy: Joi.string().trim().max(1000).allow("").optional(),
  confidentialityAgreement: Joi.boolean().default(false),
  mandatoryReportingConsent: Joi.boolean().default(false),
  ethicalPracticeDeclaration: Joi.boolean().default(false),
  informedConsentPolicy: Joi.string().trim().max(2000).allow("").optional(),
  priority: Joi.number().min(1).max(10).default(5),
  availability: Joi.array().items(
    Joi.object({
      date: Joi.date().required(),
      time_slots: Joi.array().items(
        Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      ).min(1).required()
    })
  ).default([]),
  isActive: Joi.boolean().default(true),
  status: Joi.string().valid("pending", "accepted", "rejected").default("pending"),
  name: Joi.string().trim().optional(),
  specialization: Joi.string().trim().optional(),
  experience: Joi.number().optional()
});

const statusSchema = Joi.object({
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

const bulkStatusSchema = Joi.object({
  ids: Joi.array().items(Joi.string().regex(/^[0-9a-fA-F]{24}$/)).min(1).required(),
  status: Joi.string().valid("pending", "accepted", "rejected").required(),
});

exports.createDOCT = asyncHandler(async (req, res) => {
  const { error, value } = doctSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: req.t("doct.invalidDOCTData"),
      errors: error.details.map(e => e.message),
    });
  }

  const exists = await DOCT.exists({ email: value.email });
  if (exists) {
    return res.status(409).json({ 
      success: false,
      message: req.t("therapist.emailAlreadyExists") || "Email already exists"
    });
  }

  value.lastStatusUpdate = new Date();
  
  const doct = await new DOCT(value).save();
  
  logger.info(`New doct registered: ${doct.email}`);
  
  res.status(201).json({
    success: true,
    message: req.t("doct.submittedSuccessfully"),
    doct: doct.toObject(),
  });
});

exports.getAcceptedDOCTs = asyncHandler(async (req, res) => {
  const accepted = await DOCT.find({ status: "accepted", isActive: true })
    .select('-__v')
    .sort({ priority: 1, createdAt: -1 })
    .lean();
    
  res.status(200).json({
    success: true,
    docts: accepted || []
  });
});

exports.getAllDOCTs = asyncHandler(async (req, res) => {
  const docts = await DOCT.find()
    .select('-__v')
    .sort({ createdAt: -1 })
    .lean();
    
  res.status(200).json({
    success: true,
    docts: docts || []
  });
});

exports.updateDOCTStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id))
      return res.status(400).json({ message: req.t("doct.invalidDOCTId") });

    const { error } = statusSchema.validate({ status });
    if (error)
      return res.status(400).json({ message: req.t("doct.invalidStatus"), errors: error.details });

    const doct = await DOCT.findById(id);
    if (!doct) return res.status(404).json({ message: req.t("doct.doctNotFound") });

    if (doct.status === status)
      return res.status(200).json({ message: req.t("doct.statusUnchanged"), doct });

    doct.status = status;
    // Ensure isActive is true when accepting
    if (status === "accepted") {
      doct.isActive = true;
    }
    await doct.save();

    res.status(200).json({
      message: req.t("doct.statusUpdated"),
      doct: doct.toObject(),
      updatedAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: req.t("doct.internalError") });
  }
};

exports.updateBulkDOCTStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;

    const { error, value } = bulkStatusSchema.validate({ ids, status });
    if (error) {
      return res.status(400).json({ message: req.t("doct.invalidInput"), errors: error.details });
    }

    const validIds = value.ids.filter(isValidObjectId);
    if (validIds.length === 0) {
      return res.status(400).json({ message: req.t("doct.noValidIds") });
    }

    const docts = await DOCT.find({ _id: { $in: validIds } });
    const idsToUpdate = docts.filter((t) => t.status !== status).map((t) => t._id);

    if (idsToUpdate.length === 0) {
      return res.status(200).json({ message: req.t("doct.noStatusesNeeded"), modifiedCount: 0 });
    }

    const result = await DOCT.updateMany(
      { _id: { $in: idsToUpdate } },
      { status }
    );

    res.status(200).json({
      message: req.t("doct.statusesUpdated"),
      requested: validIds.length,
      modifiedCount: result.modifiedCount,
      skipped: validIds.length - result.modifiedCount,
      updatedAt: new Date(),
    });
  } catch (err) {
    res.status(500).json({ message: req.t("doct.internalError") });
  }
};

exports.deleteDOCT = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) return res.status(400).json({ message: req.t("doct.invalidDOCTId") });

    const doct = await DOCT.findById(id).lean();
    if (!doct) return res.status(404).json({ message: req.t("doct.doctNotFound") });
    if (doct.status === "accepted") return res.status(403).json({ message: req.t("doct.cannotDeleteAccepted") });

    await DOCT.findByIdAndDelete(id);
    res.status(200).json({ message: req.t("doct.deletedSuccessfully") });
  } catch (err) {
    res.status(500).json({ message: req.t("doct.internalError") });
  }
};

exports.getDOCTByEmail = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;
  
  const doct = await DOCT.findOne({ email: userEmail }).lean();
  
  if (!doct) {
    return res.status(404).json({
      success: false,
      message: "DOCT not found with your email"
    });
  }
  
  res.status(200).json({
    success: true,
    doct: doct
  });
});

const createAppointmentSchema = Joi.object({
  doctId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
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

  const professional = await DOCT.findById(value.doctId);
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "DOCT not found"
    });
  }

  if (!professional.isActive) {
    return res.status(400).json({
      success: false,
      message: "DOCT is not active"
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

  logger.info(`New appointment created with DOCT: ${professional.email} by user ${userId}`);
  
  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    appointment: professional.appointments[professional.appointments.length - 1]
  });
});

exports.getDOCTAppointments = asyncHandler(async (req, res) => {
  const userEmail = req.user.email;
  
  const professional = await DOCT.findOne({ email: userEmail })
    .populate('appointments.userId', 'name email')
    .lean();
  
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "DOCT not found with your email"
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
  
  const professional = await DOCT.findOne({ email: userEmail });
  if (!professional) {
    return res.status(404).json({
      success: false,
      message: "DOCT profile not found"
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
  
  logger.info(`Appointment ${appointmentId} status updated from ${oldStatus} to ${value.status} by DOCT: ${userEmail}`);
  
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
