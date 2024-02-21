<template>
  <div>
    <form class="max-w-sm mx-auto" @submit.prevent="handleLogin(form)">
      <div class="mb-5">
        <label
          for="email"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >Email</label
        >
        <input
          type="email"
          name="email"
          v-model="form.email"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5bg-gray-700border-gray-600placeholder-gray-400text-whitefocus:ring-blue-500focus:border-blue-500"
          placeholder="name@flowbite.com"
          required
        />
      </div>

      <div class="mb-5">
        <label
          for="password"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >Your password</label
        >
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5bg-gray-700border-gray-600placeholder-gray-400text-whitefocus:ring-blue-500focus:border-blue-500"
          required
        />
      </div>
      <button
        type="submit"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-centerbg-blue-600hover:bg-blue-700focus:ring-blue-800"
      >
        Submit
      </button>
    </form>
  </div>
</template>
  
  <script setup lang="ts">
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

const profileStore = useProfileStore();
const profile = ref(<User>{});
profile.value = profileStore.getProfile as User;

const { login } = useAuth();
const { getProfile } = useProfile();
const getProfileError = ref(<Error | null>null);
const emailIsVerified = ref(false);
const form = ref({
  email: "",
  password: "",
});

const handleLogin = async (user: any) => {
  const { status, error } = await login(user);

  // If we get an error
  if (error) {
    alert(error);
    console.log(error);
  }

  // If successful, show success message, wait, then navigate to login page
  if (status === "success") {
    setTimeout(() => {
      navigateTo("/admin/");
    }, 1000);
    await getMyProfile();
  }
};

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
    profileStore.setProfile(data);
    profileStore.setIsLoggedIn(true);
    profileStore.setUpdateCount();
  }
}

onMounted(async () => {
  await getMyProfile();
});

definePageMeta({
  middleware: "auth"
})
</script>