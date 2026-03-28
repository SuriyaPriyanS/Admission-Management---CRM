import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { loadMastersThunk } from "../features/data/dataSlice";
import { api, readError } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";

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
  const [activeModal, setActiveModal] = useState("");
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

  function notify(message, type = "success") {
    dispatch(showMessage({ message, type }));
  }

  function openModal(name) {
    setActiveModal(name);
  }

  function closeModal() {
    setActiveModal("");
  }

  function openInstitutionModal(institution = null) {
    setEditingInstitution(institution);
    institutionForm.reset({
      code: institution?.code || "",
      name: institution?.name || "",
      jkCapLimit: institution?.jkCapLimit || 0,
    });
    openModal("institution");
  }

  function openCampusModal(campus = null) {
    setEditingCampus(campus);
    campusForm.reset({
      institutionId: campus?.institutionId || "",
      name: campus?.name || "",
    });
    openModal("campus");
  }

  function openDepartmentModal(department = null) {
    setEditingDepartment(department);
    departmentForm.reset({
      campusId: department?.campusId || "",
      name: department?.name || "",
      code: department?.code || "",
    });
    openModal("department");
  }

  function openYearModal(year = null) {
    setEditingYearId(year?.id || "");
    yearForm.reset({
      value: year?.value || "",
      status: year?.status || "ACTIVE",
    });
    openModal("year");
  }

  async function saveInstitution(values) {
    try {
      if (editingInstitution) {
        await api.put(`/masters/institutions/${editingInstitution._id}`, values);
        notify("Institution updated");
      } else {
        await api.post("/masters/institutions", values);
        notify("Institution created");
      }
      closeModal();
      setEditingInstitution(null);
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  async function deleteInstitution(id) {
    if (!confirm("Delete this institution?")) return;

    try {
      await api.delete(`/masters/institutions/${id}`);
      notify("Institution deleted");
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  async function saveCampus(values) {
    try {
      if (editingCampus) {
        await api.put(`/masters/campuses/${editingCampus._id}`, values);
        notify("Campus updated");
      } else {
        await api.post("/masters/campuses", values);
        notify("Campus created");
      }
      closeModal();
      setEditingCampus(null);
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  async function deleteCampus(id) {
    if (!confirm("Delete this campus?")) return;

    try {
      await api.delete(`/masters/campuses/${id}`);
      notify("Campus deleted");
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  async function saveDepartment(values) {
    try {
      if (editingDepartment) {
        await api.put(`/masters/departments/${editingDepartment._id}`, values);
        notify("Department updated");
      } else {
        await api.post("/masters/departments", values);
        notify("Department created");
      }
      closeModal();
      setEditingDepartment(null);
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  async function deleteDepartment(id) {
    if (!confirm("Delete this department?")) return;

    try {
      await api.delete(`/masters/departments/${id}`);
      notify("Department deleted");
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  function saveYear(values) {
    if (editingYearId) {
      setYears((prev) =>
        prev.map((year) =>
          year.id === editingYearId ? { ...year, value: values.value, status: values.status } : year
        )
      );
      notify("Academic year updated");
    } else {
      setYears((prev) => [
        { id: crypto.randomUUID(), value: values.value, status: values.status },
        ...prev,
      ]);
      notify("Academic year added");
    }

    closeModal();
    setEditingYearId("");
    yearForm.reset({ value: "", status: "ACTIVE" });
  }

  function deleteYear(id) {
    if (!confirm("Delete this academic year?")) return;

    setYears((prev) => prev.filter((item) => item.id !== id));
    notify("Academic year deleted");
  }

  const institutionLookup = useMemo(
    () => new Map(institutions.map((institution) => [institution._id, institution.name])),
    [institutions]
  );

  const campusLookup = useMemo(
    () => new Map(campuses.map((campus) => [campus._id, campus.name])),
    [campuses]
  );

  return (
    <section className="space-y-5">
      <div className="section-header">
        <div>
          <h2 className="text-[26px] font-extrabold leading-none text-[#0d2333]">Institutions Setup</h2>
          <p className="mt-2 text-[13px] text-[#8fa8c0]">Manage institutions, campuses and departments</p>
        </div>
        <Button className="h-10 w-full px-4 sm:w-auto sm:px-6" onClick={() => openInstitutionModal()}>
          + Add Institution
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-4 border-b border-border">
          <div className="flex gap-2 overflow-x-auto pb-1">
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
                className={`whitespace-nowrap rounded-md px-4 py-2 text-sm ${
                  activeTab === key
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "institutions" && (
          <div className="space-y-3">
            <Button variant="outline" onClick={() => openInstitutionModal()}>
              + Add Institution
            </Button>
            <div className="table-wrap">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="py-3 text-left">Code</th>
                    <th className="py-3 text-left">Institution Name</th>
                    <th className="py-3 text-left">J&K Cap</th>
                    <th className="py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {institutions.map((institution) => (
                    <tr key={institution._id} className="border-b border-border/80">
                      <td className="py-3 font-semibold">{institution.code}</td>
                      <td className="py-3">{institution.name}</td>
                      <td className="py-3">
                        <Badge>{institution.jkCapLimit || 0}</Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openInstitutionModal(institution)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteInstitution(institution._id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {institutions.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No institutions available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "campuses" && (
          <div className="space-y-3">
            <Button variant="outline" onClick={() => openCampusModal()}>
              + Add Campus
            </Button>
            <div className="table-wrap">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="py-3 text-left">Campus Name</th>
                    <th className="py-3 text-left">Institution</th>
                    <th className="py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {campuses.map((campus) => (
                    <tr key={campus._id} className="border-b border-border/80">
                      <td className="py-3 font-semibold">{campus.name}</td>
                      <td className="py-3">{institutionLookup.get(campus.institutionId) || "-"}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openCampusModal(campus)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteCampus(campus._id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {campuses.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-muted-foreground">
                        No campuses available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "departments" && (
          <div className="space-y-3">
            <Button variant="outline" onClick={() => openDepartmentModal()}>
              + Add Department
            </Button>
            <div className="table-wrap">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="py-3 text-left">Department</th>
                    <th className="py-3 text-left">Code</th>
                    <th className="py-3 text-left">Campus</th>
                    <th className="py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((department) => (
                    <tr key={department._id} className="border-b border-border/80">
                      <td className="py-3 font-semibold">{department.name}</td>
                      <td className="py-3">{department.code}</td>
                      <td className="py-3">{campusLookup.get(department.campusId) || "-"}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openDepartmentModal(department)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteDepartment(department._id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {departments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        No departments available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "years" && (
          <div className="space-y-3">
            <Button variant="outline" onClick={() => openYearModal()}>
              + Add Academic Year
            </Button>
            <div className="table-wrap">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="py-3 text-left">Academic Year</th>
                    <th className="py-3 text-left">Status</th>
                    <th className="py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((year) => (
                    <tr key={year.id} className="border-b border-border/80">
                      <td className="py-3 font-semibold">{year.value}</td>
                      <td className="py-3">
                        <Badge tone={year.status === "ACTIVE" ? "success" : year.status === "UPCOMING" ? "warning" : "danger"}>
                          {year.status}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openYearModal(year)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteYear(year.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {years.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-muted-foreground">
                        No academic years available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {activeModal === "institution" && (
        <div className="page-modal-overlay" onClick={closeModal}>
          <div className="page-modal max-w-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="modal-title">{editingInstitution ? "Edit Institution" : "Add Institution"}</h3>
            <p className="modal-sub">Create institution master details.</p>

            <form className="mt-4 space-y-3" onSubmit={institutionForm.handleSubmit(saveInstitution)}>
              <div>
                <Label>Code</Label>
                <Input {...institutionForm.register("code", { required: true })} />
              </div>
              <div>
                <Label>Institution Name</Label>
                <Input {...institutionForm.register("name", { required: true })} />
              </div>
              <div>
                <Label>J&K Cap Limit</Label>
                <Input type="number" {...institutionForm.register("jkCapLimit")} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit">{editingInstitution ? "Update" : "Save"}</Button>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "campus" && (
        <div className="page-modal-overlay" onClick={closeModal}>
          <div className="page-modal max-w-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="modal-title">{editingCampus ? "Edit Campus" : "Add Campus"}</h3>
            <p className="modal-sub">Create campus under an institution.</p>

            <form className="mt-4 space-y-3" onSubmit={campusForm.handleSubmit(saveCampus)}>
              <div>
                <Label>Institution</Label>
                <Select {...campusForm.register("institutionId", { required: true })}>
                  <option value="">Select institution</option>
                  {institutions.map((institution) => (
                    <option key={institution._id} value={institution._id}>
                      {institution.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Campus Name</Label>
                <Input {...campusForm.register("name", { required: true })} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit">{editingCampus ? "Update" : "Save"}</Button>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "department" && (
        <div className="page-modal-overlay" onClick={closeModal}>
          <div className="page-modal max-w-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="modal-title">{editingDepartment ? "Edit Department" : "Add Department"}</h3>
            <p className="modal-sub">Create department under a campus.</p>

            <form className="mt-4 space-y-3" onSubmit={departmentForm.handleSubmit(saveDepartment)}>
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
              <div className="flex gap-2 pt-1">
                <Button type="submit">{editingDepartment ? "Update" : "Save"}</Button>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeModal === "year" && (
        <div className="page-modal-overlay" onClick={closeModal}>
          <div className="page-modal max-w-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="modal-title">{editingYearId ? "Edit Academic Year" : "Add Academic Year"}</h3>
            <p className="modal-sub">Manage active and upcoming academic years.</p>

            <form className="mt-4 space-y-3" onSubmit={yearForm.handleSubmit(saveYear)}>
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
              <div className="flex gap-2 pt-1">
                <Button type="submit">{editingYearId ? "Update" : "Save"}</Button>
                <Button type="button" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
