import authController from "../../controller/auth";

export default defineEventHandler(async (event) => {
  return authController(event);
});
