import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import { store } from "./app/store";
import { AppToastBridge } from "./components/common/AppToastBridge";
import { AppRouter } from "./router/AppRouter";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <AppToastBridge />
      <AppRouter />
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </Provider>
  </React.StrictMode>
);
