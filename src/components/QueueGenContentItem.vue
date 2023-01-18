<template>
    <div class="list"  @mouseleave="show_edit = false;input_edit_open = false;show_regen_text=false">
        <div style="display:flex;justify-content: space-between;height: 100%;">
            <div style="display:flex;align-items: center;">
                <div>
                    <div><span style="font-weight: 800;">Account :</span> {{ queue_data.name }}
                        <a target="_blank" :href="`https://twitter.com/${queue_data.username}`">(@{{
                            queue_data.username
                        }})</a>
                    </div>
                    <div><span style="font-weight: 800;">Tweet ID :</span> {{
                        queue_data.tweet_id
                    }}
                        <div v-if="queue_data.error_message != ''"><span style="font-weight: 800;">Error message :</span>
                            <a-tag color="error" style="margin-left:5px">
                                <template #icon>
                                    <exclamation-circle-outlined />
                                </template>
                                {{ queue_data.error_message }}
                            </a-tag>
                        </div>
                    </div>
                    <div style="display:flex;align-items: center;">
                        <div style="font-weight: 800;">Prompt :</div> 
                        <div v-if="input_edit_open == true"><a-input size="small" style="min-width: 500px;"  v-model:value="queue_data.prompt" :bordered="true" placeholder="Borderless" /></div>
                        <div v-else @mouseenter="showEditAction">{{ queue_data.prompt }}</div>                        
                        <div class="prompt-display" v-if="show_edit==true && input_edit_open == false"><EditFilled style="margin-left:5px;" @click="input_edit_open = true"/></div>
                        <div class="prompt-display" v-if="show_edit==true && input_edit_open == true"><CheckOutlined style="margin-left:5px;" @click="input_edit_open = false;show_edit = false"/></div>
                    </div>
                    <div class="quote-tweet-display">
                        <span style="font-weight: 800;">Quote tweet Content :</span> <a-tag @mouseenter="show_regen_text = true">{{ queue_data.content }}</a-tag>
                        <sync-outlined class="sync-quote" v-if="show_regen_text==true"  style="margin-left:10px;" @click="getResultOpenAIByPrompt"/> 
                    </div>
                </div>
            </div>
            <div style="display:flex;align-items: center;">
                <div v-if="queue_data.loading == true">
                    <a-tag color="processing">
                        <template #icon>
                            <sync-outlined :spin="true" />
                        </template>
                        PROCESSING
                    </a-tag>
                </div>
                <div v-else>
                    <a-tag color="default" v-if="queue_data.status == 'pending'">
                        <template #icon>
                            <clock-circle-outlined />
                        </template>
                        PENDING
                    </a-tag>
                    <a-tag color="success" v-if="queue_data.status == 'pass'">
                        <template #icon>
                            <check-circle-outlined />
                        </template>
                        PASSED
                    </a-tag>
                    <a-tag color="error" v-if="queue_data.status == 'fail'">
                        <template #icon>
                            <check-circle-outlined />
                        </template>
                        FAILED
                    </a-tag>
                </div>
            </div>
        </div>

    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import {

    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    MinusCircleOutlined,
    EditFilled,
    CheckOutlined

} from '@ant-design/icons-vue';
import axios from "axios"
export default defineComponent({
    props: {
        queue_data: {
            type: Object,
            default() {
                return {}
            }
        }
    },
    components: {
        CheckCircleOutlined,
        SyncOutlined,
        CloseCircleOutlined,
        ExclamationCircleOutlined,
        ClockCircleOutlined,
        MinusCircleOutlined,
        EditFilled,
        CheckOutlined
    },
    methods: {
        goToAccount(username: string) {
            window.open(`https://twitter.com/${username}`)
        },
        showEditAction(){
            this.show_edit = true
        },
        getResultOpenAIByPrompt() {
            this.queue_data.loading = true
            this.queue_data.content = "Loading..."
            return axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/openAI_tweet", { prompt: this.queue_data.prompt })
                .then((response) => {
                    if (response.data.status == true) {
                        this.queue_data.content = response.data.data
                    } else {
                        throw new Error(response.data.message)
                    }
                    this.queue_data.loading = false
                })
                .catch((error: any) => {
                    this.queue_data.loading = false
                    this.queue_data.error_message = error.message
                    throw new Error(error.message)
                })
        }
    },
    data(){
        return {
            show_edit:false,
            show_regen_text:false,
            input_edit_open:false
        }
    }
})
</script>
<style scoped>
.list {
    height: 150px;
    border-bottom: 0.5px solid rgb(157, 157, 157);
}

.ant-tag>span>svg {
    margin-top: -6px
}

.prompt-display>span>svg {
    margin-top: -5px
}

.quote-tweet-display>span[role='img']>svg{
    margin-top: -10px
}

.sync-quote{
    cursor: pointer;
}

</style>