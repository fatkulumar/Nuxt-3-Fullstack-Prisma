import { type User, type JSONResponse } from "~/types/auth";

export default function useProfile() {
  return {
    getProfile,
    updateProfile,
    deleteAccount,
  };
}

/**
 * @desc Get user profile
 * @returns {Promise<JSONResponse>}
 */
async function getProfile(): Promise<JSONResponse> {
  const response = await $fetch("/api/profile", {
    headers: {
      "client-platform": "browser",
    },
  });

  return response;
}

/**
 * @desc Update user profile
 * @returns {Promise<JSONResponse>}
 */

async function updateProfile(user: User): Promise<JSONResponse> {
  const response = await $fetch("/api/profile/update", {
    method: "PUT",
    headers: {
      "client-platform": "browser",
    },
    body: user,
  });

  return response;
}


/**
 * @desc Delete user account
 * @returns {Promise<JSONResponse>}
 */

async function deleteAccount(
  uuid: string,
  csrfToken: string
): Promise<JSONResponse> {
  const response = await $fetch("/api/profile/delete", {
    method: "DELETE",
    headers: {
      "client-platform": "browser",
    },
    body: {
      uuid: uuid,
      csrf_token: csrfToken,
    },
  });

  return response;
}