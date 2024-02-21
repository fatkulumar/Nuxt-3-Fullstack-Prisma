export default defineNuxtRouteMiddleware(async (to, from) => {
  const profileStore = useProfileStore();
  async function getProfile() {
    await profileStore.getMyProfile().then((result) => {
      if(result) {
        console.log("ini result dari default :" + result.id)
        // navigateTo('/admin', { replace: true })
      }else{
        navigateTo('/login', { replace: true })
      }
    }); 
  }
  getProfile();
});
