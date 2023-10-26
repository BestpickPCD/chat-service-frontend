import { Box, Button, Typography, styled } from "@mui/material";
import { Close } from "@mui/icons-material";

const ChatUsers = ({ roomsData, currentUser, onJoinRoom, onClose }: any) => {
  return (
    <LeftBox>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <Typography fontWeight={600}>Messages</Typography>
        {onClose && (
          <Button
            sx={{
              width: "32px",
              height: "32px",
              padding: 0,
              minWidth: "32px",
              borderRadius: "100%",
              "&:hover": {
                backgroundColor: "#e8f1f4",
              },
            }}
            onClick={onClose}
          >
            <Close />
          </Button>
        )}
      </Box>
      {roomsData?.data?.map((item: any, index: number) => (
        <Box
          key={index}
          onClick={() => onJoinRoom(item)}
          sx={{ background: "linear-gradient(to right, #5baddd, #b6e3f5)" }}
          padding="8px 12px"
          borderRadius="8px"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          gap="4px"
          height="48px"
          maxHeight="48px"
        >
          <Typography
            flex={1}
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
          >
            {currentUser?.type === "player"
              ? item?.guess?.name
              : item?.username}
          </Typography>
          {(currentUser?.type === "player"
            ? !!item?.newGuestMessages
            : !!item?.newUserMessages) && (
            <Typography
              textAlign="center"
              lineHeight="32px"
              height="32px"
              width="32px"
              borderRadius="100%"
              color="#fff"
              sx={{ background: "red" }}
            >
              {currentUser?.type === "player"
                ? item?.newGuestMessages
                : item?.newUserMessages}
            </Typography>
          )}
        </Box>
      ))}
    </LeftBox>
  );
};

export default ChatUsers;
const LeftBox = styled(Box)(({ theme }) => ({
  padding: "8px 16px",
  maxWidth: "280px",
  [theme.breakpoints.up("md")]: {
    flex: 1,
  },
}));
