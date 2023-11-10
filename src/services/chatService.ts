import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReAuthChat } from "./baseQuery";
export const ChatService = createApi({
  reducerPath: "ChatService",
  baseQuery: baseQueryWithReAuthChat,
  endpoints: (builder) => ({
    login: builder.mutation<any, any>({
      query: ({ username, password }) => ({
        url: "/api/v1/login",
        method: "POST",
        body: { username, password },
      }),
    }),
    checkUser: builder.mutation<any, any>({
      query: (body) => ({
        url: "/api/v1/check-user",
        method: "POST",
        body,
      }),
    }),
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
    getRoomById: builder.mutation<any, any>({
      query: ({ id }) => ({
        url: `/api/v1/rooms/${id}`,
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
  useLazyGetRoomsQuery,
  useUpdateRoomMutation,
  useCheckUserMutation,
  useLoginMutation,
  useGetRoomByIdMutation,
} = ChatService;
