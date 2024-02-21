<template>
    <div>
        ini halaman admin Lorem ipsum dolor sit amet consectetur adipisicing elit. Blanditiis, illum, vel repellendus dignissimos necessitatibus ipsam deleniti impedit praesentium officiis est ut iste autem inventore modi earum id molestiae at tempore.
    </div>
</template>

<script lang="ts" setup>
    const { isAuthenticated } = useAuth();
    const isLoggedIn = ref(false);

    onMounted(async () => {
        isLoggedIn.value = await isAuthenticated();
        if (!isLoggedIn.value) navigateTo("/login");
    });

    definePageMeta({
        layout: "admin"
    })
</script>