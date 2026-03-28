import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { loadAdmissionsThunk, loadApplicantsThunk, loadDashboardThunk } from "../features/data/dataSlice";
import { api, readError } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";

const DOC_ITEMS = [
  "10th Certificate",
  "12th Certificate",
  "Rank Card",
  "Transfer Certificate",
  "Migration Certificate",
  "ID Proof",
  "Photo",
  "Caste Certificate",
  "Domicile Certificate",
  "Medical Certificate",
];

function defaultsForDocStatus(status) {
  if (status === "VERIFIED") {
    return DOC_ITEMS.reduce((acc, doc) => ({ ...acc, [doc]: true }), {});
  }

  if (status === "SUBMITTED") {
    return DOC_ITEMS.reduce(
      (acc, doc, index) => ({ ...acc, [doc]: index < 2 }),
      {}
    );
  }

  return DOC_ITEMS.reduce((acc, doc) => ({ ...acc, [doc]: false }), {});
}

function computeDocStatus(docChecks) {
  const values = Object.values(docChecks || {});
  if (values.length > 0 && values.every(Boolean)) {
    return "VERIFIED";
  }

  if (values.some(Boolean)) {
    return "SUBMITTED";
  }

  return "PENDING";
}

function toneForDocs(status) {
  if (status === "VERIFIED") return "success";
  if (status === "SUBMITTED") return "default";
  return "danger";
}

function toneForSeatStatus(status) {
  if (status === "CONFIRMED") return "success";
  if (status === "ALLOCATED") return "warning";
  return "warning";
}

function resolvedId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}

function getMaxDateOfBirth() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

