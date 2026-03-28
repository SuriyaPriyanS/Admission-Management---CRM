import { useState } from "react";
import { useForm } from "react-hook-form";
import { api, checkQuotaAvailability } from "../lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

const quotaTypes = ["KCET", "COMEDK", "MANAGEMENT", "SUPERNUMERARY"];

export function AdmissionsView({ applicants, programs, admissions, actions }) {
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [editingAdmission, setEditingAdmission] = useState(null);
  
  const form = useForm({
    defaultValues: {
      applicantId: "",
      programId: "",
      quotaType: "KCET",
      allotmentNumber: "",
    },
  });

  async function handleCheckAvailability() {
    const programId = form.getValues("programId");
    const quotaType = form.getValues("quotaType");
    
    if (!programId) {
      actions.showError(new Error("Please select a program first"));
      return;
    }

    try {
      setCheckingAvailability(true);
      const result = await checkQuotaAvailability(programId, quotaType);
      setAvailability(result);
      actions.showSuccess("Quota availability checked.");
    } catch (error) {
      actions.showError(error);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  }

  async function submitAllocation(values) {
    try {
      if (editingAdmission) {
        await api.put(`/admissions/${editingAdmission._id}`, values);
        actions.showSuccess("Admission updated.");
        setEditingAdmission(null);
      } else {
        await api.post("/admissions/allocate", values);
        actions.showSuccess("Seat allocated.");
      }
      form.reset({
        applicantId: "",
        programId: "",
        quotaType: "KCET",
        allotmentNumber: "",
      });
      await Promise.all([actions.refreshAdmissions(), actions.refreshMasters(), actions.refreshDashboard()]);
    } catch (error) {
      actions.showError(error);
    }
  }

  async function deleteAdmission(id) {
    if (!confirm("Are you sure you want to delete this admission?")) return;
    try {
      await api.delete(`/admissions/${id}`);
      await Promise.all([actions.refreshAdmissions(), actions.refreshMasters(), actions.refreshDashboard()]);
      actions.showSuccess("Admission deleted.");
    } catch (error) {
      actions.showError(error);
    }
  }

  function editAdmission(admission) {
    setEditingAdmission(admission);
    form.reset({
      applicantId: admission.applicantId?._id || "",
      programId: admission.programId?._id || "",
      quotaType: admission.quotaType,
      allotmentNumber: admission.allotmentNumber || "",
    });
  }

  async function updateFeeStatus(admissionId, feeStatus) {
    try {
      await api.patch(`/admissions/${admissionId}/fee`, { feeStatus });
      await Promise.all([actions.refreshAdmissions(), actions.refreshDashboard()]);
      actions.showSuccess("Fee status updated.");
    } catch (error) {
      actions.showError(error);
    }
  }

  async function confirmAdmission(admissionId) {
    try {
      await api.patch(`/admissions/${admissionId}/confirm`);
      await Promise.all([actions.refreshAdmissions(), actions.refreshDashboard()]);
      actions.showSuccess("Admission confirmed and number generated.");
    } catch (error) {
      actions.showError(error);
    }
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{editingAdmission ? "Edit Admission" : "Seat Allocation"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(submitAllocation)}>
            <div>
              <Label>Applicant</Label>
              <Select {...form.register("applicantId", { required: true })}>
                <option value="">Select applicant</option>
                {applicants.map((applicant) => (
                  <option key={applicant._id} value={applicant._id}>
                    {applicant.applicationNo} - {applicant.fullName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Program</Label>
              <Select {...form.register("programId", { required: true })}>
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.name} ({program.code}) - {program.academicYear}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Quota Type</Label>
              <Select {...form.register("quotaType", { required: true })}>
                {quotaTypes.map((quota) => (
                  <option key={quota} value={quota}>
                    {quota}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Allotment Number (Govt flow)</Label>
              <Input {...form.register("allotmentNumber")} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="button" variant="outline" onClick={handleCheckAvailability} disabled={checkingAvailability}>
                {checkingAvailability ? "Checking..." : "Check Availability"}
              </Button>
              <Button type="submit">{editingAdmission ? "Update" : "Allocate Seat"}</Button>
              {editingAdmission && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingAdmission(null);
                  form.reset({
                    applicantId: "",
                    programId: "",
                    quotaType: "KCET",
                    allotmentNumber: "",
                  });
                }}>
                  Cancel
                </Button>
              )}
            </div>
            {availability && (
              <div className="md:col-span-2 rounded-md border border-border p-3 text-sm">
                <p className="font-semibold">Quota Availability</p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div>
                    <span className="text-muted-foreground">Total Seats:</span> {availability.totalSeats}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Filled:</span> {availability.filled}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Remaining:</span> {availability.remaining}
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Admissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {admissions.map((admission) => (
            <div
              key={admission._id}
              className="grid gap-2 rounded-md border border-border p-3 text-sm md:grid-cols-[2fr_1fr_1fr_auto]"
            >
              <div>
                <p className="font-semibold">{admission?.applicantId?.fullName || "Applicant removed"}</p>
                <p className="text-muted-foreground">
                  {admission?.programId?.name || "Program removed"} | {admission.quotaType}
                </p>
                <p className="text-xs text-muted-foreground">
                  {admission.admissionNumber || "Admission number generates on confirmation"}
                </p>
              </div>
              <div>
                <Badge tone={admission.status === "CONFIRMED" ? "success" : "warning"}>{admission.status}</Badge>
              </div>
              <div>
                <Select
                  value={admission.feeStatus}
                  onChange={(event) => updateFeeStatus(admission._id, event.target.value)}
                  disabled={admission.status === "CONFIRMED"}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="PAID">PAID</option>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => editAdmission(admission)}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteAdmission(admission._id)}>
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => confirmAdmission(admission._id)}
                  disabled={admission.status === "CONFIRMED"}
                >
                  Confirm
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}

