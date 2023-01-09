<template>
    <div style="display:flex;justify-content: end;padding:0px 22px 0px 22px;">
        <a-popconfirm title="you want to create new acount?" ok-text="Yes" cancel-text="No" @confirm="createAccount()">
            <a-button style="margin-right:10px;" >Create Account</a-button>
        </a-popconfirm>
        <div>
            <a-input-search v-model:value="search_value" placeholder="search account" style="width: 200px"
                @search="() => { }" />
        </div>
    </div>
    <div id="box-all-account">
        <a-row>
            <a-col style="padding:20px;" :lg="6" :md="12" :sm="12" :xs="24" v-for="(account, index) in accountTwitterStore.getTwitterAccount().filter((x: any) => {
                return new RegExp(search_value, 'ig').test(x.name + x.username)
            })" :key="account.id">
                <!-- <router-link :to="'/home/account/' + account.id"> -->
                <div class="card-account" style="position: relative;">
                    <div style="text-align:center">
                        <a-avatar style="border:0.5px solid #d2d2d2" :size="130" :src="account.profile_image_url" />
                    </div>
                    <div style="text-align:center;font-size:18px;font-weight: 600;margin-top:10px;color:#001529;">
                        {{ account.name }}
                    </div>
                    <div style="text-align:center;font-size:16px;font-weight: 300;margin-top:0px;color: #7a7474;">
                        <span @click="goToAccount(account.username)" style="cursor: pointer;">@{{ account.username }}</span>
                    </div>

                    <HeartFilled @click="accountTwitterStore.accountFavorite(account.id)"
                        :class="{ favorite: checkFavorite(account.id), heart: true }"
                        style="font-size:22px;position:absolute;right:20px;top:20px;" />

                    <!-- </router-link> -->
                    <div style="position:absolute;width: 100%;bottom: 10px;left: 0px;">
                        <div style="display: flex;justify-content:space-around">
                            <a-popconfirm title="Are you sure delete this Account?" ok-text="Yes" cancel-text="No"
                                @confirm="confirmDelete(account.id)">
                                <a-button type="primary" danger ghost>Delete Account</a-button>
                            </a-popconfirm>
                            <router-link :to="'/home/account/' + account.id" v-if="account.access_token != null">
                                <a-button type="primary" ghost>View Account</a-button>
                            </router-link>
                            <a-button v-else @click="authenTwitterApp(account.authentication_url)"
                                type="primary">Authorize App</a-button>
                        </div>
                    </div>
                </div>
            </a-col>
        </a-row>
    </div>
</template>
<script lang="ts">
import { useAccountTwitterStore } from "@/stores/account_twitter.store"
import { useGlobalStore } from '@/stores/global';
import { defineComponent } from 'vue';
import { HeartFilled } from '@ant-design/icons-vue';
import axios from 'axios';
import { message } from "ant-design-vue";
import ARow from "ant-design-vue/lib/grid/Row";
import { RouterLink } from "vue-router";
export default defineComponent({
    data(): { search_value: string } {
        return {
            search_value: ""
        }
    },
    setup() {
        var accountTwitterStore = useAccountTwitterStore()
        var globalStore = useGlobalStore()
        return {
            accountTwitterStore,
            globalStore
        };
    },
    methods: {
        goToAccount(username: string) {
            window.open(`https://twitter.com/${username}`)
        },
        authenTwitterApp(url: string) {
            window.open(url)
        },
        checkFavorite(user_id: string) {
            if (this.accountTwitterStore.$state.account_favorite.includes(user_id)) {
                return true
            }
            return false
        },
        async createAccount() {
            axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/create_twitter_account", { name: "New Account" })
                .then(async (data: any) => {
                    this.accountTwitterStore.fetchTwitterAccount()
                })
        },
        confirmDelete(user_id: string) {
            this.globalStore.openLoading()
            axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/delete_twitter_account/" + user_id)
                .then((response) => {
                    this.globalStore.closeLoading()
                    if (response.data.status == true) {
                        message.success(response.data.data)
                        this.accountTwitterStore.fetchTwitterAccount()
                    } else {
                        message.error(response.data.message)
                    }
                })
                .catch((error) => {
                    this.globalStore.closeLoading()
                    message.error(error.message)
                })
        }
    },
    components: { HeartFilled }
})
</script>

<style>
.card-account {
    padding: 30px;
    background-color: rgb(255, 255, 255);
    box-shadow: rgba(50, 50, 93, 0.25) 0px 2px 5px -1px, rgba(0, 0, 0, 0.3) 0px 1px 3px -1px;
    height: 300px;
}

#box-all-account {
    max-height: 75vh;
    overflow: auto;
}

.heart {
    color: #c3c0bb !important;
}

.favorite {
    color: rgb(250, 53, 53) !important;
}
</style>