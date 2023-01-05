<template>
    
    <div id="box-all-account">
       
        <a-row>
            <a-col style="padding:20px;position: relative;" :lg="6" :md="12" :sm="12" :xs="24"
                v-for="(account, index) in accountTwitterStore.getTwitterAccount()" :key="index">
                <router-link :to="'/home/account/'+account.id">
                    <div class="card-account">
                        <div style="text-align:center">
                            <a-avatar style="border:0.5px solid #d2d2d2" :size="130" :src="account.profile_image_url">

                            </a-avatar>
                        </div>
                        <div style="text-align:center;font-size:18px;font-weight: 600;margin-top:10px;color:#001529;">
                            {{ account.name }}
                        </div>
                        <div style="text-align:center;font-size:16px;font-weight: 300;margin-top:0px;color: #7a7474;">
                            @{{ account.username }}
                        </div>
                    </div>
                </router-link>

            </a-col>


        </a-row>
    </div>
</template>
<script lang="ts">
import { useAccountTwitterStore } from "@/stores/account_twitter.store"
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        var accountTwitterStore = useAccountTwitterStore()

        return {
            accountTwitterStore
        };
    },
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
</style>