<template>
  <div>
    <form class="max-w-sm mx-auto" @submit.prevent="handleRegister(form)">
      <div class="mb-5">
        <label
          for="first_name"
          class="block mb-2 text-sm font-medium text-gray-900text-white"
          >First Name</label
        >
        <input
          type="text"
          name="first_name"
          v-model="form.first_name"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5bg-gray-700border-gray-600placeholder-gray-400text-whitefocus:ring-blue-500focus:border-blue-500"
          placeholder="name@flowbite.com"
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
          type="text"
          name="last_name"
          v-model="form.last_name"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5bg-gray-700border-gray-600placeholder-gray-400text-whitefocus:ring-blue-500focus:border-blue-500"
          required
        />
      </div>

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
const { register } = useAuth();
const form = ref({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
});

const handleRegister = async (user: any) => {
  const { status, error } = await register(user);

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
  }
};

definePageMeta({
  middleware: "guest",
});
</script>