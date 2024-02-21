// Pinia store to store user profile
//! Do not store sensitive data in here.
//! Avoid storing permissions. Rather, always check permissions from backend.

import { type User } from "~/types/auth";
import { defineStore } from "pinia";
const { getProfile: profileGetter } = useProfile();

export const useProfileStore = defineStore("useProfileStore", () => {
  const myProfile = ref(<User | null>null);
  const isLoggedIn = ref(false);
  const updateCount = ref(0);

  const getProfileError = ref(<Error | null>null);
  const emailIsVerified = ref(false);

  // Returns the profile
  const getProfile = computed(() => myProfile.value);

  /**
   * @desc Sets profile
   * @param profile
   */
  function setProfile(profile: User) {
    if (profile) myProfile.value = profile;
  }

  /**
   * @desc Sets whether user is logged in
   */
  function setIsLoggedIn(value: boolean) {
    isLoggedIn.value = value;
  }

  /**
   * @desc Clears profile
   */
  function clearProfile() {
    myProfile.value = null;
  }

  /**
   * @desc Increases updateCount whenever an update is made
   */
  function setUpdateCount() {
    updateCount.value++;
  }
``
  async function getMyProfile() {
    const { status, error, data } = await profileGetter();
    // If error, show error
    if (error) {
      console.log("error: ", error);
      getProfileError.value = error;
      return;
    }
  
    // If successful, data will contain profile
    if (status === "success" && data) {
      myProfile.value = data as User;
  
      // Check email verification status
      emailIsVerified.value = data.email_verified;
  
      // Store user profile
      setProfile(data);
      setIsLoggedIn(true);
      setUpdateCount();
      return data
    }
  }

  return {
    setProfile,
    getProfile,
    setIsLoggedIn,
    isLoggedIn,
    clearProfile,
    setUpdateCount,
    updateCount,
    getMyProfile,
  };
});
