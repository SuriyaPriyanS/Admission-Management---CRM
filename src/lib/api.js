import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function readError(error) {
  if (error?.response?.data?.errors?.length) {
    return error.response.data.errors.join(", ");
  }
  return error?.response?.data?.message || "Something went wrong";
}

export async function checkQuotaAvailability(programId, quotaType) {
  const response = await api.get(`/admissions/availability/${programId}/${quotaType}`);
  return response.data.data;
}

// Auth API helpers
export async function login(credentials) {
  const response = await api.post("/auth/login", credentials);
  return response.data.data;
}

export async function register(userData) {
  const response = await api.post("/auth/register", userData);
  return response.data.data;
}

export async function getMe() {
  const response = await api.get("/auth/me");
  return response.data.data;
}

// Masters API helpers
export async function getInstitutions() {
  const response = await api.get("/masters/institutions");
  return response.data.data;
}

export async function createInstitution(data) {
  const response = await api.post("/masters/institutions", data);
  return response.data.data;
}

export async function updateInstitution(id, data) {
  const response = await api.put(`/masters/institutions/${id}`, data);
  return response.data.data;
}

export async function deleteInstitution(id) {
  const response = await api.delete(`/masters/institutions/${id}`);
  return response.data.data;
}

export async function getCampuses() {
  const response = await api.get("/masters/campuses");
  return response.data.data;
}

export async function createCampus(data) {
  const response = await api.post("/masters/campuses", data);
  return response.data.data;
}

export async function updateCampus(id, data) {
  const response = await api.put(`/masters/campuses/${id}`, data);
  return response.data.data;
}

export async function deleteCampus(id) {
  const response = await api.delete(`/masters/campuses/${id}`);
  return response.data.data;
}

export async function getDepartments() {
  const response = await api.get("/masters/departments");
  return response.data.data;
}

export async function createDepartment(data) {
  const response = await api.post("/masters/departments", data);
  return response.data.data;
}

export async function updateDepartment(id, data) {
  const response = await api.put(`/masters/departments/${id}`, data);
  return response.data.data;
}

export async function deleteDepartment(id) {
  const response = await api.delete(`/masters/departments/${id}`);
  return response.data.data;
}

export async function getPrograms() {
  const response = await api.get("/masters/programs");
  return response.data.data;
}

export async function createProgram(data) {
  const response = await api.post("/masters/programs", data);
  return response.data.data;
}

export async function updateProgram(id, data) {
  const response = await api.put(`/masters/programs/${id}`, data);
  return response.data.data;
}

export async function deleteProgram(id) {
  const response = await api.delete(`/masters/programs/${id}`);
  return response.data.data;
}

// Applicants API helpers
export async function getApplicants() {
  const response = await api.get("/applicants");
  return response.data.data;
}

export async function createApplicant(data) {
  const response = await api.post("/applicants", data);
  return response.data.data;
}

export async function updateApplicant(id, data) {
  const response = await api.put(`/applicants/${id}`, data);
  return response.data.data;
}

export async function deleteApplicant(id) {
  const response = await api.delete(`/applicants/${id}`);
  return response.data.data;
}

export async function updateApplicantDocuments(applicantId, data) {
  const response = await api.patch(`/applicants/${applicantId}/documents`, data);
  return response.data.data;
}

// Admissions API helpers
export async function getAdmissions() {
  const response = await api.get("/admissions");
  return response.data.data;
}

export async function allocateSeat(data) {
  const response = await api.post("/admissions/allocate", data);
  return response.data.data;
}

export async function updateAdmission(id, data) {
  const response = await api.put(`/admissions/${id}`, data);
  return response.data.data;
}

export async function deleteAdmission(id) {
  const response = await api.delete(`/admissions/${id}`);
  return response.data.data;
}

export async function updateFeeStatus(admissionId, data) {
  const response = await api.patch(`/admissions/${admissionId}/fee`, data);
  return response.data.data;
}

export async function confirmAdmission(admissionId) {
  const response = await api.patch(`/admissions/${admissionId}/confirm`);
  return response.data.data;
}

// Dashboard API helpers
export async function getDashboard() {
  const response = await api.get("/dashboard");
  return response.data.data;
}

