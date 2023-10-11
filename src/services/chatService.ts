import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithoutTokenChat } from "./baseQuery";
export const ChatService = createApi({
  reducerPath: "ChatService",
  baseQuery: baseQueryWithoutTokenChat,
  endpoints: (builder) => ({
    createRoom: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/rooms",
        method: "POST",
        body,
      }),
    }),
    updateRoom: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/rooms",
        method: "PUT",
        body,
      }),
    }),
    getRooms: builder.query<any, any>({
      query: (params) => ({
        url: "/api/v1/rooms",
        params,
      }),
    }),
    getMessage: builder.query<any, any>({
      query: (params) => ({
        url: "/api/v1/messages",
        params,
      }),
    }),
    saveChat: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/messages",
        body,
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }),
    }),
  }),
});

export const {
  useCreateRoomMutation,
  useGetMessageQuery,
  useSaveChatMutation,
  useGetRoomsQuery,
  useUpdateRoomMutation,
} = ChatService;
