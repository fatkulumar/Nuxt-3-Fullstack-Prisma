import { H3Event, H3Error } from "h3";
import { registerUser, loginUser, logoutUser, isAuthenticated } from "../query/auth";
import { JSONResponse, User, TokensSession, Session } from "~/types/auth";
import { getClientPlatform } from "../checkHeader"
import dayjs from "dayjs";

/**
 * @desc Registers (creates) a new user in database
 * @param event H3 Event passed from api
 * @returns {Promise<JSONResponse>} Object mentioning success or failure of registering user or error
 */
export async function register(event: H3Event): Promise<JSONResponse> {
  let response = {} as JSONResponse;
  const userOrError = await registerUser(event);

  // If error is returned
  if (userOrError instanceof H3Error) {
    response.status = "fail";
    response.error = userOrError;
    return response;
  }

  // Otherwise return user email
  const user = userOrError as User;
  response.status = "success";
  response.data = {
    email: user.email,
  };

  return response;
}

export async function login(event: H3Event): Promise<JSONResponse> {
  const response = {} as JSONResponse;
  // Check client platform first
  const errorOrPlatform = getClientPlatform(event);

  // If error, return error
  if (errorOrPlatform instanceof H3Error) {
    // Delete tokens
    deleteCookie(event, "iam-access-token");
    deleteCookie(event, "iam-refresh-token");
    deleteCookie(event, "iam-sid");

    response.status = "fail";
    response.error = errorOrPlatform;
    return response;
  }

  // Otherwise get platform
  const platform = errorOrPlatform as string;

  const errorOrTokens = await loginUser(event);

  // If error, return error
  if (errorOrTokens instanceof H3Error) {
    // Delete tokens
    deleteCookie(event, "iam-access-token");
    deleteCookie(event, "iam-refresh-token");
    deleteCookie(event, "iam-sid");

    response.status = "fail";
    response.error = errorOrTokens;
    return response;
  }

  //Otherwise get tokens
  const tokens = errorOrTokens as TokensSession;

  // If platform is iam dev/production, set tokens in header
  if (platform === "iam") {
    setHeader(event, "iam-access-token", "Bearer " + tokens.accessToken);
    setHeader(event, "iam-refresh-token", "Bearer " + tokens.refreshToken);
    if (tokens.sid) setHeader(event, "iam-sid", tokens.sid);
  }

  // If platform is browser production, set tokens in secure, httpOnly cookies
  if (platform === "browser") {
    setCookie(event, "iam-access-token", "Bearer " + tokens.accessToken, {
      httpOnly: true,
      secure: true,
    });

    // Cookies containing refresh tokens expire in 14 days, unless refreshed and new tokens obtained
    // Refresh tokens themselves expire in 14 days, unless new tokens are obtained
    setCookie(event, "iam-refresh-token", "Bearer " + tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      expires: dayjs().add(14, "day").toDate(),
    });

    // Set session id in cookie
    if (tokens.sid) setCookie(event, "iam-sid", tokens.sid);
  }

  // Development cookies are not secure. Use only in development
  if (platform === "browser-dev") {
    setCookie(event, "iam-access-token", "Bearer " + tokens.accessToken, {
      // Access tokens themselves expire in 15 mins
      expires: dayjs().add(1, "day").toDate(),
    });
    setCookie(event, "iam-refresh-token", "Bearer " + tokens.refreshToken, {
      expires: dayjs().add(1, "day").toDate(),
    });

    // Set session id token in cookie
    if (tokens.sid) setCookie(event, "iam-sid", tokens.sid);
  }

  // Create api result
  const body = await readBody(event);

  // If all is successful
  response.status = "success";
  response.data = {
    email: body.email,
  };
  return response;
}

export async function isauthenticated(event: H3Event): Promise<JSONResponse> {
  const authenticated = await isAuthenticated(event);
  const response = {} as JSONResponse;

  if (authenticated instanceof H3Error) {
    response.status = "fail";
    response.error = authenticated;
  }

  if (authenticated === false) {
    response.status = "fail";
  }

  if (authenticated === true) {
    response.status = "success";
  }

  return response;
}

/**
 * @desc Log user out
 * @param event H3 Event passed from api
 * @returns {Promise<JSONResponse>} Object mentioning success or failure of logging user out
 */
export async function logout(event: H3Event): Promise<JSONResponse> {
  const response = {} as JSONResponse;
  const errorOrTrue = await logoutUser(event);

  // If error, return error
  if (errorOrTrue instanceof H3Error) {
    response.status = "fail";
    response.error = errorOrTrue;
    return response;
  }

  // Otherwise return successful logout response
  response.status = "success";
  return response;
}