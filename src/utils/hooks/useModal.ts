import { useState } from "react";

export interface UseModalProps {
  visible: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
}

const useModal = (_visible?: boolean): UseModalProps => {
  const [visible, setVisible] = useState(() => !!_visible);

  const toggle = () => {
    setVisible((prev) => !prev);
  };

  const show = () => {
    setVisible(true);
  };

  const hide = () => {
    setVisible(false);
  };

  return { toggle, visible, show, hide };
};

export default useModal;
