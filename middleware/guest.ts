export default defineNuxtRouteMiddleware(async (to, from) => {
  const profileStore = useProfileStore();
  async function getProfile() {
    await profileStore.getMyProfile().then((result) => {
      if(!result) {
        navigateTo(to, { replace: true })
      }else{
        navigateTo('/admin', { replace: true })
        console.log("ini result dari default :" + result)
      }
    }); 
  }
  getProfile();
});
