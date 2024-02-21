/* Authentication controller
 * Routes all authentication requests
 */
import { createRouter, defineEventHandler } from "h3";
import { profile, update, destroy } from "../model/profile";

const router = createRouter();

// Get user profile
router.get(
  "/",
  defineEventHandler(async (event) => {
    return await profile(event);
  })
);

router.put(
  "/update",
  defineEventHandler(async (event) => {
    return await update(event);
  })
);

// Delete user profile
router.delete(
  "/delete",
  defineEventHandler(async (event) => {
    return await destroy(event);
  })
);

export default useBase("/api/profile", router.handler);
