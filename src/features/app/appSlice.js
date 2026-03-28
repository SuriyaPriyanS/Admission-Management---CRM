import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: {
    message: "",
    messageType: "success",
  },
  reducers: {
    showMessage(state, action) {
      state.message = action.payload.message;
      state.messageType = action.payload.type || "success";
    },
    clearMessage(state) {
      state.message = "";
    },
  },
});

export const { showMessage, clearMessage } = appSlice.actions;
export default appSlice.reducer;

