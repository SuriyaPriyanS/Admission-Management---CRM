import { useCallback, useEffect, useMemo } from "react";
import { readError } from "../lib/api";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import {
  loadAdmissionsThunk,
  loadApplicantsThunk,
  loadDashboardThunk,
  loadMastersThunk,
} from "../features/data/dataSlice";
import { AdmissionsView } from "../components/AdmissionsView";

export function AdmissionsPage() {
  const dispatch = useAppDispatch();
  const role = useAppSelector((state) => state.auth.user?.role);
  const applicants = useAppSelector((state) => state.data.applicants);
  const programs = useAppSelector((state) => state.data.programs);
  const admissions = useAppSelector((state) => state.data.admissions);

  useEffect(() => {
    dispatch(loadApplicantsThunk());
    dispatch(loadMastersThunk());
    dispatch(loadAdmissionsThunk());
  }, [dispatch]);

  const refreshMasters = useCallback(async () => {
    await dispatch(loadMastersThunk());
  }, [dispatch]);

  const refreshApplicants = useCallback(async () => {
    await dispatch(loadApplicantsThunk());
  }, [dispatch]);

  const refreshAdmissions = useCallback(async () => {
    await dispatch(loadAdmissionsThunk());
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
      refreshMasters,
      refreshApplicants,
      refreshAdmissions,
      refreshDashboard,
    }),
    [dispatch, refreshAdmissions, refreshApplicants, refreshDashboard, refreshMasters]
  );

  return (
    <AdmissionsView
      applicants={applicants}
      programs={programs}
      admissions={admissions}
      actions={actions}
    />
  );
}
