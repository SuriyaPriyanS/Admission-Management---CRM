import { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "../lib/api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";

const courseTypes = ["UG", "PG"];
const entryTypes = ["REGULAR", "LATERAL"];
const admissionModes = ["GOVERNMENT", "MANAGEMENT"];

export function MastersView({ institutions, campuses, departments, programs, actions }) {
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [editingCampus, setEditingCampus] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingProgram, setEditingProgram] = useState(null);
  const institutionForm = useForm({
    defaultValues: { code: "", name: "", jkCapLimit: 0 },
  });
  const campusForm = useForm({
    defaultValues: { institutionId: "", name: "" },
  });
  const departmentForm = useForm({
    defaultValues: { campusId: "", name: "", code: "" },
  });
  const programForm = useForm({
    defaultValues: {
      departmentId: "",
      name: "",
      code: "",
      academicYear: "2026-27",
      courseType: "UG",
      entryType: "REGULAR",
      admissionMode: "GOVERNMENT",
      totalIntake: 100,
      kcetSeats: 40,
      comedkSeats: 30,
      managementSeats: 30,
      supernumerarySeats: 0,
    },
  });

  async function submitInstitution(values) {
    try {
      if (editingInstitution) {
        await api.put(`/masters/institutions/${editingInstitution._id}`, { ...values, jkCapLimit: Number(values.jkCapLimit || 0) });
        actions.showSuccess("Institution updated.");
        setEditingInstitution(null);
      } else {
        await api.post("/masters/institutions", { ...values, jkCapLimit: Number(values.jkCapLimit || 0) });
        actions.showSuccess("Institution created.");
      }
      institutionForm.reset({ code: "", name: "", jkCapLimit: 0 });
      await actions.refreshMasters();
      await actions.refreshDashboard();
    } catch (error) {
      actions.showError(error);
    }
  }

  async function deleteInstitution(id) {
    if (!confirm("Are you sure you want to delete this institution?")) return;
    try {
      await api.delete(`/masters/institutions/${id}`);
      await actions.refreshMasters();
      await actions.refreshDashboard();
      actions.showSuccess("Institution deleted.");
    } catch (error) {
      actions.showError(error);
    }
  }

  function editInstitution(institution) {
    setEditingInstitution(institution);
    institutionForm.reset({
      code: institution.code,
      name: institution.name,
      jkCapLimit: institution.jkCapLimit || 0,
    });
  }

  async function submitCampus(values) {
    try {
      if (editingCampus) {
        await api.put(`/masters/campuses/${editingCampus._id}`, values);
        actions.showSuccess("Campus updated.");
        setEditingCampus(null);
      } else {
        await api.post("/masters/campuses", values);
        actions.showSuccess("Campus created.");
      }
      campusForm.reset({ institutionId: "", name: "" });
      await actions.refreshMasters();
    } catch (error) {
      actions.showError(error);
    }
  }

  async function deleteCampus(id) {
    if (!confirm("Are you sure you want to delete this campus?")) return;
    try {
      await api.delete(`/masters/campuses/${id}`);
      await actions.refreshMasters();
      actions.showSuccess("Campus deleted.");
    } catch (error) {
      actions.showError(error);
    }
  }

  function editCampus(campus) {
    setEditingCampus(campus);
    campusForm.reset({
      institutionId: campus.institutionId,
      name: campus.name,
    });
  }

  async function submitDepartment(values) {
    try {
      if (editingDepartment) {
        await api.put(`/masters/departments/${editingDepartment._id}`, values);
        actions.showSuccess("Department updated.");
        setEditingDepartment(null);
      } else {
        await api.post("/masters/departments", values);
        actions.showSuccess("Department created.");
      }
      departmentForm.reset({ campusId: "", name: "", code: "" });
      await actions.refreshMasters();
    } catch (error) {
      actions.showError(error);
    }
  }

  async function deleteDepartment(id) {
    if (!confirm("Are you sure you want to delete this department?")) return;
    try {
      await api.delete(`/masters/departments/${id}`);
      await actions.refreshMasters();
      actions.showSuccess("Department deleted.");
    } catch (error) {
      actions.showError(error);
    }
  }

  function editDepartment(department) {
    setEditingDepartment(department);
    departmentForm.reset({
      campusId: department.campusId,
      name: department.name,
      code: department.code,
    });
  }

  async function submitProgram(values) {
    try {
      const payload = {
        departmentId: values.departmentId,
        name: values.name,
        code: values.code,
        academicYear: values.academicYear,
        courseType: values.courseType,
        entryType: values.entryType,
        admissionMode: values.admissionMode,
        totalIntake: Number(values.totalIntake),
        supernumerarySeats: Number(values.supernumerarySeats || 0),
        quotas: [
          { quotaType: "KCET", seats: Number(values.kcetSeats || 0) },
          { quotaType: "COMEDK", seats: Number(values.comedkSeats || 0) },
          { quotaType: "MANAGEMENT", seats: Number(values.managementSeats || 0) },
        ],
      };

      if (editingProgram) {
        await api.put(`/masters/programs/${editingProgram._id}`, payload);
        actions.showSuccess("Program updated.");
        setEditingProgram(null);
      } else {
        await api.post("/masters/programs", payload);
        actions.showSuccess("Program and seat matrix created.");
      }
      programForm.reset({
        departmentId: "",
        name: "",
        code: "",
        academicYear: "2026-27",
        courseType: "UG",
        entryType: "REGULAR",
        admissionMode: "GOVERNMENT",
        totalIntake: 100,
        kcetSeats: 40,
        comedkSeats: 30,
        managementSeats: 30,
        supernumerarySeats: 0,
      });
      await Promise.all([actions.refreshMasters(), actions.refreshDashboard()]);
    } catch (error) {
      actions.showError(error);
    }
  }

  async function deleteProgram(id) {
    if (!confirm("Are you sure you want to delete this program?")) return;
    try {
      await api.delete(`/masters/programs/${id}`);
      await Promise.all([actions.refreshMasters(), actions.refreshDashboard()]);
      actions.showSuccess("Program deleted.");
    } catch (error) {
      actions.showError(error);
    }
  }

  function editProgram(program) {
    setEditingProgram(program);
    const kcetQuota = program.quotas?.find((q) => q.quotaType === "KCET");
    const comedkQuota = program.quotas?.find((q) => q.quotaType === "COMEDK");
    const managementQuota = program.quotas?.find((q) => q.quotaType === "MANAGEMENT");
    programForm.reset({
      departmentId: program.departmentId,
      name: program.name,
      code: program.code,
      academicYear: program.academicYear,
      courseType: program.courseType,
      entryType: program.entryType,
      admissionMode: program.admissionMode,
      totalIntake: program.totalIntake,
      supernumerarySeats: program.supernumerarySeats || 0,
      kcetSeats: kcetQuota?.seats || 0,
      comedkSeats: comedkQuota?.seats || 0,
      managementSeats: managementQuota?.seats || 0,
    });
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editingInstitution ? "Edit Institution" : "Create Institution"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={institutionForm.handleSubmit(submitInstitution)}>
              <div>
                <Label>Institution Code</Label>
                <Input {...institutionForm.register("code", { required: true })} />
              </div>
              <div>
                <Label>Institution Name</Label>
                <Input {...institutionForm.register("name", { required: true })} />
              </div>
              <div>
                <Label>J&K Cap Limit (optional)</Label>
                <Input type="number" {...institutionForm.register("jkCapLimit")} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingInstitution ? "Update" : "Save"} Institution</Button>
                {editingInstitution && (
                  <Button type="button" variant="outline" onClick={() => {
                    setEditingInstitution(null);
                    institutionForm.reset({ code: "", name: "", jkCapLimit: 0 });
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
            <CardTitle>{editingCampus ? "Edit Campus" : "Create Campus"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={campusForm.handleSubmit(submitCampus)}>
              <div>
                <Label>Institution</Label>
                <Select {...campusForm.register("institutionId", { required: true })}>
                  <option value="">Select institution</option>
                  {institutions.map((inst) => (
                    <option key={inst._id} value={inst._id}>
                      {inst.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Campus Name</Label>
                <Input {...campusForm.register("name", { required: true })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingCampus ? "Update" : "Save"} Campus</Button>
                {editingCampus && (
                  <Button type="button" variant="outline" onClick={() => {
                    setEditingCampus(null);
                    campusForm.reset({ institutionId: "", name: "" });
                  }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{editingDepartment ? "Edit Department" : "Create Department"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={departmentForm.handleSubmit(submitDepartment)}>
              <div>
                <Label>Campus</Label>
                <Select {...departmentForm.register("campusId", { required: true })}>
                  <option value="">Select campus</option>
                  {campuses.map((campus) => (
                    <option key={campus._id} value={campus._id}>
                      {campus.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Department Name</Label>
                <Input {...departmentForm.register("name", { required: true })} />
              </div>
              <div>
                <Label>Department Code</Label>
                <Input {...departmentForm.register("code", { required: true })} />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingDepartment ? "Update" : "Save"} Department</Button>
                {editingDepartment && (
                  <Button type="button" variant="outline" onClick={() => {
                    setEditingDepartment(null);
                    departmentForm.reset({ campusId: "", name: "", code: "" });
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
            <CardTitle>{editingProgram ? "Edit Program & Seat Matrix" : "Create Program & Seat Matrix"}</CardTitle>
            <CardDescription>Base quota total must equal intake.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={programForm.handleSubmit(submitProgram)}>
              <div>
                <Label>Department</Label>
                <Select {...programForm.register("departmentId", { required: true })}>
                  <option value="">Select department</option>
                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.name} ({department.code})
                    </option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Program Name</Label>
                  <Input {...programForm.register("name", { required: true })} />
                </div>
                <div>
                  <Label>Program Code</Label>
                  <Input {...programForm.register("code", { required: true })} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Academic Year (YYYY-YY)</Label>
                  <Input {...programForm.register("academicYear", { required: true })} />
                </div>
                <div>
                  <Label>Total Intake</Label>
                  <Input type="number" {...programForm.register("totalIntake", { required: true })} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Label>Course Type</Label>
                  <Select {...programForm.register("courseType")}>
                    {courseTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Entry Type</Label>
                  <Select {...programForm.register("entryType")}>
                    {entryTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Admission Mode</Label>
                  <Select {...programForm.register("admissionMode")}>
                    {admissionModes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>KCET Seats</Label>
                  <Input type="number" {...programForm.register("kcetSeats", { required: true })} />
                </div>
                <div>
                  <Label>COMEDK Seats</Label>
                  <Input type="number" {...programForm.register("comedkSeats", { required: true })} />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Management Seats</Label>
                  <Input type="number" {...programForm.register("managementSeats", { required: true })} />
                </div>
                <div>
                  <Label>Supernumerary Seats</Label>
                  <Input type="number" {...programForm.register("supernumerarySeats")} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingProgram ? "Update" : "Save"} Program</Button>
                {editingProgram && (
                  <Button type="button" variant="outline" onClick={() => {
                    setEditingProgram(null);
                    programForm.reset({
                      departmentId: "",
                      name: "",
                      code: "",
                      academicYear: "2026-27",
                      courseType: "UG",
                      entryType: "REGULAR",
                      admissionMode: "GOVERNMENT",
                      totalIntake: 100,
                      kcetSeats: 40,
                      comedkSeats: 30,
                      managementSeats: 30,
                      supernumerarySeats: 0,
                    });
                  }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Programs Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Program</th>
                <th className="py-2">Year</th>
                <th className="py-2">Intake</th>
                <th className="py-2">Quotas (filled/seats)</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program._id} className="border-b border-border/60">
                  <td className="py-2">
                    {program.name} ({program.code})
                  </td>
                  <td className="py-2">{program.academicYear}</td>
                  <td className="py-2">{program.totalIntake}</td>
                  <td className="py-2">
                    <div className="flex flex-wrap gap-2">
                      {(program.quotas || []).map((quota) => (
                        <Badge key={`${program._id}-${quota.quotaType}`}>
                          {quota.quotaType}: {quota.filled}/{quota.seats}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => editProgram(program)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteProgram(program._id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}

