import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-toastify/dist/ReactToastify.css";
import API from "../utils/axiosClient";

// Validation schema
const schema = yup.object().shape({
  name: yup.string().required("Name is required").min(3, "Name must be at least 3 characters"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().matches(/^\d{10}$/, "Phone number must be 10 digits").required("Phone is required"),
  specialization: yup.string().required("Specialization is required"),
  experience: yup.number().min(0, "Experience cannot be negative").required("Experience is required"),
  qualifications: yup.string().optional(),
});

export default function TherapistForm() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await API.therapist.apply(data);
      toast.success("Form submitted successfully!");
      reset();
    } catch (err) {
      toast.error(err.message || "Error submitting form");
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center text-primary mb-4">Therapist Application Form</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input className={`form-control ${errors.name ? "is-invalid" : ""}`} {...register("name")} />
          {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Email *</label>
          <input className={`form-control ${errors.email ? "is-invalid" : ""}`} {...register("email")} />
          {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Phone *</label>
          <input className={`form-control ${errors.phone ? "is-invalid" : ""}`} {...register("phone")} />
          {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Specialization *</label>
          <input className={`form-control ${errors.specialization ? "is-invalid" : ""}`} {...register("specialization")} />
          {errors.specialization && <div className="invalid-feedback">{errors.specialization.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Experience (Years) *</label>
          <input type="number" className={`form-control ${errors.experience ? "is-invalid" : ""}`} {...register("experience")} />
          {errors.experience && <div className="invalid-feedback">{errors.experience.message}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Qualifications</label>
          <input className="form-control" {...register("qualifications")} />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>

      <footer className="text-center mt-5">
        <hr />
        <Link to="/admin" className="me-3 btn btn-link">Admin Dashboard</Link>
        <Link to="/talk-to-counselor" className="btn btn-link">Talk to Counselor</Link>
      </footer>

      <ToastContainer position="top-center" />
    </div>
  );
}
