/* Authentication controller
 * Routes all authentication requests
 */
import { createRouter, defineEventHandler } from "h3";
import {
  register,
  login,
  logout,
  isauthenticated,
} from "../model/auth";

const router = createRouter();

// Get user profile
router.post(
  "/register",
  defineEventHandler(async (event) => {
    return await register(event);
  })
);

router.post(
  "/login",
  defineEventHandler(async (event) => {
    return await login(event);
  })
);

router.get(
  "/isauthenticated",
  defineEventHandler(async (event) => {
    return await isauthenticated(event);
  })
);

// logout
router.post(
  "/logout",
  defineEventHandler(async (event) => {
    return await logout(event);
  })
);

export default useBase("/api/auth", router.handler);
