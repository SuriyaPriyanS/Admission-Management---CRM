import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

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

  const quotaLabels = (dashboard.quotaWiseFilled || []).map((quota) => quota.quotaType);
  const quotaFilled = (dashboard.quotaWiseFilled || []).map((quota) => quota.filled);
  const quotaCapacity = (dashboard.quotaWiseFilled || []).map((quota) => quota.seats);

  const quotaChartData = {
    labels: quotaLabels,
    datasets: [
      {
        label: "Filled",
        data: quotaFilled,
        backgroundColor: "rgba(184, 240, 0, 0.8)",
        borderColor: "rgba(184, 240, 0, 1)",
        borderWidth: 1,
      },
      {
        label: "Capacity",
        data: quotaCapacity,
        backgroundColor: "rgba(13, 35, 51, 0.7)",
        borderColor: "rgba(13, 35, 51, 1)",
        borderWidth: 1,
      },
    ],
  };

  const admissionsChartData = {
    labels: ["Admitted", "Remaining Seats", "Allocated"],
    datasets: [
      {
        data: [
          dashboard.totals.admitted || 0,
          dashboard.totals.remainingSeats || 0,
          dashboard.totals.allocated || 0,
        ],
        backgroundColor: ["#b8f000", "#2563eb", "#0d2333"],
        borderColor: ["#d4ff4d", "#60a5fa", "#1a3548"],
        borderWidth: 1,
      },
    ],
  };

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
            {dashboard.quotaWiseFilled.length === 0 && <p className="text-sm text-muted-foreground">No quota data available.</p>}
            {dashboard.quotaWiseFilled.length > 0 && (
              <div className="h-72">
                <Bar
                  data={quotaChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "top" },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                    },
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admissions Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="h-72">
              <Doughnut
                data={admissionsChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: "bottom" },
                  },
                }}
              />
            </div>
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
