import { useEffect, useMemo } from "react";
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

export function ConfirmationPage() {
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

  async function refresh() {
    await dispatch(loadAdmissionsThunk());
    if (role === "ADMIN" || role === "MANAGEMENT") {
      await dispatch(loadDashboardThunk());
    }
  }

  async function confirmAdmission(admissionId) {
    try {
      await api.patch(`/admissions/${admissionId}/confirm`);
      notify("Admission confirmed successfully");
      await refresh();
    } catch (error) {
      notify(readError(error), "error");
    }
  }

  const pending = useMemo(
    () => admissions.filter((item) => item.status === "ALLOCATED"),
    [admissions]
  );
  const confirmed = useMemo(
    () => admissions.filter((item) => item.status === "CONFIRMED"),
    [admissions]
  );

  return (
    <section className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Pending Confirmation</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Applicant</th>
                <th className="py-2">Program</th>
                <th className="py-2">Quota</th>
                <th className="py-2">Fee</th>
                <th className="py-2">Documents</th>
                <th className="py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((admission) => {
                const docsVerified = admission?.applicantId?.documentsStatus === "VERIFIED";
                const feePaid = admission.feeStatus === "PAID";
                const canConfirm = docsVerified && feePaid;
                return (
                  <tr key={admission._id} className="border-b border-border/70">
                    <td className="py-2">{admission?.applicantId?.fullName || "Applicant"}</td>
                    <td className="py-2">{admission?.programId?.name || "Program"}</td>
                    <td className="py-2"><Badge>{admission.quotaType}</Badge></td>
                    <td className="py-2"><Badge tone={feePaid ? "success" : "warning"}>{admission.feeStatus}</Badge></td>
                    <td className="py-2">
                      <Badge tone={docsVerified ? "success" : "warning"}>
                        {admission?.applicantId?.documentsStatus || "PENDING"}
                      </Badge>
                    </td>
                    <td className="py-2">
                      {canConfirm ? (
                        <Button size="sm" onClick={() => confirmAdmission(admission._id)}>Confirm</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">{!feePaid ? "Fee pending" : "Docs pending"}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {pending.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">No pending confirmations.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Confirmed Admissions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2">Admission Number</th>
                <th className="py-2">Applicant</th>
                <th className="py-2">Program</th>
                <th className="py-2">Quota</th>
                <th className="py-2">Confirmed At</th>
              </tr>
            </thead>
            <tbody>
              {confirmed.map((admission) => (
                <tr key={admission._id} className="border-b border-border/70">
                  <td className="py-2 mono">{admission.admissionNumber}</td>
                  <td className="py-2">{admission?.applicantId?.fullName || "Applicant"}</td>
                  <td className="py-2">{admission?.programId?.name || "Program"}</td>
                  <td className="py-2"><Badge>{admission.quotaType}</Badge></td>
                  <td className="py-2 text-xs text-muted-foreground">{admission.confirmedAt ? new Date(admission.confirmedAt).toLocaleDateString() : "-"}</td>
                </tr>
              ))}
              {confirmed.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No confirmed admissions yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </section>
  );
}
