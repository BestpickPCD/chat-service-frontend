import UploadFile from "../../components/UploadFile";
import { useSaveChatMutation } from "../../services/chatService";
import { useClickOutside, useModal, useToast } from "../../utils/hooks";
import Picker from "@emoji-mart/react";
import {
  UploadFile as AttachFile,
  EmojiEmotions,
  Send,
} from "@mui/icons-material";
import { Box, Button, TextField, Typography, styled } from "@mui/material";
import { memo, useEffect, useRef, useState } from "react";
const BottomHandler = ({
  currentUser,
  roomId,
  socketClient,
  updateRoom,
  roomsData,
  refetchRoom,
}: any) => {
  const { visible, toggle, hide } = useModal();
  const emojiRef = useRef<HTMLDivElement | null>(null);
  useClickOutside(emojiRef, hide);
  const { notify } = useToast();

  const [saveChat] = useSaveChatMutation();
  const [uploadImages, setUploadImages] = useState<File[]>([]);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [chat, setChat] = useState<any>({
    text: "",
  });
  const [convertedFiles, setConvertedFile] = useState<{
    files: any[];
    images: any[];
  }>({
    files: [],
    images: [],
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onEscape = (e: any) => {
        if (e.key === "Escape") {
          hide();
        }
      };
      window?.addEventListener("keydown", onEscape);
      return () => window?.removeEventListener("keydown", onEscape);
    }
  }, []);

  const onFocus = async () => {
    const room = roomsData?.data.find((room: any) => room._id === roomId?._id);

    if (
      (currentUser?.type === "player" && room?.newGuestMessages) ||
      (currentUser?.type === "agent" && room?.newUserMessages)
    ) {
      await updateRoom({
        roomId: roomId?._id,
        ...(currentUser.type === "player"
          ? { newGuestMessages: 0 }
          : { newUserMessages: 0 }),
      })
        .unwrap()
        .then(() => {
          refetchRoom()
            .unwrap()
            .then((roomsData: any) => {
              if (roomsData?.data?.length > 0) {
                const room = roomsData?.data?.find(
                  (item: any) => item._id === roomId?._id
                );
                socketClient.current.emit("sent-or-seen", {
                  roomId: room?._id,
                  newGuestMessages:
                    currentUser.type === "player" ? 0 : room?.newGuestMessages,
                  newUserMessages:
                    currentUser.type === "agent" ? 0 : room?.newUserMessages,
                });
              }
            });
        });
    }
  };

  const handleKeyDown = async (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      await handleChat();
    }
  };

  const handleSelectEmoji = (value: any) => {
    setChat((prev: any) => ({
      ...prev,
      text: prev.text + value.native,
    }));
  };

  const handleChangeText = (e: any) => {
    setChat((prev: any) => ({
      ...prev,
      text: e?.target?.value,
    }));
  };

  const handleChat = async () => {
    if (
      Boolean(chat.text.trim() || uploadImages.length || uploadFiles.length)
    ) {
      const data: any = {
        text: chat.text,
        image: uploadImages,
        file: uploadFiles,
        userId: currentUser.id,
        oldText: "",
        hasRead: false,
        isUpdated: false,
        isReply: false,
        status: "pending",
        roomId: roomId?._id,
      };

      const { image, file, ...rest } = data;
      const formData = new FormData();
      image.forEach((item: any) => formData.append("image", item));
      file.forEach((item: any) => formData.append("image", item));
      Object.keys(rest).forEach((item) => formData.append(item, data[item]));
      try {
        await saveChat(formData)
          .unwrap()
          .then((data: any) => {
            socketClient.current.emit("messages", {
              ...data.data,
            });
          });

        const room = roomsData?.data?.find(
          (item: any) => item._id === roomId._id
        );

        await updateRoom({
          roomId: roomId?._id,
          ...(currentUser.type === "player"
            ? { newUserMessages: room?.newUserMessages + 1 }
            : { newGuestMessages: room?.newGuestMessages + 1 }),
        })
          .unwrap()
          .then((data: any) => {
            socketClient.current.emit("new-messages", {
              [`${String(roomId._id)}`]: {
                roomId: roomId._id,
                newUserMessages: data?.data?.newUserMessages,
                newGuestMessages: data?.data?.newGuestMessages,
              },
            });
            socketClient.current.emit("sent-or-seen", {
              roomId: room?._id,
              newGuestMessages:
                currentUser.type === "agent"
                  ? room?.newGuestMessages + 1
                  : room?.newGuestMessages,
              newUserMessages:
                currentUser.type === "player"
                  ? room?.newUserMessages + 1
                  : room?.newUserMessages,
            });
          });

        setChat((prev: any) => ({
          ...prev,
          text: "",
        }));
        setUploadImages([]);
        setUploadFiles([]);
        setConvertedFile({
          files: [],
          images: [],
        });
        hide();
      } catch (error: any) {
        setConvertedFile({
          files: [],
          images: [],
        });
        setUploadImages([]);
        setUploadFiles([]);
        notify({
          type: "error",
          message: error?.data?.message,
        });
      }
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      gap="8px"
      paddingX={2}
      paddingTop={2}
      position="relative"
      zIndex={1}
    >
      {visible && (
        <div style={{ position: "absolute", bottom: "72px", left: "40px" }}>
          <Picker
            onEmojiSelect={handleSelectEmoji}
            theme="light"
            previewPosition="none"
          />
        </div>
      )}
      <UploadFile
        convertedFiles={convertedFiles}
        onSetUploadFile={setUploadFiles}
        type="files"
        onConvertedFile={setConvertedFile}
      />
      <div onClick={toggle} ref={emojiRef}>
        <EmojiEmotions />
      </div>
      <UploadFile
        convertedFiles={convertedFiles}
        onSetUploadFile={setUploadImages}
        type="images"
        onConvertedFile={setConvertedFile}
      />
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flex="1"
        gap="8px"
      >
        <CustomTextField
          value={chat?.text}
          onChange={handleChangeText}
          onKeyDown={handleKeyDown}
          fullWidth
          sx={{ borderRadius: "20%" }}
          onFocus={onFocus}
          multiline={false}
        />
        <Button
          onClick={handleChat}
          sx={{
            height: "40px",
            background: "#2c99e2",
            minWidth: "unset",
            borderRadius: "100%",
            width: "40px",
          }}
        >
          <Send style={{ color: "#fff" }} />
        </Button>
      </Box>

      <Box
        display="flex"
        gap="4px"
        alignItems="end"
        sx={{
          margin: "8px 0",
          position: "absolute",
          bottom: 60,
          left: "20px",
        }}
      >
        {convertedFiles.images.map(
          (image: string | undefined, index: number) => (
            <Box
              key={index}
              sx={{
                height: "100px",
                width: "100px",
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={image}
                alt="Uploaded"
                style={{
                  height: "100px",
                  width: "100px",
                  objectFit: "cover",
                }}
              />
            </Box>
          )
        )}
        {convertedFiles.files.map((image: string | undefined, index) => (
          <Box
            key={`files-${index}`}
            display="flex"
            alignItems="center"
            height="max-content"
            maxWidth="150px"
            borderRadius="8px"
            overflow="hidden"
            padding="6px 12px"
            bgcolor="#c0baba"
          >
            <AttachFile />
            <Typography
              whiteSpace="nowrap"
              fontSize={12}
              textOverflow="ellipsis"
              overflow="hidden"
            >
              {image}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default memo(BottomHandler);

const CustomTextField = styled(TextField)(
  () => `
  .MuiInputBase-root {
    border-radius: 50px
  }
`
);
