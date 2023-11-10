import { FilePresent } from "@mui/icons-material";
import { Box, Tooltip, Typography } from "@mui/material";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetMessageQuery } from "../../services/chatService";
import { IMessage } from "../../models";

const CHAT_URL = process.env.REACT_APP_API_CHAT_URL;
const Messages = ({
  onOpenImageModal,
  socketClient,
  room,
  currentUser,
}: any) => {
  const navigate = useNavigate();
  const [chatArr, setChatArr] = useState<IMessage[]>([]);

  const scrollingDivRef = useRef<HTMLDivElement | null>(null);

  const { data: messageData } = useGetMessageQuery(
    { id: room?._id },
    { refetchOnMountOrArgChange: true, skip: !room?._id }
  );

  useEffect(() => {
    if (scrollingDivRef.current) {
      scrollingDivRef.current.scrollTop = scrollingDivRef.current.scrollHeight;
    }
  }, [chatArr]);

  useEffect(() => {
    if (messageData) {
      setChatArr(messageData?.data);
    }
  }, [messageData]);

  useEffect(() => {
    if (socketClient) {
      socketClient.on("messages", (message: IMessage) => {
        setChatArr((prev: IMessage[]) => [...prev, message]);
      });
    }
  }, [socketClient]);

  return (
    <Box
      ref={scrollingDivRef}
      style={{
        height: "100%",
        maxHeight: "100%",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      {chatArr.map((chat: any, index: number) => (
        <Box width="100%" key={index}>
          <Box
            display="flex"
            flexDirection="column"
            gap={0}
            paddingX={2}
            width="100%"
            alignItems={`${
              chat.sendBy === currentUser?._id ? "flex-end" : "flex-start"
            }`}
          >
            <Box
              width="80%"
              maxWidth="80%"
              display="flex"
              flexDirection="column"
              gap="2px"
              justifyContent={`${
                chat.sendBy === currentUser?._id ? "flex-end" : "flex-start"
              }`}
              alignItems={`${
                chat.sendBy === currentUser?._id ? "flex-end" : "flex-start"
              }`}
            >
              <Box
                display="flex"
                justifyContent={`${
                  chat.sendBy === currentUser?._id ? "flex-end" : "flex-start"
                }`}
              >
                {chat?.text && (
                  <Tooltip
                    title={moment(chat.createdAt).format("HH:mm DD/MM")}
                    placement="left"
                    arrow
                  >
                    <Typography
                      width="max-content"
                      maxWidth="80%"
                      padding={"8px 20px"}
                      sx={{
                        background: "#5eb3ec",
                        float: chat?.self ? "right" : "left",
                      }}
                      color={"#fff"}
                      borderRadius={6}
                      textAlign={`${
                        chat.sendBy === currentUser?._id ? "right" : "left"
                      }`}
                      boxSizing="content-box"
                    >
                      {chat?.text}
                    </Typography>
                  </Tooltip>
                )}
              </Box>
              <Box
                display="flex"
                justifyContent={`${chat?.self ? "right" : "left"}`}
                gap={0.5}
                sx={{ float: chat?.self ? "right" : "left" }}
                alignItems="flex-end"
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={0.25}
                  width="100%"
                >
                  <Box>
                    <Box
                      style={{
                        display: "flex",
                        justifyContent: `${chat?.self ? "right" : "left"}`,
                      }}
                    >
                      {chat?.images?.map((image: any, index: any) => (
                        <Box
                          borderRadius={"8px"}
                          overflow="hidden"
                          height={140}
                          key={`images-${index}`}
                          onClick={() =>
                            onOpenImageModal(`${CHAT_URL}/${image}`)
                          }
                        >
                          <img
                            src={`${CHAT_URL}/${image}`}
                            alt="Upload"
                            style={{
                              width: "100%",
                              height: "100%",
                            }}
                            crossOrigin="anonymous"
                          />
                        </Box>
                      ))}
                    </Box>
                  </Box>
                  <Tooltip
                    title={moment(chat.createdAt).format("HH:mm DD/MM")}
                    placement="left"
                    arrow
                  >
                    <Box
                      display="flex"
                      gap={0.25}
                      sx={{
                        justifyContent: chat?.self ? "right" : "left",
                      }}
                    >
                      {chat?.files?.map((file: any, index: any) => (
                        <Box
                          onClick={() => navigate(`${CHAT_URL}/${file.path}`)}
                          key={index}
                        >
                          <Box
                            key={index}
                            display="flex"
                            alignItems="center"
                            gap="4px"
                            padding={2}
                            borderRadius={2}
                            bgcolor="#ccc"
                          >
                            <FilePresent />
                            {file.name}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default Messages;
