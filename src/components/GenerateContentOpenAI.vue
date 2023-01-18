<template>
    <div>
        <div>
            <a-page-header class="demo-page-header" style="border: 1px solid rgb(235, 237, 240)"
                title="Generate Content" sub-title="by OpenAI">
                <template #tags>

                    <a-tag color="processing" v-if="process_stage == 'process'">
                        <template #icon>
                            <sync-outlined :spin="true" />
                        </template>
                        processing
                    </a-tag>
                    <a-tag color="success" v-if="process_stage == 'done'">
                        <template #icon>
                            <check-circle-outlined />
                        </template>
                        success
                    </a-tag>
                </template>
                <template #extra>
                    <a-button @click="globalStore.openModalEditPrompt">
                        <template #icon>
                            <SettingOutlined />
                        </template>
                        Edit Prompt</a-button>
                    <a-button v-if="process_stage == 'pending'" type="primary"
                        @click="generateQueue">Generate</a-button>
                    <a-button v-if="process_stage == 'done'" @click="() => {
                        queue_gen_content = []
                        queue_filter = []
                        generateQueue()
                    }">Re-Generate</a-button>
                    <a-button v-if="process_stage == 'done'" type="primary"
                        @click="handleClickSubmitToParent">Submit</a-button>

                </template>
                <div>
                    <a-descriptions size="small" :column="3">
                        <a-descriptions-item label="Creator">{{ userStore.user.email }}</a-descriptions-item>
                        <a-descriptions-item label="Record amount">{{ accounts.length }}</a-descriptions-item>
                        <a-descriptions-item label="Created at">{{ date_start }}</a-descriptions-item>
                    </a-descriptions>
                </div>
                <template #footer>
                    <a-tabs v-model:activeKey="tab_active" @tabClick="tabClick">
                        <a-tab-pane key="all" :tab="`All (${queue_gen_content.length})`" />
                        <a-tab-pane key="pass"
                            :tab="`Passed (${queue_gen_content.filter(x => x.status == 'pass').length})`" />
                        <a-tab-pane key="fail"
                            :tab="`Failed (${queue_gen_content.filter(x => x.status == 'fail').length})`" />
                    </a-tabs>
                    <div id="content-tabs">
                        <a-empty v-if="queue_filter.length == 0" />
                        <QueueGenContentItem v-for="item in queue_filter" :queue_data="item" :key="item.id" />
                    </div>
                </template>
            </a-page-header>
        </div>
        <div>
            <EditPrompt />
        </div>

    </div>

</template>
<script lang="ts">
import { defineComponent } from "vue"
import { useAccountTwitterStore } from "@/stores/account_twitter.store"
import { usePromptStore } from "@/stores/prompt.store"
import { useUserStore } from "@/stores/users.store"
import { useGlobalStore } from "@/stores/global"
import { SyncOutlined, SettingOutlined } from "@ant-design/icons-vue"
import { v4 as uuidv4 } from 'uuid';
import QueueGenContentItem from "@/components/QueueGenContentItem.vue"
import EditPrompt from "@/components/EditPrompt.vue"
import moment from "moment"
import axios from "axios"
function randomItemFromArray(array: Array<any>) {
    return array[Math.floor(Math.random() * array.length)];
}

interface QueueRecord {
    id: string;
    status: string;
    user_id: string;
    tweet_id: string;
    username: string,
    name: string,
    loading: boolean;
    error_message: string;
    prompt: string;
    content: string;
}
export default defineComponent({
    props: {
        account_twitter_selected: {
            type: Array,
            default() {
                return []
            }
        },
        tweet_id: {
            type: String,
            default() {
                return ""
            }
        },
    },
    components: { SyncOutlined, SettingOutlined, QueueGenContentItem, EditPrompt },
    created() {
        this.generateAccount()
    },
    data(): { accounts: Array<any>, date_start: string, process_stage: string, tab_active: string, queue_gen_content: Array<QueueRecord>, queue_filter: Array<QueueRecord>, edit_prompt_modal: boolean } {
        return {
            accounts: [],
            date_start: moment().format("YYYY-MM-DD HH:mm:ss"),
            process_stage: "pending",
            tab_active: "all",
            queue_gen_content: [],
            queue_filter: [],
            edit_prompt_modal: false
        }
    },
    methods: {
        handleClickSubmitToParent() {
            console.log("handleClickSubmitToParent working");
            this.$emit("submitEvent", this.queue_gen_content)

        },
        tabClick(key: any): void {
            switch (key) {
                case "pending": {
                    this.queue_filter = this.queue_gen_content.filter(x => x.status == 'pending')
                    break;
                }
                case "pass": {
                    this.queue_filter = this.queue_gen_content.filter(x => x.status == 'pass')
                    break;
                }
                case "fail": {
                    this.queue_filter = this.queue_gen_content.filter(x => x.status == 'fail')
                    break;
                }
                default:
                    this.queue_filter = this.queue_gen_content.filter(x => true)
                    break;
            }
        },
        async generateQueue() {
            this.process_stage = "process"
            for (const account of this.accounts) {
                let prompt = randomItemFromArray(this.promptStore.prompts)
                var object_result = {
                    id: uuidv4(),
                    status: "pending",
                    user_id: account.id,
                    tweet_id: this.tweet_id,
                    username: account.username,
                    name: account.name,
                    loading: false,
                    error_message: "",
                    prompt: prompt,
                    content: ""
                }
                try {
                    var content = await this.getResultOpenAIByPrompt(object_result.prompt)
                    object_result.content = content
                    object_result.status = "pass"
                } catch (error: any) {
                    object_result.status = "fail"
                    object_result.error_message = error.message
                }
                this.queue_gen_content.push(object_result)

                this.queue_filter = this.queue_gen_content
            }
            this.process_stage = "done"
        },
        generateAccount() {
            this.accounts = this.accountTwitterStore.accountVerified().filter((x) => {
                return this.account_twitter_selected.includes(x.key)
            })
        },
        getResultOpenAIByPrompt(prompt: string) {
            return axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/openAI_tweet", { prompt: prompt })
                .then((response) => {
                    if (response.data.status == true) {
                        return response.data.data
                    } else {
                        throw new Error(response.data.message)
                    }
                })
                .catch((error: any) => {
                    throw new Error(error.message)
                })
        }
    },
    setup() {
        var accountTwitterStore = useAccountTwitterStore()
        var userStore = useUserStore()
        var promptStore = usePromptStore()
        var globalStore = useGlobalStore()
        return {
            accountTwitterStore,
            userStore,
            promptStore,
            globalStore
        }
    }
})
</script>
<style>

</style>