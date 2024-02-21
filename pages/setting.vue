<template>
  <div
    class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
  >
    <h5
      class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
    >
      <button class="bg-red-500 rounded-md px-2" @click="handleDeleteAccount">
        Delete Account
      </button>
    </h5>
    <p class="font-normal text-gray-700 dark:text-gray-400">
      Here are the biggest enterprise technology acquisitions of 2021 so far, in
      reverse chronological order.
    </p>
  </div>
  <div>
    <div
      v-if="profileError"
      id="alert-2"
      class="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
      role="alert"
    >
      <svg
        class="flex-shrink-0 w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"
        />
      </svg>
      <span class="sr-only">Info</span>
      <div class="ms-3 text-sm font-medium">
        <strong>{{ profileError?.message }}</strong>
      </div>
      <button
        @click="profileError = null"
        type="button"
        class="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
        data-dismiss-target="#alert-2"
        aria-label="Close"
      >
        <span class="sr-only">Close</span>
        <svg
          class="w-3 h-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 14 14"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
          />
        </svg>
      </button>
    </div>

    <form class="max-w-sm mx-auto" @submit.prevent="updatePassword(form)">
      <div class="mb-5">
        <label
          for="current_password"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >Current Password</label
        >
        <input
          type="text"
          name="current_password"
          v-model="form.current_password"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5bg-gray-700border-gray-600placeholder-gray-400text-whitefocus:ring-blue-500focus:border-blue-500"
          required
        />
      </div>

      <div class="mb-5">
        <label
          for="new_password"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >New Password</label
        >
        <input
          type="text"
          name="new_password"
          v-model="form.new_password"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5bg-gray-700border-gray-600placeholder-gray-400text-whitefocus:ring-blue-500focus:border-blue-500"
          required
        />
      </div>

      <div class="mb-5">
        <label
          for="confirm_password"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >Confirm Password</label
        >
        <input
          type="text"
          name="confirm_password"
          v-model="form.confirm_password"
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
import { initFlowbite } from 'flowbite'
export type User = {
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

type Passwords = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

const form = ref({
  current_password: "",
  new_password: "",
  confirm_password: "",
});

const { deleteAccount, updateProfile } = useProfile();
const profileStore = useProfileStore();
const profile = profileStore.getProfile as User;
const updateSuccessful = ref(false);

// Error variables
const profileError = ref(<Error | null>null);
const deleteError = ref(<Error | null>null);

async function handleDeleteAccount() {
  if (!profile.csrf_token) {
    profileError.value = {} as Error;
    profileError.value.message = "Missing csrf token";
    return;
  }

  const { error } = await deleteAccount(profile.uuid, profile.csrf_token);

  // If error, show error
  if (error) {
    deleteError.value = error;
    return;
  }

  // Clear store variables
  profileStore.setIsLoggedIn(false);
  profileStore.clearProfile();

  // Navigate to register
  navigateTo("/register");
}

// Attempt to update user profile with password
async function updatePassword(passwords: Passwords) {
  // Check if any password is not supplied
  if (
    !passwords.current_password ||
    !passwords.new_password ||
    !passwords.confirm_password
  ) {
    profileError.value = {} as Error;
    profileError.value.message = "All passwords must be supplied";
    return;
  }

  // Check if new password and confirm password are the same
  if (passwords.new_password !== passwords.confirm_password) {
    profileError.value = {} as Error;
    profileError.value.message =
      "New password and confirm password do no match";
    return;
  }

  // Update profile with current password and new password
  profile.current_password = passwords.current_password;
  profile.new_password = passwords.new_password;

  const { error } = await updateProfile(profile);

  // If error, display error
  if (error) {
    console.log("error: ", error);
    profileError.value = error;
    return;
  }

  updateSuccessful.value = true;

  alert("berhasil update password");
}

onMounted(() => {
    initFlowbite();
})

definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>