<template>

  <a-layout style="width: 100%;">
    <a-layout-header class="header">
      <div class="logo"> <router-link to="/home">Nakamoto Twitter</router-link></div>
      <div>
        <a-button type="primary" @click="globalStore.openDrawerRight()">
          OpenAI</a-button>
      </div>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <a-menu v-model:selectedKeys="selectedKeys2" v-model:openKeys="openKeys" mode="inline"
          :style="{ height: '100%', borderRight: 0 }">

          <a-sub-menu key="sub2" ref="menu_twitter_account" id="menu_twitter_account">
            <template #title>
              <span>
                <twitter-outlined class="icon-custom-position" />
                <span>Twitter Account</span>
              </span>
            </template>
            <a-menu-item v-for="(account, index) in accountTwitterStore.getFavoriteAccount()" :key="account.id"
              @click="goTo(`/home/account/${account.id}`)">
              <span :style="{ color: (account.access_token == null) ? 'rgb(255 40 40)' : 'none' }">{{
                account.name
              }}</span></a-menu-item>
            <a-menu-item key="create-account" @click="createAccount()">
              <span>
                <plus-square-outlined class="icon-custom-position" />
                <span>Create Account</span>
              </span>
            </a-menu-item>
          </a-sub-menu>

        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-breadcrumb style="margin: 16px 0">
          <a-breadcrumb-item v-for="(item, index) of breadcrumb" :key="index">{{ item }}</a-breadcrumb-item>
        </a-breadcrumb>
        <a-layout-content :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }">

          <AccountListCard v-if="$route.path == '/home'" />
          <router-view v-else :key="$route.path" />
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
  <a-drawer v-model:visible="globalStore.$state.drawer_right" class="custom-class" size="large" title="OpenAI"
    placement="right">
    <OpenAI />
  </a-drawer>
</template>
<script lang="ts">
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
import { UserOutlined, TwitterOutlined, PlusSquareOutlined, NotificationOutlined } from '@ant-design/icons-vue';
import { defineComponent, ref } from 'vue';
import { RouterView } from 'vue-router'
import router from "@/router";
import axios from "axios"
import { useAccountTwitterStore } from "@/stores/account_twitter.store"
import { useGlobalStore } from '@/stores/global';
import OpenAI from "@/components/OpenAI.vue"
import AccountListCard from "@/views/HomeView/AccountListCard.vue"
export default defineComponent({
  components: {
    UserOutlined,
    TwitterOutlined,
    NotificationOutlined,
    PlusSquareOutlined,
    OpenAI,
    AccountListCard
  },
  watch: {
    $route(to, from) {
      this.setBreadcrumb(to.fullPath)
    },
    'accountTwitterStore.$state.account_favorite': {
      handler: function (newVal) {
        localStorage.setItem("account_favorite", JSON.stringify(newVal));
      },
      deep: true
    },
  },
  async created() {
    this.setBreadcrumb(this.$route.fullPath)
    this.accountTwitterStore.fetchTwitterAccount() 
  }
  ,
  methods: {
    goTo(path: string) {
      router.push(path)
    },
    setBreadcrumb(full_path: string) {
      var breadcrumb: string[] = full_path.split("/").map((x) => {
        return capitalizeFirstLetter(x).replace(new RegExp("-", "ig"), " ").split(" ").map((x) => { return capitalizeFirstLetter(x) }).join(" ")
      })
      breadcrumb.shift()
      this.breadcrumb = breadcrumb
    },
    async getAllTwiterAccount() {
      axios.get(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/get_twitter_account")
        .then((data: any) => {
          var { data } = data
          // this.twitter_account = data.data
          this.accountTwitterStore.setListAccount(data.data)
        })
    },
    async createAccount() {
      axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/create_twitter_account", { name: "New Account" })
        .then(async (data: any) => {
          this.accountTwitterStore.fetchTwitterAccount()
        })
    },
    checkFavorite(user_id: string) {
      if (this.accountTwitterStore.$state.account_favorite.includes(user_id)) {
        return true
      }
      return false
    }
  },
  data(): { breadcrumb: string[], twitter_account: any[] } {
    return {
      breadcrumb: [],
      twitter_account: []
    }
  },
  setup() {
    var accountTwitterStore = useAccountTwitterStore()
    var globalStore = useGlobalStore()
    return {
      selectedKeys1: ref<string[]>(['1']),
      selectedKeys2: ref<string[]>(['1']),
      collapsed: ref<boolean>(false),
      openKeys: ref<string[]>(['sub2']),
      accountTwitterStore,
      globalStore
    };
  }
});
</script>
<style>
.logo {
  color: white;
  font-size: 1.2em;
}

#components-layout-demo-top-side-2 .logo {
  float: left;
  width: 120px;
  height: 31px;
  margin: 16px 24px 16px 0;
  background: rgba(255, 255, 255, 0.3);

}

.ant-row-rtl #components-layout-demo-top-side-2 .logo {
  float: right;
  margin: 16px 0 16px 24px;
}

.site-layout-background {
  background: #fff;
}

.icon-custom-position {
  font-size: 20px !important;
}

li[data-menu-id='create-account'] {
  padding-left: 0px;
}

.header {
  justify-content: space-between;
}
</style>