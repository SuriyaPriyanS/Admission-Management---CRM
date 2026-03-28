import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import {
  loadAdmissionsThunk,
  loadApplicantsThunk,
  loadMastersThunk,
  loadDashboardThunk,
} from "../features/data/dataSlice";
import { api, checkQuotaAvailability, readError } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";

function resolvedId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
}

export function AllocationPage() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.user?.role);
  const applicants = useAppSelector((state) => state.data.applicants);
  const programs = useAppSelector((state) => state.data.programs);
  const admissions = useAppSelector((state) => state.data.admissions);

  const [govSeatInfo, setGovSeatInfo] = useState(null);
  const [mgmtSeatInfo, setMgmtSeatInfo] = useState(null);
  const [editingAdmissionId, setEditingAdmissionId] = useState("");
  const [editingAllotmentNumber, setEditingAllotmentNumber] = useState("");

  const govForm = useForm({
    defaultValues: {
      applicantId: "",
      programId: "",
      quotaType: "KCET",
      allotmentNumber: "",
    },
  });

  const mgmtForm = useForm({
    defaultValues: {
      applicantId: "",
      programId: "",
      quotaType: "MANAGEMENT",
      allotmentNumber: "",
    },
  });

  useEffect(() => {
    dispatch(loadApplicantsThunk());
    dispatch(loadMastersThunk());
    dispatch(loadAdmissionsThunk());
  }, [dispatch]);

  function notify(message, type = "success") {
    dispatch(showMessage({ message, type }));
  }

  async function refreshAll() {
    await Promise.all([
      dispatch(loadAdmissionsThunk()),
      dispatch(loadMastersThunk()),
      dispatch(loadApplicantsThunk()),
      role === "ADMIN" || role === "MANAGEMENT" ? dispatch(loadDashboardThunk()) : Promise.resolve(),
    ]);
  }

  const allocatedApplicantIds = useMemo(() => {
    const ids = new Set();
    admissions.forEach((admission) => {
      const id = resolvedId(admission.applicantId);
      if (id) ids.add(id);
    });
    return ids;
  }, [admissions]);

  const unallocatedApplicants = useMemo(
    () => applicants.filter((applicant) => !allocatedApplicantIds.has(applicant._id)),
    [applicants, allocatedApplicantIds]
  );

  const governmentApplicants = useMemo(
    () => unallocatedApplicants.filter((applicant) => applicant.quotaType === "KCET" || applicant.quotaType === "COMEDK"),
    [unallocatedApplicants]
  );

  const managementApplicants = useMemo(
    () => unallocatedApplicants.filter((applicant) => applicant.quotaType === "MANAGEMENT"),
    [unallocatedApplicants]
  );

  async function fetchSeatInfo(form, setInfo) {
    const programId = form.getValues("programId");
    const quotaType = form.getValues("quotaType");

    if (!programId || !quotaType) {
      setInfo(null);
      return;
    }

    try {
      const availability = await checkQuotaAvailability(programId, quotaType);
      setInfo(availability);
    } catch {
      setInfo(null);
    }
  }

  async function allocate(values) {
    try {
      await api.post("/admissions/allocate", values);
      notify("Seat allocated successfully");
      await refreshAll();
      setGovSeatInfo(null);
      setMgmtSeatInfo(null);
      govForm.reset({ applicantId: "", programId: "", quotaType: "KCET", allotmentNumber: "" });
      mgmtForm.reset({ applicantId: "", programId: "", quotaType: "MANAGEMENT", allotmentNumber: "" });
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  function startAdmissionEdit(admission) {
    setEditingAdmissionId(admission._id);
    setEditingAllotmentNumber(admission.allotmentNumber || "");
  }

  function cancelAdmissionEdit() {
    setEditingAdmissionId("");
    setEditingAllotmentNumber("");
  }

  async function saveAdmissionEdit(admissionId) {
    try {
      await api.put(`/admissions/${admissionId}`, {
        allotmentNumber: editingAllotmentNumber,
      });
      notify("Allocation updated");
      cancelAdmissionEdit();
      await refreshAll();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  async function deleteAllocation(admissionId) {
    if (!confirm("Delete this allocation? This will release the seat counter.")) {
      return;
    }

    try {
      await api.delete(`/admissions/${admissionId}`);
      notify("Allocation deleted and seat released");
      cancelAdmissionEdit();
      await refreshAll();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Government Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={govForm.handleSubmit(allocate)}>
              <div>
                <Label>Applicant</Label>
                <Select {...govForm.register("applicantId", { required: true })} onChange={(event) => {
                  const applicant = governmentApplicants.find((item) => item._id === event.target.value);
                  govForm.setValue("quotaType", applicant?.quotaType || "KCET");
                }}>
                  <option value="">Select applicant</option>
                  {governmentApplicants.map((applicant) => (
                    <option key={applicant._id} value={applicant._id}>
                      {applicant.applicationNo} - {applicant.fullName} ({applicant.quotaType})
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Program</Label>
                <Select {...govForm.register("programId", { required: true })}>
                  <option value="">Select program</option>
                  {programs.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.code} - {program.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Quota</Label>
                <Select {...govForm.register("quotaType")}> 
                  <option value="KCET">KCET</option>
                  <option value="COMEDK">COMEDK</option>
                </Select>
              </div>
              <div>
                <Label>Allotment Number</Label>
                <Input {...govForm.register("allotmentNumber", { required: true })} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => fetchSeatInfo(govForm, setGovSeatInfo)}>
                  Check Seats
                </Button>
                <Button type="submit">Allocate Seat</Button>
              </div>
              {govSeatInfo && (
                <div className="rounded-md border border-border bg-secondary p-3 text-sm">
                  Remaining: <span className={govSeatInfo.available ? "text-green-700" : "text-red-600"}>{govSeatInfo.remaining}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Management Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={mgmtForm.handleSubmit(allocate)}>
              <div>
                <Label>Applicant</Label>
                <Select {...mgmtForm.register("applicantId", { required: true })}>
                  <option value="">Select applicant</option>
                  {managementApplicants.map((applicant) => (
                    <option key={applicant._id} value={applicant._id}>
                      {applicant.applicationNo} - {applicant.fullName}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Program</Label>
                <Select {...mgmtForm.register("programId", { required: true })}>
                  <option value="">Select program</option>
                  {programs.map((program) => (
                    <option key={program._id} value={program._id}>
                      {program.code} - {program.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Quota</Label>
                <Select {...mgmtForm.register("quotaType")}> 
                  <option value="MANAGEMENT">MANAGEMENT</option>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => fetchSeatInfo(mgmtForm, setMgmtSeatInfo)}>
                  Check Seats
                </Button>
                <Button type="submit">Allocate Seat</Button>
              </div>
              {mgmtSeatInfo && (
                <div className="rounded-md border border-border bg-secondary p-3 text-sm">
                  Remaining: <span className={mgmtSeatInfo.available ? "text-green-700" : "text-red-600"}>{mgmtSeatInfo.remaining}</span>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Allocated Seats</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Applicant</th>
                <th className="py-2">Program</th>
                <th className="py-2">Quota</th>
                <th className="py-2">Allotment No</th>
                <th className="py-2">Status</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((admission) => (
                <tr key={admission._id} className="border-b border-border/70">
                  <td className="py-2">{admission?.applicantId?.fullName || "Applicant"}</td>
                  <td className="py-2">{admission?.programId?.name || "Program"}</td>
                  <td className="py-2"><Badge>{admission.quotaType}</Badge></td>
                  <td className="py-2 mono">
                    {editingAdmissionId === admission._id ? (
                      <Input
                        value={editingAllotmentNumber}
                        onChange={(event) => setEditingAllotmentNumber(event.target.value)}
                        placeholder="Allotment number"
                      />
                    ) : (
                      admission.allotmentNumber || "-"
                    )}
                  </td>
                  <td className="py-2"><Badge tone={admission.status === "CONFIRMED" ? "success" : "warning"}>{admission.status}</Badge></td>
                  <td className="py-2">
                    {admission.status === "CONFIRMED" ? (
                      <span className="text-xs text-muted-foreground">Locked</span>
                    ) : editingAdmissionId === admission._id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveAdmissionEdit(admission._id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelAdmissionEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => startAdmissionEdit(admission)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteAllocation(admission._id)}>
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {admissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No allocations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
