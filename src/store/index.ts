import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { ChatService } from "../services/chatService";
import { GamesService } from "../services/gamesService";
const store = configureStore({
  reducer: {
    [GamesService.reducerPath]: GamesService.reducer,
    [ChatService.reducerPath]: ChatService.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      GamesService.middleware,
      ChatService.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export default store;
