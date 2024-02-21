import { PrismaClient } from "@prisma/client";
import { User } from "~/types/auth";
import { H3Event, H3Error } from "h3";
import { validateUserRegistration, validateUserLogin } from "~/utils/validators";
import { hashPassword, makeUuid } from "~/utils/passwords";
import { TokensSession } from "~/types/auth";
import { login, logout } from "~/utils/logins";
import { getClientPlatform } from "../checkHeader"
import { verifyAccessToken, getNewTokens } from "~/utils/tokens";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getUserByEmail } from "~/utils/users"; 
import dayjs from "dayjs";

const config = useRuntimeConfig();

const prisma = new PrismaClient();

/**
 * @desc Registers (creates) a new user in database
 * @param event H3Event
 * @return {Promise<string>} Returns user if successful and error if not successful
 */
export async function registerUser(event: H3Event): Promise<User | H3Error> {
  const validationError = await validateUserRegistration(event);  
  if (validationError) return validationError; 

  const body = await readBody(event);

  // Attempt to hash password, if error, return error
  const hashedPasswordOrError = await hashPassword(body.password);
  if (hashedPasswordOrError instanceof H3Error) return hashedPasswordOrError;

  // If no password hash error, get password as string
  const hashedPassword = hashedPasswordOrError as string;

  let user = {};

  let registrationError = null;
  await prisma.users
    .create({
      data: {
        first_name: body.first_name.trim(),
        last_name: body.last_name.trim(),
        uuid: makeUuid(),
        email: body.email,
        password: hashedPassword,
      },
    })
    .then(async (response) => {
      user = response;
    })
    .catch(async (e) => {
      console.error(e);
      registrationError = e;
    });

  if (registrationError)
    throw createError({
      statusCode: 500,
      statusMessage: "Server error",
    });

  // Create api result
  const newUser = user as User;
  return newUser;
}

export async function loginUser(
  event: H3Event
): Promise<TokensSession | H3Error> {
  const validateError = await validateUserLogin(event);
  if (validateError instanceof H3Error) return validateError;

  const loginErrorOrTokens = await login(event);
  if (loginErrorOrTokens instanceof H3Error) return loginErrorOrTokens;

  const tokens = loginErrorOrTokens as TokensSession;

  return tokens;
}

export async function logoutUser(event: H3Event): Promise<boolean | H3Error> {
  const error = await logout(event);
  if (error instanceof H3Error) return error;

  // Create api result
  return true;
}

/**
 * @desc Checks if user is authenticated (checks if access token is still valid)
 * @param event
 * @returns {Promise<boolean | H3Error>} Returns true or false or error
 */
export async function isAuthenticated(
  event: H3Event
): Promise<boolean | H3Error> {
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
  else if (["browser", "browser-dev"].includes(platform)) {
    accessToken = getCookie(event, "iam-access-token") as string;
  }

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
  const errorOrUser = verifyAccessToken(accessTokenArr[1]);

  // If error is an expired access token, attempt to reauthenticate
  if (errorOrUser instanceof jwt.TokenExpiredError) {
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

    const errorOrPlatform = getClientPlatform(event);
    if (errorOrPlatform instanceof H3Error) return errorOrPlatform;

    // Get access token from header or cookie
    const platform = errorOrPlatform as string;

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

    // Return authenticated
    console.log("Reauthentication successful");
    return true;
  }

  // If other error, return error
  if (errorOrUser instanceof H3Error) {
    console.log("Error: ", errorOrUser);
    return false;
  } else {
    // Otherwise, we have the user so return true
    return true;
  }
}
