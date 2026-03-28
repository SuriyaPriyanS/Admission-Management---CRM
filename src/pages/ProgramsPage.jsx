import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { loadMastersThunk } from "../features/data/dataSlice";
import { api, readError } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";

const courseTypes = ["UG", "PG"];
const entryTypes = ["REGULAR", "LATERAL"];
const admissionModes = ["GOVERNMENT", "MANAGEMENT"];

export function ProgramsPage() {
  const dispatch = useAppDispatch();
  const departments = useAppSelector((state) => state.data.departments);
  const programs = useAppSelector((state) => state.data.programs);

  const [editingProgram, setEditingProgram] = useState(null);
  const departmentOptions = departments
    .map((dept) => ({
      value: dept?._id || dept?.id || "",
      label: `${dept?.name || "Department"}${dept?.code ? ` (${dept.code})` : ""}`,
    }))
    .filter((dept) => Boolean(dept.value));

  const form = useForm({
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

  useEffect(() => {
    dispatch(loadMastersThunk());
  }, [dispatch]);

  useEffect(() => {
    const selectedDepartment = form.getValues("departmentId");
    if (!editingProgram && !selectedDepartment && departmentOptions.length > 0) {
      form.setValue("departmentId", departmentOptions[0].value, { shouldValidate: true });
    }
  }, [departmentOptions, editingProgram, form]);

  async function refresh() {
    await dispatch(loadMastersThunk());
  }

  function notify(message, type = "success") {
    dispatch(showMessage({ message, type }));
  }

  async function onSubmit(values) {
    if (!values.departmentId) {
      notify("Please select a department before creating program.", "error");
      return;
    }

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

    try {
      if (editingProgram) {
        await api.put(`/masters/programs/${editingProgram._id}`, payload);
        notify("Program updated");
      } else {
        await api.post("/masters/programs", payload);
        notify("Program created");
      }

      setEditingProgram(null);
      form.reset({
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
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  async function onDelete(id) {
    try {
      await api.delete(`/masters/programs/${id}`);
      notify("Program deleted");
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  function onEdit(program) {
    setEditingProgram(program);
    const kcet = program.quotas?.find((q) => q.quotaType === "KCET")?.seats || 0;
    const comedk = program.quotas?.find((q) => q.quotaType === "COMEDK")?.seats || 0;
    const management = program.quotas?.find((q) => q.quotaType === "MANAGEMENT")?.seats || 0;

    form.reset({
      departmentId: program.departmentId?._id || program.departmentId,
      name: program.name,
      code: program.code,
      academicYear: program.academicYear,
      courseType: program.courseType,
      entryType: program.entryType,
      admissionMode: program.admissionMode,
      totalIntake: program.totalIntake,
      supernumerarySeats: program.supernumerarySeats || 0,
      kcetSeats: kcet,
      comedkSeats: comedk,
      managementSeats: management,
    });
  }

  return (
    <section className="grid gap-4 xl:grid-cols-[420px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>{editingProgram ? "Edit Program" : "Add Program"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <Label>Department</Label>
              <Select {...form.register("departmentId", { required: true })}>
                {departmentOptions.length > 0 ? (
                  departmentOptions.map((dept) => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))
                ) : (
                  <option value="">No departments available</option>
                )}
              </Select>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Program Name</Label>
                <Input {...form.register("name", { required: true })} />
              </div>
              <div>
                <Label>Program Code</Label>
                <Input {...form.register("code", { required: true })} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Academic Year</Label>
                <Input {...form.register("academicYear", { required: true })} />
              </div>
              <div>
                <Label>Total Intake</Label>
                <Input type="number" {...form.register("totalIntake", { required: true })} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <Label>Course Type</Label>
                <Select {...form.register("courseType")}>
                  {courseTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </div>
              <div>
                <Label>Entry Type</Label>
                <Select {...form.register("entryType")}>
                  {entryTypes.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </div>
              <div>
                <Label>Admission Mode</Label>
                <Select {...form.register("admissionMode")}>
                  {admissionModes.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>KCET Seats</Label>
                <Input type="number" {...form.register("kcetSeats", { required: true })} />
              </div>
              <div>
                <Label>COMEDK Seats</Label>
                <Input type="number" {...form.register("comedkSeats", { required: true })} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label>Management Seats</Label>
                <Input type="number" {...form.register("managementSeats", { required: true })} />
              </div>
              <div>
                <Label>Supernumerary Seats</Label>
                <Input type="number" {...form.register("supernumerarySeats")} />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">{editingProgram ? "Update" : "Save"} Program</Button>
              {editingProgram && (
                <Button type="button" variant="outline" onClick={() => {
                  setEditingProgram(null);
                  form.reset();
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
          <CardTitle>Programs & Intake</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Code</th>
                <th className="py-2">Program</th>
                <th className="py-2">Dept</th>
                <th className="py-2">Intake</th>
                <th className="py-2">Year</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((program) => (
                <tr key={program._id} className="border-b border-border/70">
                  <td className="py-2 mono">{program.code}</td>
                  <td className="py-2">{program.name}</td>
                  <td className="py-2">
                    <Badge>{program?.departmentId?.code || "DEPT"}</Badge>
                  </td>
                  <td className="py-2 font-semibold">{program.totalIntake}</td>
                  <td className="py-2">{program.academicYear}</td>
                  <td className="py-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(program)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => onDelete(program._id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">No programs configured yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
