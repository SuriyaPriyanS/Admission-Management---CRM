import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import { Textarea } from "./ui/textarea";

const categories = ["GM", "SC", "ST", "OBC", "EWS"];
const entryTypes = ["REGULAR", "LATERAL"];
const quotaTypes = ["KCET", "COMEDK", "MANAGEMENT"];
const admissionModes = ["GOVERNMENT", "MANAGEMENT"];
const docStatuses = ["PENDING", "SUBMITTED", "VERIFIED"];

export function ApplicantsView({ applicants, actions }) {
  const [editingApplicant, setEditingApplicant] = useState(null);
  const form = useForm({
    defaultValues: {
      applicationNo: "",
      fullName: "",
      email: "",
      phone: "",
      gender: "MALE",
      dateOfBirth: "",
      category: "GM",
      entryType: "REGULAR",
      quotaType: "KCET",
      admissionMode: "GOVERNMENT",
      qualifyingExam: "12th Board",
      marks: 75,
      documentsStatus: "PENDING",
      address: "",
      isJkCandidate: false,
    },
  });

  async function submitApplicant(values) {
    try {
      if (editingApplicant) {
        await api.put(`/applicants/${editingApplicant._id}`, { ...values, marks: Number(values.marks) });
        actions.showSuccess("Applicant updated.");
        setEditingApplicant(null);
      } else {
        await api.post("/applicants", { ...values, marks: Number(values.marks) });
        actions.showSuccess("Applicant created.");
      }
      form.reset({
        applicationNo: "",
        fullName: "",
        email: "",
        phone: "",
        gender: "MALE",
        dateOfBirth: "",
        category: "GM",
        entryType: "REGULAR",
        quotaType: "KCET",
        admissionMode: "GOVERNMENT",
        qualifyingExam: "12th Board",
        marks: 75,
        documentsStatus: "PENDING",
        address: "",
        isJkCandidate: false,
      });
      await Promise.all([actions.refreshApplicants(), actions.refreshDashboard()]);
    } catch (error) {
      actions.showError(error);
    }
  }

  async function deleteApplicant(id) {
    if (!confirm("Are you sure you want to delete this applicant?")) return;
    try {
      await api.delete(`/applicants/${id}`);
      await Promise.all([actions.refreshApplicants(), actions.refreshDashboard()]);
      actions.showSuccess("Applicant deleted.");
    } catch (error) {
      actions.showError(error);
    }
  }

  function editApplicant(applicant) {
    setEditingApplicant(applicant);
    form.reset({
      applicationNo: applicant.applicationNo,
      fullName: applicant.fullName,
      email: applicant.email,
      phone: applicant.phone,
      gender: applicant.gender,
      dateOfBirth: applicant.dateOfBirth?.split("T")[0] || "",
      category: applicant.category,
      entryType: applicant.entryType,
      quotaType: applicant.quotaType,
      admissionMode: applicant.admissionMode,
      qualifyingExam: applicant.qualifyingExam,
      marks: applicant.marks,
      documentsStatus: applicant.documentsStatus,
      address: applicant.address,
      isJkCandidate: applicant.isJkCandidate,
    });
  }

  async function updateDocumentStatus(applicantId, documentsStatus) {
    try {
      await api.patch(`/applicants/${applicantId}/documents`, { documentsStatus });
      await Promise.all([actions.refreshApplicants(), actions.refreshDashboard()]);
      actions.showSuccess("Document status updated.");
    } catch (error) {
      actions.showError(error);
    }
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{editingApplicant ? "Edit Applicant" : "Create Applicant"}</CardTitle>
          <CardDescription>Application form uses 15 fields as required.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(submitApplicant)}>
            <div>
              <Label>Application Number</Label>
              <Input {...form.register("applicationNo", { required: true })} />
            </div>
            <div>
              <Label>Full Name</Label>
              <Input {...form.register("fullName", { required: true })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email", { required: true })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input {...form.register("phone", { required: true })} />
            </div>
            <div>
              <Label>Gender</Label>
              <Select {...form.register("gender")}>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </Select>
            </div>
            <div>
              <Label>Date Of Birth</Label>
              <Input type="date" {...form.register("dateOfBirth", { required: true })} />
            </div>
            <div>
              <Label>Category</Label>
              <Select {...form.register("category")}>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Entry Type</Label>
              <Select {...form.register("entryType")}>
                {entryTypes.map((entryType) => (
                  <option key={entryType} value={entryType}>
                    {entryType}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Quota Type</Label>
              <Select {...form.register("quotaType")}>
                {quotaTypes.map((quota) => (
                  <option key={quota} value={quota}>
                    {quota}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Admission Mode</Label>
              <Select {...form.register("admissionMode")}>
                {admissionModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Qualifying Exam</Label>
              <Input {...form.register("qualifyingExam", { required: true })} />
            </div>
            <div>
              <Label>Marks (%)</Label>
              <Input type="number" {...form.register("marks", { required: true })} />
            </div>
            <div>
              <Label>Documents Status</Label>
              <Select {...form.register("documentsStatus")}>
                {docStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-center gap-2 pt-7">
              <input type="checkbox" {...form.register("isJkCandidate")} />
              <Label>J&K Candidate</Label>
            </div>
            <div className="md:col-span-2">
              <Label>Address</Label>
              <Textarea {...form.register("address", { required: true })} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit">{editingApplicant ? "Update" : "Create"} Applicant</Button>
              {editingApplicant && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingApplicant(null);
                  form.reset({
                    applicationNo: "",
                    fullName: "",
                    email: "",
                    phone: "",
                    gender: "MALE",
                    dateOfBirth: "",
                    category: "GM",
                    entryType: "REGULAR",
                    quotaType: "KCET",
                    admissionMode: "GOVERNMENT",
                    qualifyingExam: "12th Board",
                    marks: 75,
                    documentsStatus: "PENDING",
                    address: "",
                    isJkCandidate: false,
                  });
                }}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applicant List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {applicants.map((applicant) => (
            <div
              key={applicant._id}
              className="grid gap-2 rounded-md border border-border p-3 text-sm md:grid-cols-[2fr_1fr_1fr_auto]"
            >
              <div>
                <p className="font-semibold">{applicant.fullName}</p>
                <p className="text-muted-foreground">
                  {applicant.applicationNo} | {applicant.quotaType} | {applicant.marks}%
                </p>
              </div>
              <div>
                <Badge>{applicant.entryType}</Badge>
              </div>
              <div>
                <Select
                  value={applicant.documentsStatus}
                  onChange={(event) => updateDocumentStatus(applicant._id, event.target.value)}
                >
                  {docStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => editApplicant(applicant)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteApplicant(applicant._id)}>
                  Delete
                </Button>
                <Badge tone={applicant.documentsStatus === "VERIFIED" ? "success" : "warning"}>
                  {applicant.documentsStatus}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

