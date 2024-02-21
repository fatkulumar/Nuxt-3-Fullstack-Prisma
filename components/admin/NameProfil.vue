<template>
    <div class="cursor-pointer">
        {{ first_name }} {{ last_name }}
    </div>
</template>

<script lang="ts" setup>
type User = {
  id: number;
  first_name: string;
  last_name: string;
  uuid: string;
  email: string;
  password: string;
  permissions: string | null;
  avatar?: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "GENERAL";
  csrf_token?: string;
  current_password?: string;
  new_password?: string;
  email_verified: boolean;
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
};

const { getProfile } = useProfile();
const prfileStore = useProfileStore();
const getProfileError = ref(<Error | null>null);
const emailIsVerified = ref(false);
const profile = ref(<User>{});
profile.value = prfileStore.getProfile as User;
const first_name = ref()
const last_name = ref()

async function getMyProfile() {
  const { status, error, data } = await getProfile();

  // If error, show error
  if (error) {
    console.log("error: ", error);
    getProfileError.value = error;
    return;
  }

  // If successful, data will contain profile
  if (status === "success" && data) {
    profile.value = data as User;

    // Check email verification status
    emailIsVerified.value = data.email_verified;

    // Store user profile
    prfileStore.setProfile(profile.value);
    prfileStore.setIsLoggedIn(true);
    prfileStore.setUpdateCount();
    first_name.value = data.first_name
    last_name.value = data.last_name
  }
}

onMounted(async () => {
  await getMyProfile();
});
</script>