export function ApplicantsPage() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.user?.role);
  const applicants = useAppSelector((state) => state.data.applicants);
  const admissions = useAppSelector((state) => state.data.admissions);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  const [docChecks, setDocChecks] = useState(defaultsForDocStatus("PENDING"));
  const [docModalApplicant, setDocModalApplicant] = useState(null);
  const [docModalStatus, setDocModalStatus] = useState("PENDING");
  const maxDateOfBirth = useMemo(() => getMaxDateOfBirth(), []);

  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      documentsStatus: "PENDING",
      gender: "MALE",
      mobile: "",
      email: "",
      category: "GM",
      quotaType: "KCET",
      entryType: "REGULAR",
      marks: "",
      qualifyingExam: "",
      fatherName: "",
      stateOfDomicile: "",
      allotmentNumber: "",
      isJkCandidate: false,
    },
  });

  useEffect(() => {
    dispatch(loadApplicantsThunk());
    dispatch(loadAdmissionsThunk());
  }, [dispatch]);

  async function refreshData() {
    await Promise.all([dispatch(loadApplicantsThunk()), dispatch(loadAdmissionsThunk())]);
    if (role === "ADMIN" || role === "MANAGEMENT") {
      await dispatch(loadDashboardThunk());
    }
  }

  function notify(message, type = "success") {
    dispatch(showMessage({ message, type }));
  }

  const admissionByApplicantId = useMemo(() => {
    const map = new Map();
    admissions.forEach((admission) => {
      const id = resolvedId(admission.applicantId);
      if (id) {
        map.set(id, admission);
      }
    });
    return map;
  }, [admissions]);

  function getNextApplicationNo() {
    let maxValue = 1000;

    applicants.forEach((applicant) => {
      const raw = String(applicant.applicationNo || "");
      const digits = Number(raw.replace(/\D/g, ""));
      if (!Number.isNaN(digits) && digits > maxValue) {
        maxValue = digits;
      }
    });

    return `APP${String(maxValue + 1).padStart(4, "0")}`;
  }

  function resetFormForCreate() {
    setEditingApplicant(null);
    setDocChecks(defaultsForDocStatus("PENDING"));
    form.reset({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      documentsStatus: "PENDING",
      gender: "MALE",
      mobile: "",
      email: "",
      category: "GM",
      quotaType: "KCET",
      entryType: "REGULAR",
      marks: "",
      qualifyingExam: "",
      fatherName: "",
      stateOfDomicile: "",
      allotmentNumber: "",
      isJkCandidate: false,
    });
  }

  function openCreateModal() {
    resetFormForCreate();
    setIsFormOpen(true);
  }

  function openEditModal(applicant) {
    const parts = String(applicant.fullName || "").trim().split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ");

    const addressParts = String(applicant.address || "").split("|").map((item) => item.trim());

    setEditingApplicant(applicant);
    setDocChecks(defaultsForDocStatus(applicant.documentsStatus));
    const existingDob = applicant.dateOfBirth?.split("T")[0] || "";
    const safeDob = existingDob && existingDob <= maxDateOfBirth ? existingDob : maxDateOfBirth;

    form.reset({
      firstName,
      lastName,
      dateOfBirth: safeDob,
      documentsStatus: applicant.documentsStatus || "PENDING",
      gender: applicant.gender || "MALE",
      mobile: applicant.phone || "",
      email: applicant.email || "",
      category: applicant.category || "GM",
      quotaType: applicant.quotaType || "KCET",
      entryType: applicant.entryType || "REGULAR",
      marks: applicant.marks ?? "",
      qualifyingExam: applicant.qualifyingExam || "",
      fatherName: addressParts[0] || "",
      stateOfDomicile: addressParts[1] || "",
      allotmentNumber: addressParts[2] || "",
      isJkCandidate: Boolean(applicant.isJkCandidate),
    });
    setIsFormOpen(true);
  }

  function closeFormModal() {
    setIsFormOpen(false);
    setEditingApplicant(null);
  }

  async function submitApplicant(values) {
    if (!values.dateOfBirth || values.dateOfBirth > maxDateOfBirth) {
      notify(`Date of birth must be before ${maxDateOfBirth}.`, "error");
      return;
    }

    const documentsStatus = values.documentsStatus || computeDocStatus(docChecks);

    const payload = {
      applicationNo: editingApplicant?.applicationNo || getNextApplicationNo(),
      fullName: `${values.firstName} ${values.lastName}`.trim(),
      email: values.email,
      phone: String(values.mobile || "").trim(),
      gender: values.gender,
      dateOfBirth: values.dateOfBirth,
      category: values.category,
      entryType: values.entryType,
      quotaType: values.quotaType,
      admissionMode: values.quotaType === "MANAGEMENT" ? "MANAGEMENT" : "GOVERNMENT",
      qualifyingExam: values.qualifyingExam,
      marks: Number(values.marks || 0),
      documentsStatus,
      address: `${values.fatherName || "N/A"} | ${values.stateOfDomicile || "N/A"}${
        values.allotmentNumber ? ` | ${values.allotmentNumber}` : ""
      }`,
      isJkCandidate: Boolean(values.isJkCandidate),
    };

    try {
      if (editingApplicant) {
        await api.put(`/applicants/${editingApplicant._id}`, payload);
        notify("Applicant updated");
      } else {
        await api.post("/applicants", payload);
        notify("Applicant created");
      }

      closeFormModal();
      resetFormForCreate();
      await refreshData();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  function updateDocCheck(doc, checked) {
    setDocChecks((prev) => {
      const next = { ...prev, [doc]: checked };
      form.setValue("documentsStatus", computeDocStatus(next));
      return next;
    });
  }

  async function deleteApplicant(id) {
    if (!confirm("Delete this applicant?")) {
      return;
    }

    try {
      await api.delete(`/applicants/${id}`);
      notify("Applicant deleted");
      await refreshData();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  function openDocModal(applicant) {
    setDocModalApplicant(applicant);
    setDocModalStatus(applicant.documentsStatus || "PENDING");
  }

  async function saveDocStatus() {
    if (!docModalApplicant) return;

    try {
      await api.patch(`/applicants/${docModalApplicant._id}/documents`, {
        documentsStatus: docModalStatus,
      });
      notify("Document status updated");
      setDocModalApplicant(null);
      await refreshData();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  return (
    <section className="space-y-5">
      <div className="section-header">
        <div>
          <h2 className="text-[26px] font-extrabold leading-none text-[#0d2333]">Applicant Management</h2>
          <p className="mt-2 text-[13px] text-[#8fa8c0]">Create and track applicants</p>
        </div>
        <Button className="h-10 w-full px-4 sm:w-auto sm:px-6" onClick={openCreateModal}>
          + New Applicant
        </Button>
      </div>

      <div className="table-wrap bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-3">App. ID</th>
              <th className="py-3">Name</th>
              <th className="py-3">Program</th>
              <th className="py-3">Quota</th>
              <th className="py-3">Category</th>
              <th className="py-3">Marks</th>
              <th className="py-3">Entry</th>
              <th className="py-3">Documents</th>
              <th className="py-3">Status</th>
              <th className="py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((applicant) => {
              const admission = admissionByApplicantId.get(applicant._id);
              const programLabel = admission?.programId?.code || admission?.programId?.name || "-";
              const seatStatus = admission?.status || "PENDING";

              return (
                <tr key={applicant._id} className="border-b border-border/80">
                  <td className="py-3 font-semibold">{applicant.applicationNo}</td>
                  <td className="py-3">{applicant.fullName}</td>
                  <td className="py-3">{programLabel}</td>
                  <td className="py-3">
                    <Badge tone={applicant.quotaType === "MANAGEMENT" ? "warning" : "default"}>{applicant.quotaType}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge>{applicant.category}</Badge>
                  </td>
                  <td className="py-3">{applicant.marks}%</td>
                  <td className="py-3">{applicant.entryType === "REGULAR" ? "Regular" : "Lateral"}</td>
                  <td className="py-3">
                    <Badge tone={toneForDocs(applicant.documentsStatus)}>{applicant.documentsStatus}</Badge>
                  </td>
                  <td className="py-3">
                    <Badge tone={toneForSeatStatus(seatStatus)}>{seatStatus}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openDocModal(applicant)}>
                        Docs
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => openEditModal(applicant)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteApplicant(applicant._id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {applicants.length === 0 && (
              <tr>
                <td colSpan={10} className="py-10 text-center text-muted-foreground">
                  No applicants yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <div className="page-modal-overlay" onClick={closeFormModal}>
          <div className="page-modal" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4">
              <h3 className="modal-title">{editingApplicant ? "Edit Applicant" : "Create Applicant"}</h3>
              <p className="modal-sub">Capture applicant details and documents as per workflow.</p>
            </div>

            <form className="space-y-4" onSubmit={form.handleSubmit(submitApplicant)}>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>First Name</Label>
                  <Input {...form.register("firstName", { required: true })} />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input {...form.register("lastName", { required: true })} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    max={maxDateOfBirth}
                    {...form.register("dateOfBirth", {
                      required: true,
                      validate: (value) =>
                        value <= maxDateOfBirth || `Date of birth must be before ${maxDateOfBirth}.`,
                    })}
                  />
                </div>
                <div>
                  <Label>Documents Status</Label>
                  <Select
                    {...form.register("documentsStatus")}
                    onChange={(event) => {
                      form.setValue("documentsStatus", event.target.value);
                      setDocChecks(defaultsForDocStatus(event.target.value));
                    }}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="SUBMITTED">SUBMITTED</option>
                    <option value="VERIFIED">VERIFIED</option>
                  </Select>
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select {...form.register("gender")}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </Select>
                </div>
                <div>
                  <Label>Mobile Number</Label>
                  <Input {...form.register("mobile", { required: true, pattern: /^[0-9]{10}$/ })} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" {...form.register("email", { required: true })} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select {...form.register("category")}>
                    <option value="GM">GM</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="EWS">EWS</option>
                  </Select>
                </div>
                <div>
                  <Label>Quota Type</Label>
                  <Select {...form.register("quotaType")}>
                    <option value="KCET">KCET</option>
                    <option value="COMEDK">COMEDK</option>
                    <option value="MANAGEMENT">Management</option>
                  </Select>
                </div>
                <div>
                  <Label>Entry Type</Label>
                  <Select {...form.register("entryType")}>
                    <option value="REGULAR">Regular</option>
                    <option value="LATERAL">Lateral</option>
                  </Select>
                </div>
                <div>
                  <Label>Qualifying Marks (%)</Label>
                  <Input type="number" step="0.1" {...form.register("marks", { required: true, min: 0, max: 100 })} />
                </div>
                <div>
                  <Label>Qualifying Exam / Rank</Label>
                  <Input {...form.register("qualifyingExam", { required: true })} />
                </div>
                <div>
                  <Label>Father's Name</Label>
                  <Input {...form.register("fatherName", { required: true })} />
                </div>
                <div>
                  <Label>State of Domicile</Label>
                  <Input {...form.register("stateOfDomicile", { required: true })} />
                </div>
                <div>
                  <Label>Allotment Number (Govt.)</Label>
                  <Input {...form.register("allotmentNumber")} />
                </div>
                <div className="flex items-center gap-2 pt-8">
                  <input type="checkbox" className="h-4 w-4 accent-[#0a9b8c]" {...form.register("isJkCandidate")} />
                  <Label>J&K Candidate</Label>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[#8fa8c0]">Document Checklist</p>
                <div className="doc-grid">
                  {DOC_ITEMS.map((doc) => (
                    <label key={doc} className="doc-item">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#0a9b8c]"
                        checked={Boolean(docChecks[doc])}
                        onChange={(event) => updateDocCheck(doc, event.target.checked)}
                      />
                      <span className="text-sm text-[#4a6580]">{doc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit">{editingApplicant ? "Update Applicant" : "Create Applicant"}</Button>
                <Button type="button" variant="outline" onClick={closeFormModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {docModalApplicant && (
        <div className="page-modal-overlay" onClick={() => setDocModalApplicant(null)}>
          <div className="page-modal max-w-md" onClick={(event) => event.stopPropagation()}>
            <h3 className="modal-title">Document Status</h3>
            <p className="modal-sub">{docModalApplicant.fullName}</p>

            <div className="mt-4 space-y-3">
              <div>
                <Label>Status</Label>
                <Select value={docModalStatus} onChange={(event) => setDocModalStatus(event.target.value)}>
                  <option value="PENDING">PENDING</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="VERIFIED">VERIFIED</option>
                </Select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={saveDocStatus}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setDocModalApplicant(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
