<template>
  <div class="mt-12">

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

    <form class="max-w-sm mx-auto" @submit.prevent="updateMyProfile(form)">
      <div class="mb-5">
        <label
          for="first_name"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >First Name</label
        >
        <input
          v-model="form.first_name"
          type="text"
          name="first_name"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5bg-gray-700border-gray-600placeholder-gray-400text-whitefocus:ring-blue-500focus:border-blue-500"
          required
        />
      </div>

      <div class="mb-5">
        <label
          for="last_name"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >Last Name</label
        >
        <input
          v-model="form.last_name"
          type="text"
          name="last_name"
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

const { updateProfile } = useProfile()
const profileStore = useProfileStore()
profileStore.getMyProfile()

const profile = (async () => {
  await profileStore.getMyProfile().then((result: object) => {
    form.value.first_name = result.first_name
    form.value.last_name = result.last_name
    form.value.uuid = result.uuid
    form.value.csrf_token = result.csrf_token
  })
})

onMounted(async () => {
  await profile()
})

const form = ref({
  first_name: "",
  last_name: "",
  uuid: "",
  csrf_token: "",
})

const profileError = ref( < Error | null > null);
const updateSuccessful = ref(false);

const csrfToken = form.value.csrf_token;
const uuid = form.value.uuid;

async function updateMyProfile(profile: User) {

    const {  status, error, data } = await updateProfile(profile);

    // If error, display error
    if (error) {
        console.log("error: ", error);
        profileError.value = error;
        return;
    }

    updateSuccessful.value = true;
    if(status === 'success') alert('berhasil update')

}

definePageMeta({
  layout: "admin"
})
</script>