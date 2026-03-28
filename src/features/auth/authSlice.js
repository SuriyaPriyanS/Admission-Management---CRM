import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api, readError, setAuthToken } from "../../lib/api";

function readStoredAuth() {
  const token = localStorage.getItem("edumerge_token") || "";
  const rawUser = localStorage.getItem("edumerge_user");
  const user = rawUser ? JSON.parse(rawUser) : null;
  return { token, user };
}

const initialAuth = readStoredAuth();
if (initialAuth.token) {
  setAuthToken(initialAuth.token);
}

export const loginThunk = createAsyncThunk("auth/login", async (credentials, thunkApi) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data.data;
  } catch (error) {
    return thunkApi.rejectWithValue(readError(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: initialAuth.token,
    user: initialAuth.user,
    status: "idle",
    error: "",
  },
  reducers: {
    logout(state) {
      state.token = "";
      state.user = null;
      localStorage.removeItem("edumerge_token");
      localStorage.removeItem("edumerge_user");
      setAuthToken("");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = "";
        localStorage.setItem("edumerge_token", action.payload.token);
        localStorage.setItem("edumerge_user", JSON.stringify(action.payload.user));
        setAuthToken(action.payload.token);
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

