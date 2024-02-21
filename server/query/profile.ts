import { PrismaClient } from "@prisma/client";
import { User } from "~/types/auth";
import { H3Event, H3Error } from "h3";
import { TokensSession } from "~/types/auth";
import { getClientPlatform } from "../checkHeader";
import { verifyAccessToken, getNewTokens } from "~/utils/tokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUserByEmail } from "~/utils/users";
import dayjs from "dayjs";
import { updateUserProfile, getUserByUuid } from "~/utils/users";
import { deactivateUserSessions } from "~/utils/sessions"; 

const prisma = new PrismaClient();

export async function getProfile(event: H3Event): Promise<User | H3Error> {
  let accessToken = null;

  // Get client platform
  const errorOrPlatform = getClientPlatform(event);
  if (errorOrPlatform instanceof H3Error) return errorOrPlatform;

  // If app, get token from header
  const platform = errorOrPlatform as string;
  if (platform === "app")
    // If browser, get token from cookies
    accessToken = event.node.req.headers["iam-access-token"] as string;
  else if (["browser", "browser-dev"].includes(platform))
    accessToken = getCookie(event, "iam-access-token") as string;

  // If no token, user is not authenticated
  if (!accessToken) {
    console.log("Error: No access token provided");
    return createError({
      statusCode: 400,
      statusMessage: "No access token provided",
    });
  }

  // Parse Bearer token (Bearer xxxx)
  const accessTokenArr = accessToken.split(" ");

  // Verify access token
  const errorOrJwtPayload = verifyAccessToken(accessTokenArr[1]);

  // If error is an expired access token, attempt to reauthenticate
  if (errorOrJwtPayload instanceof jwt.TokenExpiredError) {
    console.log("Yes, attempt to reauthenticate");
    const errorOrTokens = await getNewTokens(event);

    // If get an error, reauthentication failed
    if (errorOrTokens instanceof H3Error) {
      console.log("Reauthentication failed");
      return createError({
        statusCode: 500,
        statusMessage: "Reauthentication failed. Login required.",
      });
    }

    // Otherwise, get tokens
    const tokens = errorOrTokens as TokensSession;

    // If platform is app dev/production, set tokens in header
    if (platform === "app") {
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

      // Set session id
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

      // Set session id
      if (tokens.sid) setCookie(event, "iam-sid", tokens.sid);
    }
  }

  // If other error, return error
  if (errorOrJwtPayload instanceof H3Error) {
    console.log("Error: ", errorOrJwtPayload);
    return errorOrJwtPayload;
  } else {
    // Otherwise, return the user
    const jwtUser = errorOrJwtPayload as JwtPayload;
    const user = await getUserByEmail(jwtUser.email);

    // If no user
    if (!user) {
      console.log("Failed obtaining user from getUserByEmail");
      return createError({
        statusCode: 500,
        statusMessage: "Failed to obtain user profile",
      });
    }

    // If we have the user, but user is not active, return error
    if (!user.is_active)
      return createError({
        statusCode: 403,
        statusMessage:
          "Forbidden. Account has been deactivated. Please contact your administrator.",
      });

    // Otherwise, hide password (password is one-way hashed and cannot be retrieved from hash anyway, it just looks nicer) return the user
    user.password = "[hidden]";
    return user;
  }
}

export async function updateProfile(event: H3Event): Promise<User | H3Error> {
  // Check client platform
  let accessToken = null;

  // Get client platform
  const errorOrPlatform = getClientPlatform(event);
  if (errorOrPlatform instanceof H3Error) return errorOrPlatform;

  // If app, get token from header
  const platform = errorOrPlatform as string;
  if (platform === "app")
    // If browser, get token from cookies
    accessToken = event.node.req.headers["iam-access-token"] as string;
  else if (["browser", "browser-dev"].includes(platform))
    accessToken = getCookie(event, "iam-access-token") as string;

  // If no token, user is not authenticated
  if (!accessToken) {
    console.log("Error: No access token provided");
    return createError({
      statusCode: 400,
      statusMessage: "No access token provided",
    });
  }

  // Parse Bearer token (Bearer xxxx)
  const accessTokenArr = accessToken.split(" ");

  // Verify access token
  const errorOrJwtPayload = verifyAccessToken(accessTokenArr[1]);

  // If error is an expired access token, attempt to reauthenticate
  if (errorOrJwtPayload instanceof jwt.TokenExpiredError) {
    console.log("Yes, attempt to reauthenticate");
    const errorOrTokens = await getNewTokens(event);

    // If get an error, reauthentication failed
    if (errorOrTokens instanceof H3Error) {
      console.log("Reauthentication failed");
      return createError({
        statusCode: 500,
        statusMessage: "Reauthentication failed. Login required.",
      });
    }

    // Otherwise, get tokens
    const tokens = errorOrTokens as TokensSession;

    // If platform is app dev/production, set tokens in header
    if (platform === "app") {
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

      // Set session id
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

      // Set session id
      if (tokens.sid) setCookie(event, "iam-sid", tokens.sid);
    }
  }

  // If other error, return error
  if (errorOrJwtPayload instanceof H3Error) {
    console.log("Error: ", errorOrJwtPayload);
    return errorOrJwtPayload;
  } else {
    // Otherwise, return the user
    // const jwtUser = errorOrJwtPayload as JwtPayload;
    const errorOrUser = await updateUserProfile(event);
    if (errorOrUser instanceof H3Error) return errorOrUser;

    const user = errorOrUser as User;

    // Password hash is hidden
    user.password = "[hidden]";
    return user;
  }
}


/**
 * @desc Removes user from database
 * @param event H3Event
 */
export async function deleteAccount(
  event: H3Event
): Promise<boolean | H3Error> {
  const body = await readBody(event);
  const uuid = body.uuid;

  // If uuid not provided
  if (!uuid)
    return createError({
      statusCode: 400,
      statusMessage: "User uuid not provided",
    });

  // Get current user
  const nullOrUser = await getUserByUuid(uuid);
  if (!nullOrUser) {
    console.log(
      "User to delete from useIam not found. This should not happen."
    );
    return createError({
      statusCode: 500,
      statusMessage: "User not found",
    });
  }

  const user = nullOrUser as User;
  let deletedUser = null;
  let error = null;

  // First remove all user's refresh tokens
  await prisma.refresh_tokens
    .deleteMany({
      where: {
        user_id: user.id,
      },
    })
    .catch(async (e) => {
      console.error(e);
      error = e;
    });

  // If error deleting refresh tokens, return error
  if (error)
    return createError({
      statusCode: 500,
      statusMessage: "Server error. Failed to delete account.",
    });

  // Then remove user
  await prisma.users
    .delete({
      where: {
        uuid: uuid,
      },
    })
    .then(async (result) => {
      deletedUser = result;
    })
    .catch(async (e) => {
      console.error(e);
      error = e;
    });

  // If we encounter an error, return error
  if (error)
    return createError({
      statusCode: 500,
      statusMessage: "Server error with deleting account",
    });

  // Delete access and refresh cookies
  deleteCookie(event, "iam-access-token");
  deleteCookie(event, "iam-refresh-token");
  deleteCookie(event, "iam-sid");

  // Deactivate user's sessions
  const deactivateSessionsError = await deactivateUserSessions(user.id);
  if (deactivateSessionsError instanceof H3Error)
    return deactivateSessionsError;

  // If we have a user, return the boolean
  if (deletedUser) return true;
  // otherwise return false (which shouldn't happen)
  else {
    console.log(
      "This shouldn't happen: Returning false in deleting user from profile"
    );
    return false;
  }
}