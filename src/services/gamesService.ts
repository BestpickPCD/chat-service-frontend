import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReAuth } from "./baseQuery";
export const GamesService = createApi({
  reducerPath: "GamesService",
  baseQuery: baseQueryWithReAuth,
  endpoints: (builder) => ({
    checkUser: builder.mutation<any, any>({
      query: (body) => ({
        url: "/user/check-user",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const { useCheckUserMutation } = GamesService;
