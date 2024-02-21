import profileController from "../../controller/profile";

export default defineEventHandler(async (event) => {
  return profileController(event);
});
