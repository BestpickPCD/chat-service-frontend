import {
  useCreateRoomMutation,
  useGetMessageQuery,
  useGetRoomsQuery,
  useUpdateRoomMutation,
} from "../../services/chatService";
import { useCheckUserMutation } from "../../services/gamesService";

import { FilePresent, Menu } from "@mui/icons-material";
import {
  Box,
  Container,
  Drawer,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import io from "socket.io-client";
import { useModal, useToast } from "../../utils/hooks";
import BottomHandler from "./BottomHandler";
import ChatUsers from "./ChatUsers";
import ImageModal from "./ImageModal";
import Sended from "./Sended";
const CHAT_URL = process.env.REACT_APP_API_CHAT_URL;

const Chat = () => {
  const theme = useTheme();

  const navigate = useNavigate();
  const socketClient = useRef<any>(null);
  const [currentUser, setCurrentUser] = useState<any>();
  const [imageLink, setImageLink] = useState<string>("");
  const [sentOrSeen, setSentOrSeen] = useState<"Sent" | "Seen" | "">("");
  const [roomId, setRoomId] = useState<any>();
  const userDrawer = useModal();
  const [createRoom] = useCreateRoomMutation();

  const [chatArr, setChatArr] = useState<any[]>([]);
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [updateRoom] = useUpdateRoomMutation();
  const [checkUser] = useCheckUserMutation();

  const { data } = useGetMessageQuery(
    {
      id: currentUser?.id === "player" ? currentUser?.id : roomId?.userId,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !(currentUser?.id && roomId?._id),
    }
  );
  const isMdWidth = useMediaQuery(theme.breakpoints.up("md"));

  const { data: roomsData, refetch: refetchRoom } = useGetRoomsQuery(
    {
      username: currentUser?.username,
      id: currentUser?.id,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !currentUser?.id,
    }
  );

  const scrollingDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollingDivRef.current) {
      scrollingDivRef.current.scrollTop = scrollingDivRef.current.scrollHeight;
    }
  }, [chatArr]);
  const [searchParams] = useSearchParams();
  const { notify } = useToast();

  useEffect(() => {
    if (
      !localStorage.getItem(process.env.REACT_APP_LOCALHOST_KEY || "") ||
      !localStorage.getItem("tokens")
    ) {
      const tokens = searchParams.get("token");
      const user = searchParams.get("user");
      if (!!tokens && !!user) {
        localStorage.setItem("tokens", tokens);
        localStorage.setItem("user", user);
        checkUser({ id: JSON.parse(user).id })
          .unwrap()
          .then((result: any) => {
            if (result) {
              setCurrentUser(result.data);
              return navigate("/");
            }
          });
      } else {
        notify({
          type: "error",
          message: "Something went wrong, please try again",
        });
      }
    } else {
      const user = localStorage.getItem("user");
      if (!user) {
        notify({
          type: "error",
          message: "Something went wrong, please try again",
        });
      } else {
        const localStorageData = JSON.parse(user);
        checkUser({ id: localStorageData?.id })
          .unwrap()
          .then((result: any) => {
            if (result) {
              setCurrentUser(result.data);
              return navigate("/");
            }
          })
          .catch((error: any) => {
            notify({
              type: "error",
              message:
                error?.data?.message ||
                "Something went wrong, please try again",
            });
          });
      }
    }
  }, []);

  useEffect(() => {
    socketClient.current = io(String(process.env.REACT_APP_API_CHAT_URL));
    if (currentUser) {
      const onCreateRoom = async (body: any) => {
        const response: any = await createRoom(body).unwrap();
        return response;
      };
      if (currentUser.type === "player") {
        onCreateRoom({ ...currentUser }).then((result) => {
          setRoomId(result.data);
        });
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (data) {
      setChatArr((prev: any) => {
        return [
          ...data?.data?.map((item: any) => {
            return {
              ...item,
              self: item.userId === currentUser.id,
            };
          }),
          ...prev,
        ];
      });
    }
  }, [data, currentUser]);

  useEffect(() => {
    if (roomId?._id) {
      socketClient.current.on("messages-back", (message: any) => {
        setChatArr((prev) => [
          ...prev,
          {
            ...message,
            self: message.userId === currentUser.id,
          },
        ]);
      });
      updateRoom({
        roomId: roomId?._id,
        ...(currentUser.type === "player"
          ? { newGuestMessages: 0 }
          : { newUserMessages: 0 }),
      })
        .unwrap()
        .then(() => {
          refetchRoom()
            .unwrap()
            .then((roomsData) => {
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
    socketClient?.current?.on("new-message", (message: any) => {
      refetchRoom();
    });
    if (currentUser) {
      socketClient?.current?.on("sent-or-seen", (data: any) => {
        setSentOrSeen(() => {
          if (currentUser?.type === "player") {
            if (data?.newUserMessages > 0) {
              return "Sent";
            }
            return "Seen";
          }
          if (data?.newGuestMessages > 0) {
            return "Sent";
          }
          return "Seen";
        });
      });
    }
  }, [roomId, currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      if (currentUser?.type === "player") {
        socketClient.current.emit("add-user", {
          roomId: roomId?._id,
          userData: currentUser.id,
        });
      } else {
        if (roomsData && roomsData?.data?.length) {
          roomsData?.data?.map((item: any) =>
            socketClient.current.emit("add-user", {
              roomId: item?._id,
              userData: currentUser.id,
            })
          );
        }
      }
    }
  }, [currentUser, roomsData, roomId]);

  const onJoinRoom = (item: any) => {
    setRoomId(item);
  };

  const onOpenImageModal = (link: string) => {
    setImageLink(link);
  };

  return (
    <Container
      sx={{
        height: "calc(100vh - 90px)",
        display: "flex",
        padding: "10px 0",
        position: "relative",
        zIndex: "100",
      }}
      ref={parentRef}
    >
      {!isMdWidth ? (
        <Drawer
          anchor="left"
          open={userDrawer.visible}
          onClose={() => userDrawer.toggle()}
        >
          <ChatUsers
            roomsData={roomsData}
            currentUser={currentUser}
            onJoinRoom={onJoinRoom}
            onClose={() => userDrawer.toggle()}
          />
        </Drawer>
      ) : (
        <ChatUsers
          roomsData={roomsData}
          currentUser={currentUser}
          onJoinRoom={onJoinRoom}
        />
      )}

      <Box
        flex="4"
        gap={1}
        height={`calc(100vh - ${!isMdWidth ? "130" : "140"}px)`}
        marginTop={`${!isMdWidth ? "32px" : "0px"}`}
      >
        {currentUser && roomId && (
          <Box
            width="100%"
            paddingX={2}
            paddingY={1}
            display="flex"
            alignItems="center"
            gap={2}
            sx={
              !isMdWidth
                ? {
                    boxShadow: "4px 8px 16px -4px rgba(0,0,0,0.45)",
                    position: "fixed",
                    top: "0",
                    left: "0",
                  }
                : null
            }
          >
            {!isMdWidth && <Menu onClick={() => userDrawer.toggle()} />}
            <Typography color="#5eb3ec" fontWeight={600}>
              {currentUser?.type === "player"
                ? roomId?.guess.name
                : roomId?.username}
            </Typography>
          </Box>
        )}
        <Box height="100%">
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
              <Box
                textAlign={`${chat?.self ? "right" : "left"}`}
                width="100%"
                key={index}
              >
                <Box
                  display="flex"
                  flexDirection="column"
                  gap={0}
                  paddingX={2}
                  width="100%"
                  alignItems={`${chat?.self ? "flex-end" : "flex-start"}`}
                >
                  <Box
                    width="80%"
                    maxWidth="80%"
                    display="flex"
                    flexDirection="column"
                    gap="2px"
                    justifyContent={`${chat?.self ? "flex-end" : "flex-start"}`}
                  >
                    <Box>
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
                            textAlign={`${chat?.self ? "left" : "right"}`}
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
                              justifyContent: `${
                                chat?.self ? "right" : "left"
                              }`,
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
                                onClick={() =>
                                  navigate(`${CHAT_URL}/${file.path}`)
                                }
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
                  {index === chatArr.length - 1 && chat?.self && (
                    <Typography color="#B0B3B8" fontSize="14px">
                      <Sended
                        currentUser={currentUser}
                        socketClient={socketClient?.current}
                        chatArr={chatArr}
                        roomId={roomId}
                        sentOrSeen={sentOrSeen}
                      />
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
          <BottomHandler
            currentUser={currentUser}
            roomId={roomId}
            socketClient={socketClient}
            roomsData={roomsData}
            updateRoom={updateRoom}
            refetchRoom={refetchRoom}
          />
        </Box>
      </Box>
      <ImageModal
        imageLink={imageLink}
        open={!!imageLink}
        onClose={() => setImageLink("")}
      />
    </Container>
  );
};

export default Chat;
