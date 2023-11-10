import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

export const baseQuery = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
});

export const baseQueryWithoutToken = fetchBaseQuery({
  baseUrl: `${process.env.REACT_APP_API_URL}`,
});

export const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    const refreshArgs = {
      url: "/get-refresh-token",
      body: {
        refreshToken: JSON.parse(localStorage.getItem("tokens") || "").token
          .refreshToken,
      },
      method: "POST",
    };
    try {
      const refreshResult: any = await baseQuery(
        refreshArgs,
        api,
        extraOptions
      );
      if (refreshResult.data) {
        localStorage.setItem(
          "tokens",
          JSON.stringify({ token: refreshResult.data.data })
        );
        result = await baseQuery(args, api, extraOptions);
        console.log(result);
      } else {
        window.location.href = "/";
        localStorage.removeItem("tokens");
        localStorage.removeItem("user");
      }
    } catch (error) {
      window.location.href = "/";
      localStorage.removeItem("tokens");
      localStorage.removeItem("user");
    }
  }
  return result;
};

export const baseQueryChat = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_CHAT_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem("tokens");
    if (token) {
      const tokenParse = JSON.parse(token);
      const { token: refreshAndAccess } = tokenParse;
      headers.set("Authorization", `Bearer ${refreshAndAccess?.accessToken}`);
    }
    return headers;
  },
});

export const baseQueryWithReAuthChat: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const tokensLocal = localStorage.getItem("tokens");
  let result = await baseQueryChat(args, api, extraOptions);
  if (tokensLocal) {
    const token = JSON.parse(tokensLocal);
    if (result.error && result.error.status === 401) {
      const refreshArgs = {
        url: "/api/v1/refresh-token",
        body: {
          refreshToken: token?.token?.refreshToken,
        },
        method: "POST",
      };
      try {
        const refreshResult: any = await baseQueryChat(
          refreshArgs,
          api,
          extraOptions
        );
        if (refreshResult.data) {
          localStorage.setItem(
            "tokens",
            JSON.stringify({ token: refreshResult.data.data })
          );
          result = await baseQueryChat(args, api, extraOptions);
          if (result.error && result.error.status === 401) {
            window.location.href = "/";
            localStorage.removeItem("tokens");
            localStorage.removeItem("user");
          }
        } else {
          window.location.href = "/";
          localStorage.removeItem("tokens");
          localStorage.removeItem("user");
        }
      } catch (error) {
        window.location.href = "/";
        localStorage.removeItem("tokens");
        localStorage.removeItem("user");
      }
    }
  }
  return result;
};

export const baseQueryWithoutTokenChat = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_CHAT_URL,
});
