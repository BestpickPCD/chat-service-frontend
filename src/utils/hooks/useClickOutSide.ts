import { useEffect } from "react";

const useClickOutSide = (ref: any, callback: () => void) => {
  useEffect(() => {
    const handleClickOutside = (event: Event) => {
      if (ref?.current && !ref?.current.contains(event.target)) {
        callback();
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [ref, callback]);
};

export default useClickOutSide;
