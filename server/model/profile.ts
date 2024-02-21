import { H3Event, H3Error } from "h3";
import { getProfile, updateProfile, deleteAccount } from "../query/profile";
import { JSONResponse, User, Session } from "~/types/auth";
import { getUserSession } from "~/utils/sessions";
import { validateCsrfToken } from "~/utils/tokens"; 

export async function profile(event: H3Event): Promise<JSONResponse> {
  const response = {} as JSONResponse;
  let sessionOrError = {} as Session | H3Error;
  const profileOrError = await getProfile(event);

  if (profileOrError instanceof H3Error) {
    response.status = "fail";
    response.error = profileOrError;
    return response;
  }

  const profile = profileOrError as User;

  // Get csrf token from using session id token
  const sessionId = getCookie(event, "iam-sid");
  if (sessionId) sessionOrError = await getUserSession(sessionId);

  // If error, return error
  if (sessionOrError instanceof H3Error) {
    console.log("Error getting user session");
    response.status = "fail";
    response.error = response.error = createError({
      statusCode: 500,
      statusMessage: "Server error",
    });
  }

  // Otherwise get session and csrf token
  const session = sessionOrError as Session;
  profile.csrf_token = session.csrf_token;

  // Return response
  response.status = "success";
  response.data = profile;

  return response;
}

/**
 * @desc Updates and returns updated profile of authenticated user
 * @param event H3 Event passed from api
 * @returns {Promise<JSONResponse>}
 */
export async function update(event: H3Event): Promise<JSONResponse> {
  const response = {} as JSONResponse;

  // Check if csrf token is valid
  const csrfTokenError = await validateCsrfToken(event);

  if (csrfTokenError instanceof H3Error) {
    console.log("Csrf token error");
    response.status = "fail";
    response.error = createError({
      statusCode: 403,
      statusMessage: "Missing or invalid csrf token",
    });
    return response;
  }

  const profileOrError = await updateProfile(event);

  if (profileOrError instanceof H3Error) {
    response.status = "fail";
    response.error = profileOrError;
    return response;
  }

  const profile = profileOrError as User;

  response.status = "success";
  response.data = profile;

  return response;
}

/**
 * @desc Deletes user's account
 * @param event H3 Event passed from api
 * @returns {Promise<JSONResponse>}
 */
export async function destroy(event: H3Event): Promise<JSONResponse> {
  const response = {} as JSONResponse;

  // Check if csrf token is valid
  const csrfTokenError = await validateCsrfToken(event);

  if (csrfTokenError instanceof H3Error) {
    console.log("Csrf token error");
    response.status = "fail";
    response.error = createError({
      statusCode: 403,
      statusMessage: "Missing or invalid csrf token",
    });
    return response;
  }

  // Attempt to delete account
  const deleteOrError = await deleteAccount(event);

  // If error in deleting user account, return error
  if (deleteOrError instanceof H3Error) {
    response.status = "fail";
    response.error = deleteOrError;
    return response;
  }

  const userDeleted = deleteOrError as boolean;

  // If false result, which shouldn't happen, return error
  if (userDeleted === false) {
    response.status = "fail";
    response.error = createError({
      statusCode: 500,
      statusMessage: "Error deleting user account",
    });
    return response;
  }

  // Otherwise delete was successful
  response.status = "success";

  return response;
}

