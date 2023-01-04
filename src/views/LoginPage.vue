<template>
    <div class="about">
        <h1>This is login page</h1>
        <Button type="primary" @click="goToHome">Add</Button>
    </div>
</template>

<script setup lang="ts">
import { Button } from 'ant-design-vue';
import router from "@/router";
const goToHome = ()=>{
    router.push("home")
}
</script>
<style>
@media (min-width: 1024px) {
    .about {
        min-height: 100vh;
        display: flex;
        align-items: center;
    }
}
</style>
  