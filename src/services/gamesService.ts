import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReAuth } from "./baseQuery";
export const GamesService = createApi({
  reducerPath: "GamesService",
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    checkUser: builder.mutation<any, any>({
      query: ({ id, header }) => ({
        url: "/user/check-user",
        method: "POST",
        body: { id },
        headers: {
          Authorization: "Bearer " + JSON.parse(header)?.token.accessToken,
        },
      }),
    }),
  }),
});

export const { useCheckUserMutation } = GamesService;
