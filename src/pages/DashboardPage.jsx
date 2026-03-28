import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loadDashboardThunk } from "../features/data/dataSlice";
import { DashboardView } from "../components/DashboardView";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function DashboardPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const dashboard = useAppSelector((state) => state.data.dashboard);
  const loading = useAppSelector((state) => state.data.loading.dashboard);

  useEffect(() => {
    dispatch(loadDashboardThunk());
  }, [dispatch]);

  return (
    <>
      {loading && (
        <Card>
          <CardHeader>
            <CardTitle>Loading</CardTitle>
            <CardDescription>Fetching dashboard data...</CardDescription>
          </CardHeader>
        </Card>
      )}
      <DashboardView
        dashboard={dashboard}
        onNewApplicant={() => navigate("/applicants")}
        onAllocate={() => navigate("/allocation")}
      />
    </>
  );
}
