import { useEffect } from "react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { clearMessage } from "../../features/app/appSlice";

const toastByType = {
  success: toast.success,
  error: toast.error,
  warning: toast.warning,
  info: toast.info,
};

export function AppToastBridge() {
  const dispatch = useAppDispatch();
  const { message, messageType } = useAppSelector((state) => state.app);

  useEffect(() => {
    if (!message) return;

    const showToast = toastByType[messageType] || toast;
    showToast(message, {
      toastId: `${messageType}-${message}`,
    });
    dispatch(clearMessage());
  }, [dispatch, message, messageType]);

  return null;
}
