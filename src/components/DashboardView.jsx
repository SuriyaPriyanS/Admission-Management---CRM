import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function DashboardView({ dashboard, onNewApplicant, onAllocate }) {
  if (!dashboard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">No dashboard data available.</CardContent>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg bg-gradient-to-r from-[#0d2333] to-[#1a3548] p-6 text-white shadow-warm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Welcome to EduMerge CRM</h2>
            <p className="mt-1 text-sm text-white/70">Admission Management & Seat Allocation System</p>
          </div>
          <div className="flex gap-2">
            <Button className="bg-[#b8f000] text-[#0d2333] hover:bg-[#d4ff4d]" onClick={onNewApplicant}>+ New Applicant</Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onAllocate}>Allocate Seat</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Intake", dashboard.totals.totalIntake],
          ["Confirmed Admissions", dashboard.totals.admitted],
          ["Allocated Seats", dashboard.totals.allocated],
          ["Remaining Seats", dashboard.totals.remainingSeats],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.8px] text-muted-foreground">{label}</p>
              <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quota-wise Seat Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.quotaWiseFilled.map((quota) => {
              const pct = quota.seats > 0 ? Math.round((quota.filled / quota.seats) * 100) : 0;
              return (
                <div key={quota.quotaType}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{quota.quotaType}</span>
                    <span className="mono text-xs">{quota.filled}/{quota.seats}</span>
                  </div>
                  <div className="h-2 rounded bg-secondary">
                    <div className="h-2 rounded bg-gradient-to-r from-primary to-accent" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(dashboard.recentActivity || []).map((activity, index) => (
              <div key={`${activity.createdAt}-${index}`} className="rounded-md border border-border p-2">
                <p>{activity.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(activity.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {(!dashboard.recentActivity || dashboard.recentActivity.length === 0) && (
              <p className="text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.pendingDocuments.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending documents.</p>
            )}
            {dashboard.pendingDocuments.map((candidate) => (
              <div key={candidate._id} className="flex items-center justify-between rounded-md border border-border p-2 text-sm">
                <span>{candidate.fullName}</span>
                <Badge tone="warning">{candidate.documentsStatus}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fee Pending List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.feePendingList.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending fees.</p>
            )}
            {dashboard.feePendingList.map((item) => (
              <div key={item._id} className="rounded-md border border-border p-2 text-sm">
                <p className="font-medium">{item?.applicantId?.fullName || "N/A"}</p>
                <p className="text-muted-foreground">{item?.programId?.name || "Program N/A"}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
