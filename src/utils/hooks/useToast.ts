import { useCallback } from "react";
import { toast as toastify, ToastOptions } from "react-toastify";

interface ToastProps {
  message: string;
  type?: "info" | "success" | "warning" | "error" | "default";
  position?:
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  autoClose?: number;
  hideProgressBar?: boolean;
  closeOnClick?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  progress?: undefined;
  theme?: "light" | "dark" | "colored";
}

const message = {
  CREATED: "Created Successfully",
  UPDATED: "Updated Successfully",
  DELETED: "Deleted Successfully",
  ERROR: "Error Occurred",
  NOT_FOUND: "Not Found",
  UN_AUTH: "Not Authenticated",
};

const useToast = (): {
  notify: (props: ToastProps) => void;
  message: typeof message;
} => {
  const notify = useCallback(
    ({
      message,
      type = "success",
      position = "top-right",
      autoClose = 3000,
      hideProgressBar = false,
      closeOnClick = true,
      pauseOnHover = true,
      draggable = true,
      progress = undefined,
      theme = "light",
    }: ToastProps) => {
      const options: ToastOptions = {
        position,
        autoClose,
        hideProgressBar,
        closeOnClick,
        pauseOnHover,
        draggable,
        progress,
        theme,
      };

      (toastify as any)[type](message, options);
    },
    []
  );

  return { notify, message };
};

export default useToast;
