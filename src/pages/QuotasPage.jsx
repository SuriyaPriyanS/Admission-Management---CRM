import { useEffect, useMemo, useState } from "react";
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

export function QuotasPage() {
  const dispatch = useAppDispatch();
  const programs = useAppSelector((state) => state.data.programs);
  const [selectedProgramId, setSelectedProgramId] = useState("");

  const form = useForm({
    defaultValues: {
      kcet: 0,
      comedk: 0,
      management: 0,
      supernumerary: 0,
    },
  });

  useEffect(() => {
    dispatch(loadMastersThunk());
  }, [dispatch]);

  function notify(message, type = "success") {
    dispatch(showMessage({ message, type }));
  }

  const selectedProgram = useMemo(
    () => programs.find((program) => program._id === selectedProgramId),
    [programs, selectedProgramId]
  );

  useEffect(() => {
    if (!selectedProgram) return;

    const kcet = selectedProgram.quotas?.find((q) => q.quotaType === "KCET")?.seats || 0;
    const comedk = selectedProgram.quotas?.find((q) => q.quotaType === "COMEDK")?.seats || 0;
    const management = selectedProgram.quotas?.find((q) => q.quotaType === "MANAGEMENT")?.seats || 0;
    const supernumerary =
      selectedProgram.quotas?.find((q) => q.quotaType === "SUPERNUMERARY")?.seats || 0;

    form.reset({ kcet, comedk, management, supernumerary });
  }, [selectedProgram, form]);

  const total =
    Number(form.watch("kcet") || 0) +
    Number(form.watch("comedk") || 0) +
    Number(form.watch("management") || 0);

  async function onSubmit(values) {
    if (!selectedProgram) {
      notify("Select a program first.", "error");
      return;
    }

    try {
      await api.patch(`/masters/programs/${selectedProgram._id}/quotas`, {
        quotas: [
          { quotaType: "KCET", seats: Number(values.kcet || 0) },
          { quotaType: "COMEDK", seats: Number(values.comedk || 0) },
          { quotaType: "MANAGEMENT", seats: Number(values.management || 0) },
        ],
        supernumerarySeats: Number(values.supernumerary || 0),
      });

      notify("Seat matrix updated");
      await dispatch(loadMastersThunk());
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  function editProgramMatrix(programId) {
    setSelectedProgramId(programId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Configure Seat Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="md:col-span-2">
              <Label>Program</Label>
              <Select value={selectedProgramId} onChange={(event) => setSelectedProgramId(event.target.value)}>
                <option value="">Select program</option>
                {programs.map((program) => (
                  <option key={program._id} value={program._id}>
                    {program.code} - {program.name} (Intake {program.totalIntake})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label>KCET Seats</Label>
              <Input type="number" {...form.register("kcet")} />
            </div>
            <div>
              <Label>COMEDK Seats</Label>
              <Input type="number" {...form.register("comedk")} />
            </div>
            <div>
              <Label>Management Seats</Label>
              <Input type="number" {...form.register("management")} />
            </div>
            <div>
              <Label>Supernumerary Seats</Label>
              <Input type="number" {...form.register("supernumerary")} />
            </div>

            <div className="md:col-span-2 rounded-md border border-border bg-secondary p-3 text-sm">
              {selectedProgram ? (
                <span className={total === Number(selectedProgram.totalIntake) ? "text-green-700" : "text-red-600"}>
                  {total === Number(selectedProgram.totalIntake)
                    ? `OK: Total matches intake (${total})`
                    : `Mismatch: Total ${total} does not match intake ${selectedProgram.totalIntake}`}
                </span>
              ) : (
                <span className="text-muted-foreground">Select a program to configure quotas.</span>
              )}
            </div>

            <div className="md:col-span-2">
              <Button type="submit">Save Seat Matrix</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {programs.map((program) => {
          const quotaMap = new Map((program.quotas || []).map((q) => [q.quotaType, q]));
          const kcet = quotaMap.get("KCET") || { seats: 0, filled: 0 };
          const comedk = quotaMap.get("COMEDK") || { seats: 0, filled: 0 };
          const management = quotaMap.get("MANAGEMENT") || { seats: 0, filled: 0 };
          const sup = quotaMap.get("SUPERNUMERARY") || { seats: 0, filled: 0 };
          const baseTotal = kcet.seats + comedk.seats + management.seats;
          const balanced = baseTotal === Number(program.totalIntake);

          return (
            <Card key={program._id}>
              <CardHeader>
                <CardTitle>{program.code} - {program.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Intake: {program.totalIntake}</span>
                  <div className="flex items-center gap-2">
                    <Badge tone={balanced ? "success" : "danger"}>{balanced ? "Balanced" : "Mismatch"}</Badge>
                    <Button size="sm" variant="outline" onClick={() => editProgramMatrix(program._id)}>
                      Edit
                    </Button>
                  </div>
                </div>

                {[{ label: "KCET", data: kcet }, { label: "COMEDK", data: comedk }, { label: "Management", data: management }].map((item) => {
                  const pct = item.data.seats > 0 ? Math.round((item.data.filled / item.data.seats) * 100) : 0;
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="mono text-xs">{item.data.filled}/{item.data.seats}</span>
                      </div>
                      <div className="h-2 rounded bg-secondary">
                        <div className="h-2 rounded bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(pct, 100)}%` }} />
                      </div>
                    </div>
                  );
                })}

                {sup.seats > 0 && (
                  <div className="text-sm text-muted-foreground">Supernumerary: <span className="font-semibold text-foreground">{sup.seats}</span></div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
