import { Close } from "@mui/icons-material";
import { Box, Button, styled } from "@mui/material";
import Modals from "../Modals";
import { memo } from "react";
interface ImageModalProps {
  open: boolean;
  imageLink: string;
  onClose: () => void;
}

const ImageModal = ({ open, onClose, imageLink }: ImageModalProps) => {
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      fullScreen
      isShowCancel={false}
      sx={{}}
    >
      <Box
        position="absolute"
        top="50%"
        left="50%"
        height="70%"
        maxWidth="90%"
        display="flex"
        justifyItems="center"
        alignItems="center"
        sx={{ transform: "translate(-50%, -50%)" }}
      >
        <Box>
          <img
            src={imageLink}
            alt=""
            style={{
              width: "100%",
              height: "100%",
            }}
            crossOrigin="anonymous"
          />
        </Box>
      </Box>
      <Button
        onClick={onClose}
        sx={{
          width: "36px",
          height: "36px",
          minWidth: "36px",
          borderRadius: "100%",
          padding: 0,
          position: "absolute",
          top: "20px",
          left: "20px",
          "&:hover": {
            background: "rgba(255,255,255,0.2)",
          },
        }}
      >
        <Close color="primary" sx={{ color: "#fff" }} />
      </Button>
    </CustomModal>
  );
};

export default memo(ImageModal);
const CustomModal = styled(Modals)`
  color: blue;
  .MuiPaper-root {
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    justify-content: center;
    .MuiList-root {
      width: 100%;
      height: 100%;
      padding: 0 !important;
      margin: 0 !important;
    }
  }
`;
