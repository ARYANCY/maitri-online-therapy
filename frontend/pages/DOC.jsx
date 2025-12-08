import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";
import "./DOC.css";

const SPECIALIZATIONS = [
  "Anxiety", "Depression", "Trauma/PTSD", "LGBTQ+", "ADHD", 
  "OCD", "Grief/Loss", "Relationship Issues", "Family Therapy",
  "Addiction", "Eating Disorders", "Stress Management", 
  "Self-Esteem", "Anger Management", "Career Counseling",
  "Child Psychology", "Adolescent Therapy", "Geriatric Psychology",
  "Dementia Care", "Bipolar Disorder", "Personality Disorders",
  "Sleep Disorders", "Phobias", "Other"
];

const APPROACHES = [
  "CBT (Cognitive Behavioral Therapy)", 
  "DBT (Dialectical Behavior Therapy)",
  "REBT (Rational Emotive Behavior Therapy)",
  "Psychoanalysis", 
  "Mindfulness-Based Therapy",
  "Person-Centered Therapy",
  "Solution-Focused Therapy",
  "EMDR",
  "Art Therapy",
  "Play Therapy",
  "Narrative Therapy",
  "Gestalt Therapy",
  "Acceptance and Commitment Therapy (ACT)",
  "Trauma-Informed Care",
  "Holistic Therapy",
  "Other"
];

const THERAPY_STYLES = ["Supportive", "Directive", "Analytical", "Holistic", "Trauma-Informed", "Eclectic"];
const AGE_GROUPS = ["Children (5-12)", "Teens (13-17)", "Young Adults (18-25)", "Adults (26-59)", "Seniors (60+)"];
const COMMUNICATION_MODES = ["Video", "Audio", "Chat", "In-Person"];
const EMERGENCY_POLICIES = ["24h Reply", "Within Business Hours", "Scheduled Only", "Emergency Hotline Referral"];

const HC_ROLE_CATEGORIES = [
  "Geriatric Doctor",
  "Neurologist",
  "Dementia Care Nurse",
  "Occupational Therapist",
  "Speech & Cognitive Therapist",
  "Dementia Caregiver / Support Worker",
  "Memory Care Specialist",
  "Neuropsychologist",
  "Palliative/End-of-life Specialist",
  "Psychiatrist",
  "Social Worker",
  "Other"
];

const DEMENTIA_TYPES = [
  "Alzheimer's Disease",
  "Vascular Dementia",
  "Lewy Body Dementia",
  "FTD (Frontotemporal Dementia)",
  "Mixed Dementia",
  "Mild Cognitive Impairment (MCI)",
  "Parkinson's with Dementia",
  "Other"
];

const DEMENTIA_STAGES = [
  "Early Stage",
  "Middle Stage",
  "Late/Severe Stage",
  "End-of-life/Terminal Care"
];

const HC_COMMUNICATION_MODES = ["Video", "Audio", "Chat", "In-Person", "Home Visit"];

const LS_KEYS = {
  THERAPIST_FORM: "maitri_therapist_form",
  THERAPIST_STEP: "maitri_therapist_step",
  HC_FORM: "maitri_hc_form",
  HC_STEP: "maitri_hc_step",
  ACTIVE_TAB: "maitri_doc_tab"
};

const defaultTherapistForm = {
  fullName: "",
  preferredName: "",
  pronouns: "They/Them",
  profilePhoto: "",
  dateOfBirth: "",
  location: "",
  timeZone: "", 
  email: "",
  primaryQualification: "",
  additionalCertifications: [],
  licensingBody: "",
  therapistCouncilNumber: "",
  yearsOfPractice: "",
  licenseFiles: [],
  specializations: [],
  approachesUsed: [],
  shortBio: "",
  preferredTherapyStyle: "Supportive",
  areasComfortableWith: [],
  areasNotHandled: [],
  languagesForSession: ["English"],
  ageGroupsServed: [],
  sessionDuration: 60,
  sessionLimitPerDay: 8,
  preferredCommunicationMode: ["Video"],
  breakTimeBetweenSessions: 15,
  emergencyResponsePolicy: "Within Business Hours",
  sessionFee: { individual: "", couple: "", family: "", group: "" },
  refundReschedulePolicy: "",
  confidentialityAgreement: false,
  mandatoryReportingConsent: false,
  ethicalPracticeDeclaration: false,
  informedConsentPolicy: "",
  availability: []
};

const defaultHealthcareForm = {
  fullName: "",
  preferredName: "",
  gender: "Prefer not to say",
  pronouns: "They/Them",
  profilePhoto: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  country: "",
  emergencyContact: { name: "", phone: "", relationship: "" },
  roleCategories: [],
  highestQualification: "",
  dementiaCertifications: [],
  licenseNumber: "",
  licenseFiles: [],
  yearsInDementiaCare: "",
  previousInstitutions: [],
  dementiaTypesExperienced: [],
  dementiaStagesHandled: [],
  shortBio: "",
  specialSkills: [],
  languagesSpoken: ["English"],
  sessionDuration: 60,
  preferredCommunicationMode: ["Video"],
  consultationFee: { initial: "", followUp: "", homeVisit: "" },
  acceptsInsurance: false,
  insuranceProviders: [],
  availability: []
};

const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("Failed to save to localStorage:", e);
  }
};

const clearFormStorage = (formType) => {
  try {
    if (formType === "therapist") {
      localStorage.removeItem(LS_KEYS.THERAPIST_FORM);
      localStorage.removeItem(LS_KEYS.THERAPIST_STEP);
    } else {
      localStorage.removeItem(LS_KEYS.HC_FORM);
      localStorage.removeItem(LS_KEYS.HC_STEP);
    }
  } catch (e) {
    console.warn("Failed to clear localStorage:", e);
  }
};

