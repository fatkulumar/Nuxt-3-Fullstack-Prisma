import { type JSONResponse, type User } from "~/types/auth";

export default function useAuth() {
  return {
    register,
    login,
    logout,
    isAuthenticated,
  };
}

/**
 * @desc Register new user
 * @param user User to register
 * @returns {Promise<JSONResponse>}
 */

async function register(user: User): Promise<JSONResponse> {
  const response = await $fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "client-platform": "browser",
    },
    body: user,
  });

  return response;
}

async function login(user: User): Promise<JSONResponse> {
  const response = await $fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "client-platform": "browser",
    },
    body: user,
  });

  return response;
}

/**
 * @desc Returns true/false depending on whether the user is logged in or not
 * @returns {Promise<boolean>}
 */
async function isAuthenticated(): Promise<boolean> {
  // Api response always has status, data, or error
  const { status } = await $fetch("/api/auth/isauthenticated", {
    headers: {
      "client-platform": "browser",
    },
  });

  // If status is success, then user is authenticated, and return true, otherwise return false
  return status === "success";
}

/**
 * @desc Attempt to log user out
 * @returns {Promise<JSONResponse>}
 */
async function logout(): Promise<JSONResponse> {
  const response = await $fetch("/api/auth/logout", {
    method: "POST",
    headers: {
      "client-platform": "browser",
    },
  });

  return response;
}
