import { useCallback, useEffect, useMemo } from "react";
import { api, readError } from "../lib/api";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { loadDashboardThunk, loadMastersThunk } from "../features/data/dataSlice";
import { MastersView } from "../components/MastersView";

export function MastersPage() {
  const dispatch = useAppDispatch();
  const institutions = useAppSelector((state) => state.data.institutions);
  const campuses = useAppSelector((state) => state.data.campuses);
  const departments = useAppSelector((state) => state.data.departments);
  const programs = useAppSelector((state) => state.data.programs);

  useEffect(() => {
    dispatch(loadMastersThunk());
  }, [dispatch]);

  const refreshMasters = useCallback(async () => {
    await dispatch(loadMastersThunk());
  }, [dispatch]);

  const refreshDashboard = useCallback(async () => {
    await dispatch(loadDashboardThunk());
  }, [dispatch]);

  const actions = useMemo(
    () => ({
      showError: (error) =>
        dispatch(showMessage({ message: readError(error), type: "error" })),
      showSuccess: (message) => dispatch(showMessage({ message, type: "success" })),
      refreshMasters,
      refreshDashboard,
      refreshApplicants: async () => {},
      refreshAdmissions: async () => {},
      api,
    }),
    [dispatch, refreshDashboard, refreshMasters]
  );

  return (
    <MastersView
      institutions={institutions}
      campuses={campuses}
      departments={departments}
      programs={programs}
      actions={actions}
    />
  );
}