export default function DOC() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState(() => loadFromStorage(LS_KEYS.ACTIVE_TAB, "therapist"));
  const [currentStep, setCurrentStep] = useState(() => loadFromStorage(LS_KEYS.THERAPIST_STEP, 1));
  const totalSteps = 6;

  const [therapistFormData, setTherapistFormData] = useState(() => loadFromStorage(LS_KEYS.THERAPIST_FORM, defaultTherapistForm));

  const [healthcareFormData, setHealthcareFormData] = useState(() => loadFromStorage(LS_KEYS.HC_FORM, defaultHealthcareForm));
  const [hcCurrentStep, setHcCurrentStep] = useState(() => loadFromStorage(LS_KEYS.HC_STEP, 1));
  const hcTotalSteps = 4;

  const [healthcareAvailabilityDate, setHealthcareAvailabilityDate] = useState("");
  const [healthcareAvailabilityTimeSlots, setHealthcareAvailabilityTimeSlots] = useState([""]);
  const [therapistAvailabilityDate, setTherapistAvailabilityDate] = useState("");
  const [therapistAvailabilityTimeSlots, setTherapistAvailabilityTimeSlots] = useState([""]);

  const [newCertification, setNewCertification] = useState({ name: "", year: "", institution: "" });
  const [newAreaComfortable, setNewAreaComfortable] = useState("");
  const [newAreaNotHandled, setNewAreaNotHandled] = useState("");
  const [newLanguage, setNewLanguage] = useState("");
  const [newHcCertification, setNewHcCertification] = useState({ name: "", issuingBody: "", year: "" });
  const [newInstitution, setNewInstitution] = useState({ name: "", role: "", duration: "", location: "" });
  const [newSkill, setNewSkill] = useState("");
  const [newHcLanguage, setNewHcLanguage] = useState("");
  const [newInsuranceProvider, setNewInsuranceProvider] = useState("");

  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCerts, setUploadingCerts] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.auth.checkSession();
      if (!response?.user) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("sessionTime");
        navigate("/");
        return;
      }

      setUser(response.user);

      if (response.user) {
        localStorage.setItem("userId", response.user._id || "");
        localStorage.setItem("userEmail", response.user.email || "");
        localStorage.setItem("userName", response.user.name || "");
        localStorage.setItem("isAdmin", response.user.isAdmin ? "true" : "false");
        localStorage.setItem("sessionTime", Date.now().toString());
      }

      const prefLang = response.user.preferredLang || localStorage.getItem("preferredLang") || "en";
      if (i18n.language !== prefLang) i18n.changeLanguage(prefLang);
      localStorage.setItem("preferredLang", prefLang);

      setTherapistFormData(prev => ({
        ...prev,
        fullName: response.user.name || "",
        email: response.user.email || "",
      }));
      setHealthcareFormData(prev => ({
        ...prev,
        fullName: response.user.name || "",
        email: response.user.email || "",
      }));
    } catch (err) {
      console.error("Session check failed:", err);
      navigate("/");
    } finally {
      setLoading(false);
    }
  }, [navigate, i18n]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  useEffect(() => {
    saveToStorage(LS_KEYS.THERAPIST_FORM, therapistFormData);
  }, [therapistFormData]);

  useEffect(() => {
    saveToStorage(LS_KEYS.THERAPIST_STEP, currentStep);
  }, [currentStep]);

  useEffect(() => {
    saveToStorage(LS_KEYS.HC_FORM, healthcareFormData);
  }, [healthcareFormData]);

  useEffect(() => {
    saveToStorage(LS_KEYS.HC_STEP, hcCurrentStep);
  }, [hcCurrentStep]);

  useEffect(() => {
    saveToStorage(LS_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  const handleTherapistChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setTherapistFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setTherapistFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleMultiSelect = (field, value) => {
    setTherapistFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      const response = await API.upload.profilePhoto(formData);
      if (response.success) {
        setTherapistFormData(prev => ({ ...prev, profilePhoto: response.url }));
      }
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCertificatesUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingCerts(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append("certificates", file));
      const response = await API.upload.certificates(formData);
      if (response.success) {
        setTherapistFormData(prev => ({
          ...prev,
          licenseFiles: [...prev.licenseFiles, ...response.files]
        }));
      }
    } catch (err) {
      setError("Failed to upload certificates. Please try again.");
    } finally {
      setUploadingCerts(false);
    }
  };

  const addCertification = () => {
    if (newCertification.name) {
      setTherapistFormData(prev => ({
        ...prev,
        additionalCertifications: [...prev.additionalCertifications, { ...newCertification }]
      }));
      setNewCertification({ name: "", year: "", institution: "" });
    }
  };

  const removeCertification = (index) => {
    setTherapistFormData(prev => ({
      ...prev,
      additionalCertifications: prev.additionalCertifications.filter((_, i) => i !== index)
    }));
  };

  const addAreaComfortable = () => {
    if (newAreaComfortable.trim()) {
      setTherapistFormData(prev => ({
        ...prev,
        areasComfortableWith: [...prev.areasComfortableWith, newAreaComfortable.trim()]
      }));
      setNewAreaComfortable("");
    }
  };

  const addAreaNotHandled = () => {
    if (newAreaNotHandled.trim()) {
      setTherapistFormData(prev => ({
        ...prev,
        areasNotHandled: [...prev.areasNotHandled, newAreaNotHandled.trim()]
      }));
      setNewAreaNotHandled("");
    }
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !therapistFormData.languagesForSession.includes(newLanguage.trim())) {
      setTherapistFormData(prev => ({
        ...prev,
        languagesForSession: [...prev.languagesForSession, newLanguage.trim()]
      }));
      setNewLanguage("");
    }
  };

  const handleAddTherapistTimeSlot = () => {
    setTherapistAvailabilityTimeSlots([...therapistAvailabilityTimeSlots, ""]);
  };

  const handleAddTherapistAvailability = () => {
    if (!therapistAvailabilityDate) {
      setError(t("doc.form.noDate", "Please select a date"));
      return;
    }
    const validTimeSlots = therapistAvailabilityTimeSlots.filter(ts => ts.trim() !== "");
    if (validTimeSlots.length === 0) {
      setError(t("doc.form.noTimeSlots", "Please add at least one time slot"));
      return;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const invalidSlots = validTimeSlots.filter(ts => !timeRegex.test(ts));
    if (invalidSlots.length > 0) {
      setError(t("doc.form.invalidTime", "Invalid time format. Use HH:MM (e.g., 09:00, 14:30)"));
      return;
    }

    setTherapistFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { date: new Date(therapistAvailabilityDate), time_slots: validTimeSlots }]
    }));
    setTherapistAvailabilityDate("");
    setTherapistAvailabilityTimeSlots([""]);
    setError("");
  };

  const handleRemoveTherapistAvailability = (index) => {
    setTherapistFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const handleHealthcareChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setHealthcareFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value }
      }));
    } else {
      setHealthcareFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    }
  };

  const handleHcMultiSelect = (field, value) => {
    setHealthcareFormData(prev => {
      const current = prev[field] || [];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...current, value] };
    });
  };

  const handleHcPhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("profilePhoto", file);
      const response = await API.upload.profilePhoto(formData);
      if (response.success) {
        setHealthcareFormData(prev => ({ ...prev, profilePhoto: response.url }));
      }
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleHcCertificatesUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadingCerts(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => formData.append("certificates", file));
      const response = await API.upload.certificates(formData);
      if (response.success) {
        setHealthcareFormData(prev => ({
          ...prev,
          licenseFiles: [...prev.licenseFiles, ...response.files]
        }));
      }
    } catch (err) {
      setError("Failed to upload certificates. Please try again.");
    } finally {
      setUploadingCerts(false);
    }
  };

  const addHcCertification = () => {
    if (newHcCertification.name) {
      setHealthcareFormData(prev => ({
        ...prev,
        dementiaCertifications: [...prev.dementiaCertifications, { ...newHcCertification }]
      }));
      setNewHcCertification({ name: "", issuingBody: "", year: "" });
    }
  };

  const addInstitution = () => {
    if (newInstitution.name) {
      setHealthcareFormData(prev => ({
        ...prev,
        previousInstitutions: [...prev.previousInstitutions, { ...newInstitution }]
      }));
      setNewInstitution({ name: "", role: "", duration: "", location: "" });
    }
  };

  const addHcSkill = () => {
    if (newSkill.trim() && !healthcareFormData.specialSkills.includes(newSkill.trim())) {
      setHealthcareFormData(prev => ({
        ...prev,
        specialSkills: [...prev.specialSkills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const addHcLanguage = () => {
    if (newHcLanguage.trim() && !healthcareFormData.languagesSpoken.includes(newHcLanguage.trim())) {
      setHealthcareFormData(prev => ({
        ...prev,
        languagesSpoken: [...prev.languagesSpoken, newHcLanguage.trim()]
      }));
      setNewHcLanguage("");
    }
  };

  const addInsuranceProvider = () => {
    if (newInsuranceProvider.trim() && !healthcareFormData.insuranceProviders.includes(newInsuranceProvider.trim())) {
      setHealthcareFormData(prev => ({
        ...prev,
        insuranceProviders: [...prev.insuranceProviders, newInsuranceProvider.trim()]
      }));
      setNewInsuranceProvider("");
    }
  };

  const validateHcStep = (step) => {
    switch (step) {
      case 1:
        if (!healthcareFormData.fullName || !healthcareFormData.email) {
          setError("Please fill in Full Name and Email");
          return false;
        }
        break;
      case 2:
        if (healthcareFormData.roleCategories.length === 0) {
          setError("Please select at least one role category");
          return false;
        }
        break;
      case 3:
        if (!healthcareFormData.highestQualification || !healthcareFormData.yearsInDementiaCare) {
          setError("Please fill in Highest Qualification and Years of Experience");
          return false;
        }
        break;
      default:
        break;
    }
    setError("");
    return true;
  };

  const hcNextStep = () => {
    if (validateHcStep(hcCurrentStep)) {
      setHcCurrentStep(prev => Math.min(prev + 1, hcTotalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hcPrevStep = () => {
    setHcCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddHealthcareTimeSlot = () => {
    setHealthcareAvailabilityTimeSlots([...healthcareAvailabilityTimeSlots, ""]);
  };

  const handleRemoveHealthcareTimeSlot = (index) => {
    setHealthcareAvailabilityTimeSlots(healthcareAvailabilityTimeSlots.filter((_, i) => i !== index));
  };

  const handleAddHealthcareAvailability = () => {
    if (!healthcareAvailabilityDate) {
      setError(t("doc.form.noDate", "Please select a date"));
      return;
    }
    const validTimeSlots = healthcareAvailabilityTimeSlots.filter(ts => ts.trim() !== "");
    if (validTimeSlots.length === 0) {
      setError(t("doc.form.noTimeSlots", "Please add at least one time slot"));
      return;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const invalidSlots = validTimeSlots.filter(ts => !timeRegex.test(ts));
    if (invalidSlots.length > 0) {
      setError(t("doc.form.invalidTime", "Invalid time format. Use HH:MM (e.g., 09:00, 14:30)"));
      return;
    }
    setHealthcareFormData(prev => ({
      ...prev,
      availability: [...prev.availability, { date: new Date(healthcareAvailabilityDate), time_slots: validTimeSlots }]
    }));
    setHealthcareAvailabilityDate("");
    setHealthcareAvailabilityTimeSlots([""]);
    setError("");
  };

  const handleRemoveHealthcareAvailability = (index) => {
    setHealthcareFormData(prev => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!therapistFormData.fullName || !therapistFormData.email) {
          setError("Please fill in Full Name and Email");
          return false;
        }
        break;
      case 2:
        if (!therapistFormData.primaryQualification || !therapistFormData.yearsOfPractice) {
          setError("Please fill in Primary Qualification and Years of Practice");
          return false;
        }
        break;
      case 3:
        if (therapistFormData.specializations.length === 0) {
          setError("Please select at least one specialization");
          return false;
        }
        break;
      default:
        break;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTherapistSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!therapistFormData.confidentialityAgreement || !therapistFormData.mandatoryReportingConsent || !therapistFormData.ethicalPracticeDeclaration) {
      setError("Please agree to all safety policies before submitting");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = {
        ...therapistFormData,
        yearsOfPractice: Number(therapistFormData.yearsOfPractice),
        sessionFee: {
          individual: Number(therapistFormData.sessionFee.individual) || 0,
          couple: Number(therapistFormData.sessionFee.couple) || 0,
          family: Number(therapistFormData.sessionFee.family) || 0,
          group: Number(therapistFormData.sessionFee.group) || 0
        }
      };
      const response = await API.doct.apply(submitData);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to submit application");
      }
      setMessage(t("doc.form.successTherapist", "Therapist application submitted successfully! We will review your application soon."));
      clearFormStorage("therapist");
      setCurrentStep(1);
      setTherapistFormData({
        fullName: user?.name || "",
        preferredName: "",
        pronouns: "They/Them",
        profilePhoto: "",
        dateOfBirth: "",
        location: "",
        timeZone: "",
        email: user?.email || "",
        primaryQualification: "",
        additionalCertifications: [],
        licensingBody: "",
        therapistCouncilNumber: "",
        yearsOfPractice: "",
        licenseFiles: [],
        specializations: [],
        approachesUsed: [],
        shortBio: "",
        preferredTherapyStyle: "Supportive",
        areasComfortableWith: [],
        areasNotHandled: [],
        languagesForSession: ["English"],
        ageGroupsServed: [],
        sessionDuration: 60,
        sessionLimitPerDay: 8,
        preferredCommunicationMode: ["Video"],
        breakTimeBetweenSessions: 15,
        emergencyResponsePolicy: "Within Business Hours",
        sessionFee: { individual: "", couple: "", family: "", group: "" },
        refundReschedulePolicy: "",
        confidentialityAgreement: false,
        mandatoryReportingConsent: false,
        ethicalPracticeDeclaration: false,
        informedConsentPolicy: "",
        availability: []
      });
    } catch (err) {
      let errorMsg = err.data?.message || err.message || "";
      
      // Handle validation errors (400 status)
      if (err.status === 400 && err.data?.errors) {
        const validationErrors = Array.isArray(err.data.errors) 
          ? err.data.errors.join(", ") 
          : err.data.errors;
        errorMsg = `Validation error: ${validationErrors}`;
      }
      
      if (errorMsg.toLowerCase().includes("email already exists") || err.status === 409) {
        setError(t("doc.form.emailExists", "This email is already registered. Please use a different email."));
      } else {
        setError(errorMsg || t("doc.form.error", "Error submitting form. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleHealthcareSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setSubmitting(true);

    if (!healthcareFormData.fullName || !healthcareFormData.email || !healthcareFormData.highestQualification || !healthcareFormData.yearsInDementiaCare) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    try {
      // Clean and format the data according to backend schema
      const submitData = {
        fullName: healthcareFormData.fullName?.trim() || "",
        preferredName: healthcareFormData.preferredName?.trim() || "",
        gender: healthcareFormData.gender || "Prefer not to say",
        pronouns: healthcareFormData.pronouns || "They/Them",
        profilePhoto: healthcareFormData.profilePhoto?.trim() || "",
        email: healthcareFormData.email?.trim().toLowerCase() || "",
        phone: healthcareFormData.phone?.trim() || "",
        city: healthcareFormData.city?.trim() || "",
        state: healthcareFormData.state?.trim() || "",
        country: healthcareFormData.country?.trim() || "",
        emergencyContact: healthcareFormData.emergencyContact || {},
        roleCategories: Array.isArray(healthcareFormData.roleCategories) ? healthcareFormData.roleCategories : [],
        highestQualification: healthcareFormData.highestQualification?.trim() || "",
        dementiaCertifications: Array.isArray(healthcareFormData.dementiaCertifications) ? healthcareFormData.dementiaCertifications : [],
        licenseNumber: healthcareFormData.licenseNumber?.trim() || "",
        licenseFiles: Array.isArray(healthcareFormData.licenseFiles) ? healthcareFormData.licenseFiles : [],
        yearsInDementiaCare: Number(healthcareFormData.yearsInDementiaCare) || 0,
        previousInstitutions: Array.isArray(healthcareFormData.previousInstitutions) ? healthcareFormData.previousInstitutions : [],
        dementiaTypesExperienced: Array.isArray(healthcareFormData.dementiaTypesExperienced) ? healthcareFormData.dementiaTypesExperienced : [],
        dementiaStagesHandled: Array.isArray(healthcareFormData.dementiaStagesHandled) ? healthcareFormData.dementiaStagesHandled : [],
        shortBio: healthcareFormData.shortBio?.trim() || "",
        specialSkills: Array.isArray(healthcareFormData.specialSkills) ? healthcareFormData.specialSkills : [],
        languagesSpoken: Array.isArray(healthcareFormData.languagesSpoken) && healthcareFormData.languagesSpoken.length > 0 
          ? healthcareFormData.languagesSpoken 
          : ["English"],
        sessionDuration: Number(healthcareFormData.sessionDuration) || 60,
        preferredCommunicationMode: Array.isArray(healthcareFormData.preferredCommunicationMode) && healthcareFormData.preferredCommunicationMode.length > 0
          ? healthcareFormData.preferredCommunicationMode
          : ["Video"],
        consultationFee: {
          initial: healthcareFormData.consultationFee?.initial ? Number(healthcareFormData.consultationFee.initial) : undefined,
          followUp: healthcareFormData.consultationFee?.followUp ? Number(healthcareFormData.consultationFee.followUp) : undefined,
          homeVisit: healthcareFormData.consultationFee?.homeVisit ? Number(healthcareFormData.consultationFee.homeVisit) : undefined
        },
        acceptsInsurance: Boolean(healthcareFormData.acceptsInsurance),
        insuranceProviders: Array.isArray(healthcareFormData.insuranceProviders) ? healthcareFormData.insuranceProviders : [],
        availability: Array.isArray(healthcareFormData.availability) 
          ? healthcareFormData.availability.map(avail => {
              // Ensure date is properly formatted - Joi accepts ISO strings or Date objects
              let dateValue = avail.date;
              if (dateValue instanceof Date) {
                dateValue = dateValue.toISOString();
              } else if (typeof dateValue === 'string') {
                // If it's already a string, validate it's a valid date
                const dateObj = new Date(dateValue);
                if (isNaN(dateObj.getTime())) {
                  console.warn('[DOCH Apply] Invalid date in availability:', dateValue);
                  dateValue = new Date().toISOString(); // Fallback to today
                } else {
                  dateValue = dateObj.toISOString();
                }
              }
              return {
                date: dateValue,
                time_slots: Array.isArray(avail.time_slots) ? avail.time_slots.filter(ts => ts && ts.trim()) : []
              };
            })
          : []
      };

      // Remove empty profilePhoto if it's not a valid URL
      if (submitData.profilePhoto && !submitData.profilePhoto.startsWith('http')) {
        submitData.profilePhoto = "";
      }

      // Log the data being sent for debugging
      console.log('[DOCH Apply] Submitting data:', {
        fullName: submitData.fullName,
        email: submitData.email,
        highestQualification: submitData.highestQualification,
        yearsInDementiaCare: submitData.yearsInDementiaCare,
        availabilityCount: submitData.availability.length,
        hasProfilePhoto: !!submitData.profilePhoto
      });

      const response = await API.doch.apply(submitData);
      if (!response?.success) {
        throw new Error(response?.message || "Failed to submit application");
      }
      setMessage(t("doc.form.successHealthcare", "Healthcare Professional application submitted successfully! We will review your application soon."));
      clearFormStorage("healthcare");
      setHcCurrentStep(1);
      setHealthcareFormData({
        fullName: user?.name || "",
        preferredName: "",
        gender: "Prefer not to say",
        pronouns: "They/Them",
        profilePhoto: "",
        email: user?.email || "",
        phone: "",
        city: "",
        state: "",
        country: "",
        emergencyContact: { name: "", phone: "", relationship: "" },
        roleCategories: [],
        highestQualification: "",
        dementiaCertifications: [],
        licenseNumber: "",
        licenseFiles: [],
        yearsInDementiaCare: "",
        previousInstitutions: [],
        dementiaTypesExperienced: [],
        dementiaStagesHandled: [],
        shortBio: "",
        specialSkills: [],
        languagesSpoken: ["English"],
        sessionDuration: 60,
        preferredCommunicationMode: ["Video"],
        consultationFee: { initial: "", followUp: "", homeVisit: "" },
        acceptsInsurance: false,
        insuranceProviders: [],
        availability: []
      });
      setHealthcareAvailabilityDate("");
      setHealthcareAvailabilityTimeSlots([""]);
    } catch (err) {
      const errorMsg = err.data?.message || err.message || "";
      if (errorMsg.toLowerCase().includes("email already exists") || err.status === 409) {
        setError(t("doc.form.emailExists", "This email is already registered. Please use a different email."));
      } else {
        setError(errorMsg || t("doc.form.error", "Error submitting form. Please try again."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="doc-progress-container mb-4">
      <div className="doc-progress-bar">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div key={step} className={`doc-progress-step ${currentStep >= step ? 'active' : ''} ${currentStep === step ? 'current' : ''}`}>
            <div className="step-number">{step}</div>
            <div className="step-label">
              {step === 1 && "Identity"}
              {step === 2 && "Qualifications"}
              {step === 3 && "Expertise"}
              {step === 4 && "Schedule"}
              {step === 5 && "Pricing"}
              {step === 6 && "Policies"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="doc-step-content animate-fade-in">
      <div className="doc-section-header">
        <h3><i className="bi bi-person-badge me-2"></i>Basic Identity</h3>
        <p>Let's get to know you better. This information helps patients connect with you.</p>
      </div>

      <div className="row g-4">
        <div className="col-md-4 text-center">
          <div className="profile-photo-upload">
            {therapistFormData.profilePhoto ? (
              <div className="position-relative d-inline-block">
                <img 
                  src={therapistFormData.profilePhoto} 
                  alt="Profile" 
                  className="profile-preview" 
                  crossOrigin="anonymous"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    console.warn('Image failed to load:', therapistFormData.profilePhoto);
                  }}
                />
                <button 
                  type="button" 
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle" 
                  style={{ width: '28px', height: '28px', padding: 0 }}
                  onClick={() => setTherapistFormData(prev => ({ ...prev, profilePhoto: "" }))}
                  title="Remove photo"
                >
                  <i className="bi bi-x"></i>
                </button>
                <div className="mt-2">
                  <small className="text-success"><i className="bi bi-check-circle me-1"></i>Photo uploaded</small>
                </div>
              </div>
            ) : (
              <div className="profile-placeholder">
                <i className="bi bi-camera-fill"></i>
              </div>
            )}
            <label className="btn btn-outline-primary btn-sm mt-2">
              {uploadingPhoto ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-upload me-2"></i>}
              {therapistFormData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
              <input type="file" accept="image/*" onChange={handlePhotoUpload} hidden />
            </label>
            <div className="mt-1">
              <small className="text-muted">JPG, PNG, WebP • Max 5MB</small>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="doc-form-label">Full Name <span className="text-danger">*</span></label>
              <input type="text" className="form-control doc-form-input" name="fullName" value={therapistFormData.fullName} onChange={handleTherapistChange} required placeholder="Dr. Jane Smith" />
            </div>
            <div className="col-md-6">
              <label className="doc-form-label">Preferred Name</label>
              <input type="text" className="form-control doc-form-input" name="preferredName" value={therapistFormData.preferredName} onChange={handleTherapistChange} placeholder="Jane" />
            </div>
            <div className="col-md-6">
              <label className="doc-form-label">Pronouns</label>
              <select className="form-select doc-form-input" name="pronouns" value={therapistFormData.pronouns} onChange={handleTherapistChange}>
                <option value="He/Him">He/Him</option>
                <option value="She/Her">She/Her</option>
                <option value="They/Them">They/Them</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="doc-form-label">Email <span className="text-danger">*</span> <small className="text-muted">(from your account)</small></label>
              <input type="email" className="form-control doc-form-input" name="email" value={therapistFormData.email} disabled readOnly style={{ backgroundColor: '#f0f7f4', cursor: 'not-allowed' }} />
            </div>
            <div className="col-md-6">
              <label className="doc-form-label">Date of Birth</label>
              <input type="date" className="form-control doc-form-input" name="dateOfBirth" value={therapistFormData.dateOfBirth} onChange={handleTherapistChange} />
            </div>
            <div className="col-md-6">
              <label className="doc-form-label">Location</label>
              <input type="text" className="form-control doc-form-input" name="location" value={therapistFormData.location} onChange={handleTherapistChange} placeholder="Mumbai, India" />
            </div>
            <div className="col-md-6">
              <label className="doc-form-label">Time Zone</label>
              <select className="form-select doc-form-input" name="timeZone" value={therapistFormData.timeZone} onChange={handleTherapistChange}>
                <option value="">-- Select Time Zone --</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">UK (GMT/BST)</option>
                <option value="Europe/Paris">Central Europe (CET)</option>
                <option value="Asia/Dubai">Gulf (GST)</option>
                <option value="Asia/Singapore">Singapore (SGT)</option>
                <option value="Australia/Sydney">Australia (AEST)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="doc-step-content animate-fade-in">
      <div className="doc-section-header">
        <h3><i className="bi bi-mortarboard me-2"></i>Qualifications & Licensing</h3>
        <p>Your credentials help build trust with patients. Please provide accurate information.</p>
      </div>

      <div className="row g-4">
        <div className="col-md-6">
          <label className="doc-form-label">Primary Qualification <span className="text-danger">*</span></label>
          <input type="text" className="form-control doc-form-input" name="primaryQualification" value={therapistFormData.primaryQualification} onChange={handleTherapistChange} placeholder="MA Clinical Psychology, PhD Psychology" required />
        </div>
        <div className="col-md-6">
          <label className="doc-form-label">Years of Practice <span className="text-danger">*</span></label>
          <input type="number" className="form-control doc-form-input" name="yearsOfPractice" value={therapistFormData.yearsOfPractice} onChange={handleTherapistChange} min="0" max="70" required />
        </div>
        <div className="col-md-6">
          <label className="doc-form-label">Licensing Body</label>
          <input type="text" className="form-control doc-form-input" name="licensingBody" value={therapistFormData.licensingBody} onChange={handleTherapistChange} placeholder="Rehabilitation Council of India (RCI)" />
        </div>
        <div className="col-md-6">
          <label className="doc-form-label">Therapist Council Number</label>
          <input type="text" className="form-control doc-form-input" name="therapistCouncilNumber" value={therapistFormData.therapistCouncilNumber} onChange={handleTherapistChange} placeholder="RCI/XXXXX" />
        </div>

        <div className="col-12">
          <label className="doc-form-label">Additional Certifications</label>
          <div className="card doc-inner-card">
            <div className="card-body">
              <div className="row g-2 mb-3">
                <div className="col-md-4">
                  <input type="text" className="form-control doc-form-input" placeholder="Certification Name" value={newCertification.name} onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <input type="number" className="form-control doc-form-input" placeholder="Year" value={newCertification.year} onChange={(e) => setNewCertification({ ...newCertification, year: e.target.value })} />
                </div>
                <div className="col-md-3">
                  <input type="text" className="form-control doc-form-input" placeholder="Institution" value={newCertification.institution} onChange={(e) => setNewCertification({ ...newCertification, institution: e.target.value })} />
                </div>
                <div className="col-md-2">
                  <button type="button" className="btn btn-primary w-100" onClick={addCertification}>
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
              </div>
              {therapistFormData.additionalCertifications.length > 0 && (
                <div className="cert-list">
                  {therapistFormData.additionalCertifications.map((cert, idx) => (
                    <div key={idx} className="cert-item d-flex justify-content-between align-items-center">
                      <span><strong>{cert.name}</strong> {cert.year && `(${cert.year})`} {cert.institution && `- ${cert.institution}`}</span>
                      <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeCertification(idx)}>
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <label className="doc-form-label">Upload License/Certificates (Max 5 files)</label>
          <div className="file-upload-area">
            <label className="file-upload-label">
              {uploadingCerts ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-cloud-upload me-2"></i>
              )}
              Click to upload certificates (JPG, PNG only)
              <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" multiple onChange={handleCertificatesUpload} hidden />
            </label>
            {therapistFormData.licenseFiles.length > 0 && (
              <div className="uploaded-files mt-3">
                {therapistFormData.licenseFiles.map((file, idx) => (
                  <span key={idx} className="badge bg-success me-2 mb-2">
                    <i className="bi bi-file-earmark-check me-1"></i>
                    {file.fileName || `File ${idx + 1}`}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="doc-step-content animate-fade-in">
      <div className="doc-section-header">
        <h3><i className="bi bi-stars me-2"></i>Expertise & Style</h3>
        <p>Help patients find the right match by sharing your therapeutic expertise and approach.</p>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <label className="doc-form-label">Specializations <span className="text-danger">*</span></label>
          <div className="multi-select-grid">
            {SPECIALIZATIONS.map((spec) => (
              <button key={spec} type="button" className={`multi-select-btn ${therapistFormData.specializations.includes(spec) ? 'selected' : ''}`} onClick={() => handleMultiSelect('specializations', spec)}>
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="col-12">
          <label className="doc-form-label">Therapeutic Approaches</label>
          <div className="multi-select-grid">
            {APPROACHES.map((approach) => (
              <button key={approach} type="button" className={`multi-select-btn ${therapistFormData.approachesUsed.includes(approach) ? 'selected' : ''}`} onClick={() => handleMultiSelect('approachesUsed', approach)}>
                {approach}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <label className="doc-form-label">Preferred Therapy Style</label>
          <select className="form-select doc-form-input" name="preferredTherapyStyle" value={therapistFormData.preferredTherapyStyle} onChange={handleTherapistChange}>
            {THERAPY_STYLES.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="doc-form-label">Age Groups Served</label>
          <div className="d-flex flex-wrap gap-2">
            {AGE_GROUPS.map((group) => (
              <button key={group} type="button" className={`btn btn-sm ${therapistFormData.ageGroupsServed.includes(group) ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleMultiSelect('ageGroupsServed', group)}>
                {group}
              </button>
            ))}
          </div>
        </div>

        <div className="col-12">
          <label className="doc-form-label">Short Bio</label>
          <textarea className="form-control doc-form-input" name="shortBio" value={therapistFormData.shortBio} onChange={handleTherapistChange} rows="4" placeholder="Share your journey as a therapist, your philosophy, and what drives you..." maxLength={1500}></textarea>
          <small className="text-muted">{therapistFormData.shortBio.length}/1500 characters</small>
        </div>

        <div className="col-md-6">
          <label className="doc-form-label">Areas You're Comfortable With</label>
          <div className="input-group mb-2">
            <input type="text" className="form-control doc-form-input" value={newAreaComfortable} onChange={(e) => setNewAreaComfortable(e.target.value)} placeholder="e.g., Work stress, Parenting issues" />
            <button type="button" className="btn btn-outline-primary" onClick={addAreaComfortable}>Add</button>
          </div>
          <div className="tag-list">
            {therapistFormData.areasComfortableWith.map((area, idx) => (
              <span key={idx} className="tag tag-success">{area} <button type="button" className="tag-remove" onClick={() => setTherapistFormData(prev => ({ ...prev, areasComfortableWith: prev.areasComfortableWith.filter((_, i) => i !== idx) }))}>&times;</button></span>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <label className="doc-form-label">Areas You Don't Handle</label>
          <div className="input-group mb-2">
            <input type="text" className="form-control doc-form-input" value={newAreaNotHandled} onChange={(e) => setNewAreaNotHandled(e.target.value)} placeholder="e.g., Severe psychiatric cases" />
            <button type="button" className="btn btn-outline-primary" onClick={addAreaNotHandled}>Add</button>
          </div>
          <div className="tag-list">
            {therapistFormData.areasNotHandled.map((area, idx) => (
              <span key={idx} className="tag tag-danger">{area} <button type="button" className="tag-remove" onClick={() => setTherapistFormData(prev => ({ ...prev, areasNotHandled: prev.areasNotHandled.filter((_, i) => i !== idx) }))}>&times;</button></span>
            ))}
          </div>
        </div>

        <div className="col-12">
          <label className="doc-form-label">Languages for Session</label>
          <div className="input-group mb-2">
            <input type="text" className="form-control doc-form-input" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Add a language" />
            <button type="button" className="btn btn-outline-primary" onClick={addLanguage}>Add</button>
          </div>
          <div className="tag-list">
            {therapistFormData.languagesForSession.map((lang, idx) => (
              <span key={idx} className="tag tag-primary">{lang} <button type="button" className="tag-remove" onClick={() => setTherapistFormData(prev => ({ ...prev, languagesForSession: prev.languagesForSession.filter((_, i) => i !== idx) }))}>&times;</button></span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="doc-step-content animate-fade-in">
      <div className="doc-section-header">
        <h3><i className="bi bi-calendar-check me-2"></i>Availability & Settings</h3>
        <p>Set your consultation preferences and availability schedule.</p>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <label className="doc-form-label">Session Duration</label>
          <select className="form-select doc-form-input" name="sessionDuration" value={therapistFormData.sessionDuration} onChange={handleTherapistChange}>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>
        <div className="col-md-4">
          <label className="doc-form-label">Max Sessions/Day</label>
          <input type="number" className="form-control doc-form-input" name="sessionLimitPerDay" value={therapistFormData.sessionLimitPerDay} onChange={handleTherapistChange} min="1" max="20" />
        </div>
        <div className="col-md-4">
          <label className="doc-form-label">Break Between Sessions</label>
          <select className="form-select doc-form-input" name="breakTimeBetweenSessions" value={therapistFormData.breakTimeBetweenSessions} onChange={handleTherapistChange}>
            <option value={0}>No break</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>

        <div className="col-md-6">
          <label className="doc-form-label">Preferred Communication Mode</label>
          <div className="d-flex flex-wrap gap-2">
            {COMMUNICATION_MODES.map((mode) => (
              <button key={mode} type="button" className={`btn btn-sm ${therapistFormData.preferredCommunicationMode.includes(mode) ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleMultiSelect('preferredCommunicationMode', mode)}>
                <i className={`bi bi-${mode === 'Video' ? 'camera-video' : mode === 'Audio' ? 'telephone' : mode === 'Chat' ? 'chat-dots' : 'geo-alt'} me-1`}></i>
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="col-md-6">
          <label className="doc-form-label">Emergency Response Policy</label>
          <select className="form-select doc-form-input" name="emergencyResponsePolicy" value={therapistFormData.emergencyResponsePolicy} onChange={handleTherapistChange}>
            {EMERGENCY_POLICIES.map(policy => (
              <option key={policy} value={policy}>{policy}</option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <div className="doc-section-header mt-4">
            <h5><i className="bi bi-calendar3-range me-2"></i>Availability Schedule</h5>
            <p>Set your available dates and time slots for appointments.</p>
          </div>

          <div className="card doc-inner-card">
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="doc-form-label">Date</label>
                  <input type="date" className="form-control doc-form-input" value={therapistAvailabilityDate} onChange={e => setTherapistAvailabilityDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="col-md-8">
                  <label className="doc-form-label">Time Slots (HH:MM)</label>
                  {therapistAvailabilityTimeSlots.map((slot, idx) => (
                    <div key={idx} className="input-group mb-2">
                      <span className="input-group-text"><i className="bi bi-clock"></i></span>
                      <input type="text" className="form-control doc-form-input" placeholder="09:00" value={slot} onChange={e => {
                        const newSlots = [...therapistAvailabilityTimeSlots];
                        newSlots[idx] = e.target.value;
                        setTherapistAvailabilityTimeSlots(newSlots);
                      }} />
                      {therapistAvailabilityTimeSlots.length > 1 && (
                        <button className="btn btn-outline-danger" type="button" onClick={() => setTherapistAvailabilityTimeSlots(therapistAvailabilityTimeSlots.filter((_, i) => i !== idx))}>
                          <i className="bi bi-x-lg"></i>
                        </button>
                      )}
                    </div>
                  ))}
                  <button className="btn btn-sm btn-outline-primary" type="button" onClick={handleAddTherapistTimeSlot}>
                    <i className="bi bi-plus-circle me-1"></i> Add Time Slot
                  </button>
                </div>
              </div>
              <button className="btn btn-primary" type="button" onClick={handleAddTherapistAvailability}>
                <i className="bi bi-plus-circle me-2"></i> Add Availability
              </button>
            </div>
          </div>

          {therapistFormData.availability.length > 0 && (
            <div className="mt-4">
              <h6 className="text-success"><i className="bi bi-check-circle-fill me-2"></i>Added Availability ({therapistFormData.availability.length})</h6>
              <div className="row g-3">
                {therapistFormData.availability.map((avail, idx) => (
                  <div key={idx} className="col-md-6">
                    <div className="card doc-availability-item">
                      <div className="card-body d-flex justify-content-between align-items-start">
                        <div>
                          <strong>{new Date(avail.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                          <div className="mt-2">
                            {avail.time_slots.map((slot, slotIdx) => (
                              <span key={slotIdx} className="badge bg-primary me-1"><i className="bi bi-clock me-1"></i>{slot}</span>
                            ))}
                          </div>
                        </div>
                        <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => handleRemoveTherapistAvailability(idx)}>
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="doc-step-content animate-fade-in">
      <div className="doc-section-header">
        <h3><i className="bi bi-currency-dollar me-2"></i>Pricing & Payment</h3>
        <p>Set transparent pricing for your services. Clear pricing builds trust.</p>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <label className="doc-form-label">Session Fees (per session)</label>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input type="number" className="form-control doc-form-input" name="sessionFee.individual" value={therapistFormData.sessionFee.individual} onChange={handleTherapistChange} placeholder="Individual" />
              </div>
              <small className="text-muted">Individual</small>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input type="number" className="form-control doc-form-input" name="sessionFee.couple" value={therapistFormData.sessionFee.couple} onChange={handleTherapistChange} placeholder="Couple" />
              </div>
              <small className="text-muted">Couple</small>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input type="number" className="form-control doc-form-input" name="sessionFee.family" value={therapistFormData.sessionFee.family} onChange={handleTherapistChange} placeholder="Family" />
              </div>
              <small className="text-muted">Family</small>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input type="number" className="form-control doc-form-input" name="sessionFee.group" value={therapistFormData.sessionFee.group} onChange={handleTherapistChange} placeholder="Group" />
              </div>
              <small className="text-muted">Group</small>
            </div>
          </div>
        </div>

        <div className="col-12">
          <label className="doc-form-label">Refund & Reschedule Policy</label>
          <textarea className="form-control doc-form-input" name="refundReschedulePolicy" value={therapistFormData.refundReschedulePolicy} onChange={handleTherapistChange} rows="3" placeholder="e.g., Full refund if cancelled 24+ hours before session. Reschedule within 7 days of original appointment..." maxLength={1000}></textarea>
        </div>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="doc-step-content animate-fade-in">
      <div className="doc-section-header">
        <h3><i className="bi bi-shield-check me-2"></i>Safety & Policies</h3>
        <p>Ethics and safety are non-negotiable in mental health. Please review and agree to the following.</p>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <div className="policy-card">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="confidentialityAgreement" checked={therapistFormData.confidentialityAgreement} onChange={handleTherapistChange} id="confidentiality" />
              <label className="form-check-label" htmlFor="confidentiality">
                <strong>Confidentiality Agreement</strong>
                <p className="text-muted mb-0 small">I agree to maintain strict confidentiality of all client information in accordance with professional ethical standards and applicable laws.</p>
              </label>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="policy-card">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="mandatoryReportingConsent" checked={therapistFormData.mandatoryReportingConsent} onChange={handleTherapistChange} id="reporting" />
              <label className="form-check-label" htmlFor="reporting">
                <strong>Mandatory Reporting Consent</strong>
                <p className="text-muted mb-0 small">I understand and agree to comply with mandatory reporting requirements for situations involving harm to self or others, child abuse, or elder abuse.</p>
              </label>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="policy-card">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="ethicalPracticeDeclaration" checked={therapistFormData.ethicalPracticeDeclaration} onChange={handleTherapistChange} id="ethical" />
              <label className="form-check-label" htmlFor="ethical">
                <strong>Ethical Practice Declaration</strong>
                <p className="text-muted mb-0 small">I declare that I will practice in accordance with the ethical guidelines of my profession and maintain appropriate boundaries with all clients.</p>
              </label>
            </div>
          </div>
        </div>

        <div className="col-12">
          <label className="doc-form-label">Informed Consent Policy for Clients</label>
          <textarea className="form-control doc-form-input" name="informedConsentPolicy" value={therapistFormData.informedConsentPolicy} onChange={handleTherapistChange} rows="4" placeholder="Describe your informed consent process and what clients should know before starting therapy..." maxLength={2000}></textarea>
        </div>


        {(!therapistFormData.confidentialityAgreement || !therapistFormData.mandatoryReportingConsent || !therapistFormData.ethicalPracticeDeclaration) && (
          <div className="col-12">
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Please agree to all safety policies above to submit your application.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="doc-loading-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-form-page">
      <Navbar user={user} />
      <div className="navbar-spacer"></div>

      <div className="doc-hero-section">
        <div className="container">
          <div className="doc-hero-content">
            <h1 className="doc-hero-title">
              <i className="bi bi-heart-pulse-fill me-3"></i>
              {t("doc.heroTitle", "Join Our Professional Network")}
            </h1>
            <p className="doc-hero-subtitle">
              {t("doc.heroSubtitle", "Make a meaningful difference in people's lives. Join our community of dedicated mental health professionals.")}
            </p>
            <div className="doc-hero-features">
              <div className="doc-feature-item">
                <i className="bi bi-people-fill"></i>
                <span>{t("doc.featureConnect", "Connect with patients")}</span>
              </div>
              <div className="doc-feature-item">
                <i className="bi bi-calendar-check-fill"></i>
                <span>{t("doc.featureScheduling", "Flexible scheduling")}</span>
              </div>
              <div className="doc-feature-item">
                <i className="bi bi-shield-check-fill"></i>
                <span>{t("doc.featureVerified", "Verified platform")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container doc-form-container">
        <div className="doc-tabs-wrapper">
          <ul className="nav nav-pills doc-tabs" role="tablist">
            <li className="nav-item" role="presentation">
              <button className={`nav-link ${activeTab === "therapist" ? "active" : ""}`} onClick={() => { setActiveTab("therapist"); setError(""); setMessage(""); }} type="button">
                <i className="bi bi-person-hearts me-2"></i>
                {t("doc.therapistTab", "Therapist Application")}
              </button>
            </li>
            <li className="nav-item" role="presentation">
              <button className={`nav-link ${activeTab === "healthcare" ? "active" : ""}`} onClick={() => { setActiveTab("healthcare"); setError(""); setMessage(""); }} type="button">
                <i className="bi bi-hospital me-2"></i>
                {t("doc.healthcareTab", "Healthcare Professional")}
              </button>
            </li>
          </ul>
        </div>

        <div className="doc-form-card">
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError("")} aria-label="Close"></button>
            </div>
          )}

          {message && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>
              {message}
              <button type="button" className="btn-close" onClick={() => setMessage("")} aria-label="Close"></button>
            </div>
          )}

          {activeTab === "therapist" ? (
            <div className="doc-form-content">
              {renderProgressBar()}

              <form onSubmit={handleTherapistSubmit}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
                {currentStep === 5 && renderStep5()}
                {currentStep === 6 && renderStep6()}

                <div className="doc-form-actions d-flex justify-content-between mt-4">
                  {currentStep > 1 && (
                    <button type="button" className="btn btn-outline-primary btn-lg" onClick={prevStep}>
                      <i className="bi bi-arrow-left me-2"></i>
                      Previous
                    </button>
                  )}
                  <div className="ms-auto">
                    {currentStep < totalSteps ? (
                      <button type="button" className="btn btn-primary btn-lg" onClick={nextStep}>
                        Next
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-success btn-lg doc-submit-btn" disabled={submitting}>
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-fill me-2"></i>
                            Submit Application
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="doc-form-content">
              <div className="doc-progress-container mb-4">
                <div className="doc-progress-bar">
                  {[1, 2, 3, 4].map((step) => (
                    <div key={step} className={`doc-progress-step ${hcCurrentStep >= step ? 'active' : ''} ${hcCurrentStep === step ? 'current' : ''}`}>
                      <div className="step-number">{step}</div>
                      <div className="step-label">
                        {step === 1 && "Identity"}
                        {step === 2 && "Role Type"}
                        {step === 3 && "Credentials"}
                        {step === 4 && "Experience"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleHealthcareSubmit}>
                {hcCurrentStep === 1 && (
                  <div className="doc-step-content animate-fade-in">
                    <div className="doc-section-header">
                      <h3><i className="bi bi-person-badge me-2"></i>Identity & Contact</h3>
                      <p>Professional identity verification for dementia care specialists.</p>
                    </div>

                    <div className="row g-4">
                      <div className="col-md-4 text-center">
                        <div className="profile-photo-upload">
                          {healthcareFormData.profilePhoto ? (
                            <div className="position-relative d-inline-block">
                              <img 
                                src={healthcareFormData.profilePhoto} 
                                alt="Profile" 
                                className="profile-preview" 
                                crossOrigin="anonymous"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  console.warn('Image failed to load:', healthcareFormData.profilePhoto);
                                }}
                              />
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 rounded-circle" 
                                style={{ width: '28px', height: '28px', padding: 0 }}
                                onClick={() => setHealthcareFormData(prev => ({ ...prev, profilePhoto: "" }))}
                                title="Remove photo"
                              >
                                <i className="bi bi-x"></i>
                              </button>
                              <div className="mt-2">
                                <small className="text-success"><i className="bi bi-check-circle me-1"></i>Photo uploaded</small>
                              </div>
                            </div>
                          ) : (
                            <div className="profile-placeholder">
                              <i className="bi bi-camera-fill"></i>
                            </div>
                          )}
                          <label className="btn btn-outline-primary btn-sm mt-2">
                            {uploadingPhoto ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-upload me-2"></i>}
                            {healthcareFormData.profilePhoto ? 'Change Photo' : 'Upload Photo'}
                            <input type="file" accept="image/*" onChange={handleHcPhotoUpload} hidden />
                          </label>
                          <div className="mt-1">
                            <small className="text-muted">JPG, PNG, WebP • Max 5MB</small>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-8">
                        <div className="row g-3">
                          <div className="col-md-6">
                            <label className="doc-form-label">Full Name <span className="text-danger">*</span></label>
                            <input type="text" className="form-control doc-form-input" name="fullName" value={healthcareFormData.fullName} onChange={handleHealthcareChange} required placeholder="Dr. John Smith" />
                          </div>
                          <div className="col-md-6">
                            <label className="doc-form-label">Preferred Name</label>
                            <input type="text" className="form-control doc-form-input" name="preferredName" value={healthcareFormData.preferredName} onChange={handleHealthcareChange} placeholder="John" />
                          </div>
                          <div className="col-md-6">
                            <label className="doc-form-label">Email <span className="text-danger">*</span> <small className="text-muted">(from your account)</small></label>
                            <input type="email" className="form-control doc-form-input" name="email" value={healthcareFormData.email} disabled readOnly style={{ backgroundColor: '#f0f7f4', cursor: 'not-allowed' }} />
                          </div>
                          <div className="col-md-6">
                            <label className="doc-form-label">Phone</label>
                            <input type="tel" className="form-control doc-form-input" name="phone" value={healthcareFormData.phone} onChange={handleHealthcareChange} placeholder="+91 98765 43210" />
                          </div>
                          <div className="col-md-4">
                            <label className="doc-form-label">City</label>
                            <input type="text" className="form-control doc-form-input" name="city" value={healthcareFormData.city} onChange={handleHealthcareChange} placeholder="Mumbai" />
                          </div>
                          <div className="col-md-4">
                            <label className="doc-form-label">State</label>
                            <input type="text" className="form-control doc-form-input" name="state" value={healthcareFormData.state} onChange={handleHealthcareChange} placeholder="Maharashtra" />
                          </div>
                          <div className="col-md-4">
                            <label className="doc-form-label">Country</label>
                            <input type="text" className="form-control doc-form-input" name="country" value={healthcareFormData.country} onChange={handleHealthcareChange} placeholder="India" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hcCurrentStep === 2 && (
                  <div className="doc-step-content animate-fade-in">
                    <div className="doc-section-header">
                      <h3><i className="bi bi-briefcase me-2"></i>Role & Specialization</h3>
                      <p>Select your role categories and areas of expertise in dementia care.</p>
                    </div>

                    <div className="row g-4">
                      <div className="col-12">
                        <label className="doc-form-label">Role Categories <span className="text-danger">*</span></label>
                        <div className="multi-select-grid">
                          {HC_ROLE_CATEGORIES.map((role) => (
                            <button key={role} type="button" className={`multi-select-btn ${healthcareFormData.roleCategories.includes(role) ? 'selected' : ''}`} onClick={() => handleHcMultiSelect('roleCategories', role)}>
                              {role}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="doc-form-label">Dementia Types Experienced</label>
                        <div className="multi-select-grid">
                          {DEMENTIA_TYPES.map((type) => (
                            <button key={type} type="button" className={`multi-select-btn ${healthcareFormData.dementiaTypesExperienced.includes(type) ? 'selected' : ''}`} onClick={() => handleHcMultiSelect('dementiaTypesExperienced', type)}>
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="doc-form-label">Dementia Stages Handled</label>
                        <div className="multi-select-grid">
                          {DEMENTIA_STAGES.map((stage) => (
                            <button key={stage} type="button" className={`multi-select-btn ${healthcareFormData.dementiaStagesHandled.includes(stage) ? 'selected' : ''}`} onClick={() => handleHcMultiSelect('dementiaStagesHandled', stage)}>
                              {stage}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hcCurrentStep === 3 && (
                  <div className="doc-step-content animate-fade-in">
                    <div className="doc-section-header">
                      <h3><i className="bi bi-mortarboard me-2"></i>Credentials & Qualifications</h3>
                      <p>Your professional qualifications and certifications in dementia care.</p>
                    </div>

                    <div className="row g-4">
                      <div className="col-md-6">
                        <label className="doc-form-label">Highest Qualification <span className="text-danger">*</span></label>
                        <input type="text" className="form-control doc-form-input" name="highestQualification" value={healthcareFormData.highestQualification} onChange={handleHealthcareChange} placeholder="MD Geriatrics, MS Neurology" required />
                      </div>
                      <div className="col-md-6">
                        <label className="doc-form-label">Years in Dementia Care <span className="text-danger">*</span></label>
                        <input type="number" className="form-control doc-form-input" name="yearsInDementiaCare" value={healthcareFormData.yearsInDementiaCare} onChange={handleHealthcareChange} min="0" max="70" required />
                      </div>
                      <div className="col-md-6">
                        <label className="doc-form-label">License Number</label>
                        <input type="text" className="form-control doc-form-input" name="licenseNumber" value={healthcareFormData.licenseNumber} onChange={handleHealthcareChange} placeholder="MCI/XXXXX" />
                      </div>

                      <div className="col-12">
                        <label className="doc-form-label">Dementia Certifications</label>
                        <div className="card doc-inner-card">
                          <div className="card-body">
                            <div className="row g-2 mb-3">
                              <div className="col-md-4">
                                <input type="text" className="form-control doc-form-input" placeholder="Certification Name" value={newHcCertification.name} onChange={(e) => setNewHcCertification({ ...newHcCertification, name: e.target.value })} />
                              </div>
                              <div className="col-md-3">
                                <input type="text" className="form-control doc-form-input" placeholder="Issuing Body" value={newHcCertification.issuingBody} onChange={(e) => setNewHcCertification({ ...newHcCertification, issuingBody: e.target.value })} />
                              </div>
                              <div className="col-md-3">
                                <input type="number" className="form-control doc-form-input" placeholder="Year" value={newHcCertification.year} onChange={(e) => setNewHcCertification({ ...newHcCertification, year: e.target.value })} />
                              </div>
                              <div className="col-md-2">
                                <button type="button" className="btn btn-primary w-100" onClick={addHcCertification}>
                                  <i className="bi bi-plus-lg"></i>
                                </button>
                              </div>
                            </div>
                            {healthcareFormData.dementiaCertifications.length > 0 && (
                              <div className="cert-list">
                                {healthcareFormData.dementiaCertifications.map((cert, idx) => (
                                  <div key={idx} className="cert-item d-flex justify-content-between align-items-center">
                                    <span><strong>{cert.name}</strong> {cert.issuingBody && `- ${cert.issuingBody}`} {cert.year && `(${cert.year})`}</span>
                                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setHealthcareFormData(prev => ({ ...prev, dementiaCertifications: prev.dementiaCertifications.filter((_, i) => i !== idx) }))}>
                                      <i className="bi bi-x"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="doc-form-label">Upload License/Certificates (Max 5 files)</label>
                        <div className="file-upload-area">
                          <label className="file-upload-label">
                            {uploadingCerts ? (
                              <span className="spinner-border spinner-border-sm me-2"></span>
                            ) : (
                              <i className="bi bi-cloud-upload me-2"></i>
                            )}
                            Click to upload certificates (JPG, PNG only)
                            <input type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" multiple onChange={handleHcCertificatesUpload} hidden />
                          </label>
                          {healthcareFormData.licenseFiles.length > 0 && (
                            <div className="uploaded-files mt-3">
                              {healthcareFormData.licenseFiles.map((file, idx) => (
                                <span key={idx} className="badge bg-success me-2 mb-2">
                                  <i className="bi bi-file-earmark-check me-1"></i>
                                  {file.fileName || `File ${idx + 1}`}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hcCurrentStep === 4 && (
                  <div className="doc-step-content animate-fade-in">
                    <div className="doc-section-header">
                      <h3><i className="bi bi-briefcase-fill me-2"></i>Experience & Additional Info</h3>
                      <p>Share your professional experience and additional information.</p>
                    </div>

                    <div className="row g-4">
                      <div className="col-12">
                        <label className="doc-form-label">Short Bio</label>
                        <textarea className="form-control doc-form-input" name="shortBio" value={healthcareFormData.shortBio} onChange={handleHealthcareChange} rows="4" placeholder="Share your experience in dementia care, your approach, and what drives you..." maxLength={1500}></textarea>
                        <small className="text-muted">{healthcareFormData.shortBio.length}/1500 characters</small>
                      </div>

                      <div className="col-12">
                        <label className="doc-form-label">Special Skills</label>
                        <div className="input-group mb-2">
                          <input type="text" className="form-control doc-form-input" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="e.g., Cognitive assessment, Behavioral management" />
                          <button type="button" className="btn btn-outline-primary" onClick={addHcSkill}>Add</button>
                        </div>
                        <div className="tag-list">
                          {healthcareFormData.specialSkills.map((skill, idx) => (
                            <span key={idx} className="tag tag-primary">{skill} <button type="button" className="tag-remove" onClick={() => setHealthcareFormData(prev => ({ ...prev, specialSkills: prev.specialSkills.filter((_, i) => i !== idx) }))}>&times;</button></span>
                          ))}
                        </div>
                      </div>

                      <div className="col-12">
                        <label className="doc-form-label">Languages Spoken</label>
                        <div className="input-group mb-2">
                          <input type="text" className="form-control doc-form-input" value={newHcLanguage} onChange={(e) => setNewHcLanguage(e.target.value)} placeholder="Add a language" />
                          <button type="button" className="btn btn-outline-primary" onClick={addHcLanguage}>Add</button>
                        </div>
                        <div className="tag-list">
                          {healthcareFormData.languagesSpoken.map((lang, idx) => (
                            <span key={idx} className="tag tag-primary">{lang} <button type="button" className="tag-remove" onClick={() => setHealthcareFormData(prev => ({ ...prev, languagesSpoken: prev.languagesSpoken.filter((_, i) => i !== idx) }))}>&times;</button></span>
                          ))}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="doc-form-label">Preferred Communication Mode</label>
                        <div className="d-flex flex-wrap gap-2">
                          {HC_COMMUNICATION_MODES.map((mode) => (
                            <button key={mode} type="button" className={`btn btn-sm ${healthcareFormData.preferredCommunicationMode.includes(mode) ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => handleHcMultiSelect('preferredCommunicationMode', mode)}>
                              <i className={`bi bi-${mode === 'Video' ? 'camera-video' : mode === 'Audio' ? 'telephone' : mode === 'Chat' ? 'chat-dots' : mode === 'In-Person' ? 'person' : 'house'} me-1`}></i>
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label className="doc-form-label">Session Duration</label>
                        <select className="form-select doc-form-input" name="sessionDuration" value={healthcareFormData.sessionDuration} onChange={handleHealthcareChange}>
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>60 minutes</option>
                          <option value={90}>90 minutes</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="doc-form-label">Consultation Fees</label>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text">₹</span>
                              <input type="number" className="form-control doc-form-input" name="consultationFee.initial" value={healthcareFormData.consultationFee.initial} onChange={handleHealthcareChange} placeholder="Initial" />
                            </div>
                            <small className="text-muted">Initial Consultation</small>
                          </div>
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text">₹</span>
                              <input type="number" className="form-control doc-form-input" name="consultationFee.followUp" value={healthcareFormData.consultationFee.followUp} onChange={handleHealthcareChange} placeholder="Follow-up" />
                            </div>
                            <small className="text-muted">Follow-up</small>
                          </div>
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text">₹</span>
                              <input type="number" className="form-control doc-form-input" name="consultationFee.homeVisit" value={healthcareFormData.consultationFee.homeVisit} onChange={handleHealthcareChange} placeholder="Home Visit" />
                            </div>
                            <small className="text-muted">Home Visit</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="doc-form-actions d-flex justify-content-between mt-4">
                  {hcCurrentStep > 1 && (
                    <button type="button" className="btn btn-outline-primary btn-lg" onClick={hcPrevStep}>
                      <i className="bi bi-arrow-left me-2"></i>
                      Previous
                    </button>
                  )}
                  <div className="ms-auto">
                    {hcCurrentStep < hcTotalSteps ? (
                      <button type="button" className="btn btn-primary btn-lg" onClick={hcNextStep}>
                        Next
                        <i className="bi bi-arrow-right ms-2"></i>
                      </button>
                    ) : (
                      <button type="submit" className="btn btn-success btn-lg doc-submit-btn" disabled={submitting}>
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send-fill me-2"></i>
                            Submit Application
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}