import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import {
  loadAdmissionsThunk,
  loadApplicantsThunk,
  loadDashboardThunk,
} from "../features/data/dataSlice";
import { api, readError } from "../lib/api";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function FeesPage() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.user?.role);
  const admissions = useAppSelector((state) => state.data.admissions);

  useEffect(() => {
    dispatch(loadAdmissionsThunk());
    dispatch(loadApplicantsThunk());
  }, [dispatch]);

  function notify(message, type = "success") {
    dispatch(showMessage({ message, type }));
  }

  async function markPaid(admissionId) {
    try {
      await api.patch(`/admissions/${admissionId}/fee`, { feeStatus: "PAID" });
      notify("Fee marked as paid");
      await dispatch(loadAdmissionsThunk());
      if (role === "ADMIN" || role === "MANAGEMENT") {
        await dispatch(loadDashboardThunk());
      }
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Fee Status</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Applicant</th>
                <th className="py-2">Program</th>
                <th className="py-2">Quota</th>
                <th className="py-2">Seat Status</th>
                <th className="py-2">Fee Status</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((admission) => (
                <tr key={admission._id} className="border-b border-border/70">
                  <td className="py-2">{admission?.applicantId?.fullName || "Applicant"}</td>
                  <td className="py-2">{admission?.programId?.name || "Program"}</td>
                  <td className="py-2"><Badge>{admission.quotaType}</Badge></td>
                  <td className="py-2"><Badge tone={admission.seatLocked ? "success" : "warning"}>{admission.seatLocked ? "LOCKED" : "PENDING"}</Badge></td>
                  <td className="py-2"><Badge tone={admission.feeStatus === "PAID" ? "success" : "warning"}>{admission.feeStatus}</Badge></td>
                  <td className="py-2">
                    {admission.feeStatus !== "PAID" ? (
                      <Button size="sm" onClick={() => markPaid(admission._id)}>Mark Paid</Button>
                    ) : (
                      <span className="text-xs text-green-700">Paid</span>
                    )}
                  </td>
                </tr>
              ))}
              {admissions.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">No fee records available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
