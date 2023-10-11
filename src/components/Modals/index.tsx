import SaveIcon from "@mui/icons-material/Save";
import { LoadingButton } from "@mui/lab";
import { Button, Container, Divider } from "@mui/material";
import Dialog, { DialogProps } from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface ModalProps extends DialogProps {
  modalTitle?: string | ReactNode | null;
  open: boolean;
  children: ReactNode;
  isLoading?: boolean;
  isShowCancel?: boolean;
  onClose: () => void;
  onOk?: () => void;
}

function Modals({
  modalTitle,
  children,
  open,
  isLoading = false,
  onClose,
  onOk,
  isShowCancel = true,
  ...props
}: ModalProps): JSX.Element {
  return (
    <Dialog onClose={onClose} open={open} {...props}>
      {modalTitle && <DialogTitle variant="h4">{modalTitle}</DialogTitle>}
      {modalTitle && <Divider />}
      <List sx={{ pt: 0 }}>{children}</List>
      <Divider />
      {(isShowCancel || onOk) && (
        <Container
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "16px",
            padding: "12px 0",
          }}
        >
          {isShowCancel && (
            <Button variant="outlined" sx={{ width: "90px" }} onClick={onClose}>
              <FormattedMessage id="label.cancel" />
            </Button>
          )}

          {onOk && (
            <LoadingButton
              onClick={onOk}
              loading={isLoading}
              loadingPosition="start"
              startIcon={<SaveIcon />}
              variant="contained"
              sx={{ width: "90px" }}
              type="submit"
            >
              <FormattedMessage id="label.OK" />
            </LoadingButton>
          )}
        </Container>
      )}
    </Dialog>
  );
}

export default Modals;
