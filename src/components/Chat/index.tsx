import {
  useCheckUserMutation,
  useCreateRoomMutation,
  useLazyGetRoomsQuery,
  useUpdateRoomMutation,
} from "../../services/chatService";

import { Menu } from "@mui/icons-material";
import {
  Box,
  Container,
  Drawer,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { IRoom, IUser } from "../../models";
import { useModal } from "../../utils/hooks";
import BottomHandler from "./BottomHandler";
import ChatUsers from "./ChatUsers";
import ImageModal from "./ImageModal";
import Messages from "./Messages";

const onGetRooms = async (api: any, setData: any, setRoom?: any) => {
  return await api({})
    .unwrap()
    .then((rooms: any) => {
      setData(rooms.data);
      if (rooms.data.length) {
        setRoom && setRoom(rooms.data[0]);
      }
    });
};
const CHAT_URL = process.env.REACT_APP_API_CHAT_URL;
const Chat = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMdWidth = useMediaQuery(theme.breakpoints.up("md"));
  const userDrawer = useModal();
  const [searchParams] = useSearchParams();
  const socketClient = useRef<any>(null);
  const parentRef = useRef<HTMLDivElement | null>(null);

  const [currentUser, setCurrentUser] = useState<IUser>({
    _id: "",
    username: "",
    type: "",
  });
  const [imageLink, setImageLink] = useState<string>("");
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [room, setRoom] = useState<IRoom>();

  const [createRoom] = useCreateRoomMutation();
  const [updateRoom] = useUpdateRoomMutation();
  const [checkUser] = useCheckUserMutation();
  const [getRooms, refetchRoom] = useLazyGetRoomsQuery();

  useEffect(() => {
    const user = searchParams.get("user");
    if (user) {
      localStorage.setItem("user", user);
    }
  }, [searchParams]);

  useEffect(() => {
    socketClient.current = io(String(CHAT_URL));
    const userLocal = localStorage.getItem("user");
    if (!userLocal) {
      return navigate("/login");
    }
    const user = JSON.parse(userLocal);
    if (!user?._id) {
      return navigate("/login");
    }
    if (user?.type === "player") {
      const onCheckUser = async () => {
        return await checkUser({ userId: user._id, ...user }).unwrap();
      };
      onCheckUser().then((result) => {
        const { accessToken, refreshToken } = result.data;
        localStorage.setItem(
          "tokens",
          JSON.stringify({ token: { accessToken, refreshToken } })
        );
        setCurrentUser({
          ...result.data,
          _id: result.data.userId,
        });
        socketClient.current.emit("add-user", result.data);
      });
    } else if (user.type === "agent") {
      setCurrentUser({
        ...user,
        _id: user._id,
      });
      socketClient.current.emit("add-user", user);
    }
  }, []);

  useEffect(() => {
    const onCreateRoom = async () => {
      return await createRoom({
        id: currentUser._id,
        type: currentUser.type,
      }).unwrap();
    };
    if (currentUser._id) {
      if (currentUser.type === "player") {
        onCreateRoom().then((result: any) => {
          onGetRooms(getRooms, setRooms, setRoom);
          console.log(result.data);

          socketClient.current.emit("new-room", result?.data);
        });
      } else if (currentUser.type === "agent") {
        onGetRooms(getRooms, setRooms);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      if (rooms.length && currentUser.type === "agent") {
        socketClient.current.emit("new-room-agent", rooms);
      }
    }
  }, [rooms, currentUser]);

  useEffect(() => {
    if (currentUser && currentUser?.type === "agent") {
      socketClient.current.on("new-room", () => {
        onGetRooms(getRooms, setRooms);
      });
      socketClient.current.on("new-messages", () => {
        onGetRooms(getRooms, setRooms);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser?.type === "player") {
      socketClient.current.on("new-messages", () => {
        onGetRooms(getRooms, setRooms, setRoom);
      });
    }
  }, [currentUser]);

  const onOpenImageModal = (link: string) => {
    setImageLink(link);
  };

  const onJoinRoom = (room: IRoom) => {
    setRoom(room);
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
            roomsData={rooms}
            currentUser={currentUser}
            onJoinRoom={onJoinRoom}
            onClose={() => userDrawer.toggle()}
          />
        </Drawer>
      ) : (
        <ChatUsers
          roomsData={rooms}
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
        <Box height="40px">
          {currentUser && room && (
            <Box
              width="100%"
              paddingX={2}
              paddingY={1}
              display="flex"
              alignItems="center"
              boxSizing="border-box"
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
                {room?.createdBy.username || currentUser?.username}
              </Typography>
            </Box>
          )}
        </Box>
        <Box height="100%">
          <Messages
            socketClient={socketClient?.current}
            onOpenImageModal={onOpenImageModal}
            currentUser={currentUser}
            room={room}
          />
          <BottomHandler
            currentUser={currentUser}
            room={room}
            socketClient={socketClient?.current}
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
