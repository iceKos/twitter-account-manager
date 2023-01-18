<template>
  <LoadingScreen v-if="globalStore.$state.loading" />
  <RouterView />
</template>

<script lang="ts">
import { RouterView } from 'vue-router'

import { useGlobalStore } from "@/stores/global"
import { defineComponent } from 'vue';
import LoadingScreen from "@/components/LoadingScreen.vue"
export default defineComponent({
  components: {
    LoadingScreen
  },
  created() {

  },
  setup() {
    var globalStore = useGlobalStore()
    return {
      globalStore
    }
  }
})

</script>

<style>
@import '@/assets/base.css';
header {
  line-height: 1.5;
  max-height: 100vh;
}

a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1) !important;
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {

  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}

.ant-btn>span>svg{
    margin-top: -6px;
}
</style>
