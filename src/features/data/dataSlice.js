import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, readError } from "../../lib/api";

function normalizeResponse(response) {
  return response?.data?.data || [];
}

export const loadMastersThunk = createAsyncThunk("data/loadMasters", async (_, thunkApi) => {
  try {
    const [institutions, campuses, departments, programs] = await Promise.all([
      api.get("/masters/institutions"),
      api.get("/masters/campuses"),
      api.get("/masters/departments"),
      api.get("/masters/programs"),
    ]);
    return {
      institutions: normalizeResponse(institutions),
      campuses: normalizeResponse(campuses),
      departments: normalizeResponse(departments),
      programs: normalizeResponse(programs),
    };
  } catch (error) {
    return thunkApi.rejectWithValue(readError(error));
  }
});

export const loadApplicantsThunk = createAsyncThunk("data/loadApplicants", async (_, thunkApi) => {
  try {
    const response = await api.get("/applicants");
    return normalizeResponse(response);
  } catch (error) {
    return thunkApi.rejectWithValue(readError(error));
  }
});

export const loadAdmissionsThunk = createAsyncThunk("data/loadAdmissions", async (_, thunkApi) => {
  try {
    const response = await api.get("/admissions");
    return normalizeResponse(response);
  } catch (error) {
    return thunkApi.rejectWithValue(readError(error));
  }
});

export const loadDashboardThunk = createAsyncThunk("data/loadDashboard", async (_, thunkApi) => {
  try {
    const response = await api.get("/dashboard");
    return response?.data?.data || null;
  } catch (error) {
    return thunkApi.rejectWithValue(readError(error));
  }
});

const dataSlice = createSlice({
  name: "data",
  initialState: {
    institutions: [],
    campuses: [],
    departments: [],
    programs: [],
    applicants: [],
    admissions: [],
    dashboard: null,
    loading: {
      masters: false,
      applicants: false,
      admissions: false,
      dashboard: false,
    },
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadMastersThunk.pending, (state) => {
        state.loading.masters = true;
      })
      .addCase(loadMastersThunk.fulfilled, (state, action) => {
        state.loading.masters = false;
        state.institutions = action.payload.institutions;
        state.campuses = action.payload.campuses;
        state.departments = action.payload.departments;
        state.programs = action.payload.programs;
      })
      .addCase(loadMastersThunk.rejected, (state, action) => {
        state.loading.masters = false;
        state.error = action.payload || "Failed to load masters";
      })
      .addCase(loadApplicantsThunk.pending, (state) => {
        state.loading.applicants = true;
      })
      .addCase(loadApplicantsThunk.fulfilled, (state, action) => {
        state.loading.applicants = false;
        state.applicants = action.payload;
      })
      .addCase(loadApplicantsThunk.rejected, (state, action) => {
        state.loading.applicants = false;
        state.error = action.payload || "Failed to load applicants";
      })
      .addCase(loadAdmissionsThunk.pending, (state) => {
        state.loading.admissions = true;
      })
      .addCase(loadAdmissionsThunk.fulfilled, (state, action) => {
        state.loading.admissions = false;
        state.admissions = action.payload;
      })
      .addCase(loadAdmissionsThunk.rejected, (state, action) => {
        state.loading.admissions = false;
        state.error = action.payload || "Failed to load admissions";
      })
      .addCase(loadDashboardThunk.pending, (state) => {
        state.loading.dashboard = true;
      })
      .addCase(loadDashboardThunk.fulfilled, (state, action) => {
        state.loading.dashboard = false;
        state.dashboard = action.payload;
      })
      .addCase(loadDashboardThunk.rejected, (state, action) => {
        state.loading.dashboard = false;
        state.error = action.payload || "Failed to load dashboard";
      });
  },
});

export default dataSlice.reducer;

