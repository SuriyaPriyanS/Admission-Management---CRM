import { configureStore } from "@reduxjs/toolkit";
import appReducer from "../features/app/appSlice";
import authReducer from "../features/auth/authSlice";
import dataReducer from "../features/data/dataSlice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    data: dataReducer,
  },
});

