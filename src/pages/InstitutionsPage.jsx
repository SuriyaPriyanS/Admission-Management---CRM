import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { loadMastersThunk } from "../features/data/dataSlice";
import { api, readError } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Badge } from "../components/ui/badge";

const YEAR_STORAGE_KEY = "edumerge_academic_years";

function loadStoredYears() {
  try {
    const raw = localStorage.getItem(YEAR_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function InstitutionsPage() {
  const dispatch = useAppDispatch();
  const institutions = useAppSelector((state) => state.data.institutions);
  const campuses = useAppSelector((state) => state.data.campuses);
  const departments = useAppSelector((state) => state.data.departments);

  const [activeTab, setActiveTab] = useState("institutions");
  const [editingInstitution, setEditingInstitution] = useState(null);
  const [editingCampus, setEditingCampus] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingYearId, setEditingYearId] = useState("");
  const [years, setYears] = useState(loadStoredYears);

  const institutionForm = useForm({ defaultValues: { code: "", name: "", jkCapLimit: 0 } });
  const campusForm = useForm({ defaultValues: { institutionId: "", name: "" } });
  const departmentForm = useForm({ defaultValues: { campusId: "", name: "", code: "" } });
  const yearForm = useForm({ defaultValues: { value: "", status: "ACTIVE" } });

  useEffect(() => {
    dispatch(loadMastersThunk());
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem(YEAR_STORAGE_KEY, JSON.stringify(years));
  }, [years]);

  async function refresh() {
    await dispatch(loadMastersThunk());
  }

  function pushMessage(message, type = "success") {
    dispatch(showMessage({ message, type }));
  }

  async function saveInstitution(values) {
    try {
      if (editingInstitution) {
        await api.put(`/masters/institutions/${editingInstitution._id}`, values);
        pushMessage("Institution updated");
      } else {
        await api.post("/masters/institutions", values);
        pushMessage("Institution created");
      }
      setEditingInstitution(null);
      institutionForm.reset({ code: "", name: "", jkCapLimit: 0 });
      await refresh();
    } catch (error) {
      pushMessage(readError(error), "error");
    }
  }

  async function removeInstitution(id) {
    try {
      await api.delete(`/masters/institutions/${id}`);
      pushMessage("Institution deleted");
      await refresh();
    } catch (error) {
      pushMessage(readError(error), "error");
    }
  }

  async function saveCampus(values) {
    try {
      if (editingCampus) {
        await api.put(`/masters/campuses/${editingCampus._id}`, values);
        pushMessage("Campus updated");
      } else {
        await api.post("/masters/campuses", values);
        pushMessage("Campus created");
      }
      setEditingCampus(null);
      campusForm.reset({ institutionId: "", name: "" });
      await refresh();
    } catch (error) {
      pushMessage(readError(error), "error");
    }
  }

  async function removeCampus(id) {
    try {
      await api.delete(`/masters/campuses/${id}`);
      pushMessage("Campus deleted");
      await refresh();
    } catch (error) {
      pushMessage(readError(error), "error");
    }
  }

  async function saveDepartment(values) {
    try {
      if (editingDepartment) {
        await api.put(`/masters/departments/${editingDepartment._id}`, values);
        pushMessage("Department updated");
      } else {
        await api.post("/masters/departments", values);
        pushMessage("Department created");
      }
      setEditingDepartment(null);
      departmentForm.reset({ campusId: "", name: "", code: "" });
      await refresh();
    } catch (error) {
      pushMessage(readError(error), "error");
    }
  }

  async function removeDepartment(id) {
    try {
      await api.delete(`/masters/departments/${id}`);
      pushMessage("Department deleted");
      await refresh();
    } catch (error) {
      pushMessage(readError(error), "error");
    }
  }

  function saveYear(values) {
    if (editingYearId) {
      setYears((prev) =>
        prev.map((year) =>
          year.id === editingYearId ? { ...year, value: values.value, status: values.status } : year
        )
      );
      setEditingYearId("");
      yearForm.reset({ value: "", status: "ACTIVE" });
      pushMessage("Academic year updated");
      return;
    }

    const entry = {
      id: crypto.randomUUID(),
      value: values.value,
      status: values.status,
    };
    setYears((prev) => [entry, ...prev]);
    yearForm.reset({ value: "", status: "ACTIVE" });
    pushMessage("Academic year added");
  }

  function removeYear(id) {
    setYears((prev) => prev.filter((item) => item.id !== id));
    pushMessage("Academic year removed", "success");
  }

  function editYear(year) {
    setEditingYearId(year.id);
    yearForm.reset({
      value: year.value,
      status: year.status,
    });
  }

  function cancelYearEdit() {
    setEditingYearId("");
    yearForm.reset({ value: "", status: "ACTIVE" });
  }

  const campusLookup = useMemo(() => new Map(campuses.map((c) => [c._id, c.name])), [campuses]);
  const institutionLookup = useMemo(
    () => new Map(institutions.map((i) => [i._id, i.name])),
    [institutions]
  );

  return (
    <section className="space-y-4">
      <div className="rounded-lg bg-card p-4 shadow-warm">
        <div className="mb-4 border-b border-border pb-2">
          <div className="flex flex-wrap gap-2">
            {[
              ["institutions", "Institutions"],
              ["campuses", "Campuses"],
              ["departments", "Departments"],
              ["years", "Academic Years"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`rounded-md px-3 py-2 text-sm ${
                  activeTab === key
                    ? "border border-primary/30 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "institutions" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingInstitution ? "Edit Institution" : "Add Institution"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={institutionForm.handleSubmit(saveInstitution)}>
                  <div>
                    <Label>Code</Label>
                    <Input {...institutionForm.register("code", { required: true })} />
                  </div>
                  <div>
                    <Label>Name</Label>
                    <Input {...institutionForm.register("name", { required: true })} />
                  </div>
                  <div>
                    <Label>J&K Cap Limit</Label>
                    <Input type="number" {...institutionForm.register("jkCapLimit")} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingInstitution ? "Update" : "Save"}</Button>
                    {editingInstitution && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingInstitution(null);
                          institutionForm.reset({ code: "", name: "", jkCapLimit: 0 });
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Institutions List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {institutions.map((inst) => (
                  <div key={inst._id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                    <div>
                      <p className="font-semibold">{inst.name}</p>
                      <p className="text-xs text-muted-foreground mono">{inst.code}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>{inst.jkCapLimit || 0} cap</Badge>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingInstitution(inst);
                        institutionForm.reset({
                          code: inst.code,
                          name: inst.name,
                          jkCapLimit: inst.jkCapLimit || 0,
                        });
                      }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeInstitution(inst._id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "campuses" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingCampus ? "Edit Campus" : "Add Campus"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={campusForm.handleSubmit(saveCampus)}>
                  <div>
                    <Label>Institution</Label>
                    <Select {...campusForm.register("institutionId", { required: true })}>
                      <option value="">Select institution</option>
                      {institutions.map((inst) => (
                        <option key={inst._id} value={inst._id}>{inst.name}</option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Campus Name</Label>
                    <Input {...campusForm.register("name", { required: true })} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingCampus ? "Update" : "Save"}</Button>
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

            <Card>
              <CardHeader>
                <CardTitle>Campuses List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {campuses.map((campus) => (
                  <div key={campus._id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                    <div>
                      <p className="font-semibold">{campus.name}</p>
                      <p className="text-xs text-muted-foreground">{institutionLookup.get(campus.institutionId) || "Institution"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingCampus(campus);
                        campusForm.reset({ institutionId: campus.institutionId, name: campus.name });
                      }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeCampus(campus._id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingDepartment ? "Edit Department" : "Add Department"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={departmentForm.handleSubmit(saveDepartment)}>
                  <div>
                    <Label>Campus</Label>
                    <Select {...departmentForm.register("campusId", { required: true })}>
                      <option value="">Select campus</option>
                      {campuses.map((campus) => (
                        <option key={campus._id} value={campus._id}>{campus.name}</option>
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
                    <Button type="submit">{editingDepartment ? "Update" : "Save"}</Button>
                    {editingDepartment && (
                      <Button type="button" variant="outline" onClick={() => {
                        setEditingDepartment(null);
                        departmentForm.reset({ campusId: "", name: "", code: "" });
                      }}>Cancel</Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Departments List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {departments.map((department) => (
                  <div key={department._id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                    <div>
                      <p className="font-semibold">{department.name}</p>
                      <p className="text-xs text-muted-foreground">{campusLookup.get(department.campusId) || "Campus"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingDepartment(department);
                        departmentForm.reset({
                          campusId: department.campusId,
                          name: department.name,
                          code: department.code,
                        });
                      }}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeDepartment(department._id)}>Delete</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "years" && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{editingYearId ? "Edit Academic Year" : "Add Academic Year"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-3" onSubmit={yearForm.handleSubmit(saveYear)}>
                  <div>
                    <Label>Academic Year</Label>
                    <Input placeholder="2026-27" {...yearForm.register("value", { required: true })} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select {...yearForm.register("status")}>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">{editingYearId ? "Update" : "Save"} Academic Year</Button>
                    {editingYearId && (
                      <Button type="button" variant="outline" onClick={cancelYearEdit}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Academic Years</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {years.map((year) => (
                  <div key={year.id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                    <span className="mono">{year.value}</span>
                    <div className="flex items-center gap-2">
                      <Badge tone={year.status === "ACTIVE" ? "success" : year.status === "UPCOMING" ? "warning" : "default"}>
                        {year.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => editYear(year)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => removeYear(year.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
                {years.length === 0 && <p className="text-sm text-muted-foreground">No years configured yet.</p>}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}
