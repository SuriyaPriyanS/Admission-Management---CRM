import { useCallback, useEffect, useMemo } from "react";
import { readError } from "../lib/api";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { loadApplicantsThunk, loadDashboardThunk } from "../features/data/dataSlice";
import { ApplicantsView } from "../components/ApplicantsView";

export function ApplicantsPage() {
  const dispatch = useAppDispatch();
  const applicants = useAppSelector((state) => state.data.applicants);
  const role = useAppSelector((state) => state.auth.user?.role);

  useEffect(() => {
    dispatch(loadApplicantsThunk());
  }, [dispatch]);

  const refreshApplicants = useCallback(async () => {
    await dispatch(loadApplicantsThunk());
  }, [dispatch]);

  const refreshDashboard = useCallback(async () => {
    if (role === "ADMIN" || role === "MANAGEMENT") {
      await dispatch(loadDashboardThunk());
    }
  }, [dispatch, role]);

  const actions = useMemo(
    () => ({
      showError: (error) =>
        dispatch(showMessage({ message: readError(error), type: "error" })),
      showSuccess: (message) => dispatch(showMessage({ message, type: "success" })),
      refreshApplicants,
      refreshDashboard,
      refreshMasters: async () => {},
      refreshAdmissions: async () => {},
    }),
    [dispatch, refreshApplicants, refreshDashboard]
  );

  return <ApplicantsView applicants={applicants} actions={actions} />;
}
