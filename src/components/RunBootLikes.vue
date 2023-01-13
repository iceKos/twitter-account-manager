<template>
    <div>
        <div>
            <a-page-header class="demo-page-header" style="border: 1px solid rgb(235, 237, 240)"
                title="Run Boots Process" sub-title="Boots Like">
                <template #extra>
                    <a-input-number v-model:value="delay_time" :step="1" :min="0" placeholder="Delay Time"
                        style="width:250px" addon-after="second" addon-before="Delay Time">
                    </a-input-number>
                    <a-button @click="stopRunningBoot" v-if="process_running == true">Stop Boots</a-button>
                    <a-button @click="startRunningBoot" type="primary" v-if="process_running == false">Run
                        Boots</a-button>

                </template>
                <div style="display:flex">
                    <a-descriptions size="small" :column="2" style="flex:4">
                        <a-descriptions-item label="Creator">{{ userStore.user.email }}</a-descriptions-item>
                        <a-descriptions-item label="Tweet ID">{{ tweet_id }}</a-descriptions-item>
                        <a-descriptions-item label="Created at">{{ date_start }}</a-descriptions-item>
                        <a-descriptions-item label="Duration">
                            {{ duration }}
                        </a-descriptions-item>
                    </a-descriptions>
                    <div style="flex:1">
                        <a-progress type="circle" :percent="progress_percentage" width="80px" />
                    </div>
                </div>
                <template #footer>
                    <a-tabs v-model:activeKey="tab_active" @tabClick="tabClick">
                        <a-tab-pane key="all" :tab="`All (${queue.length})`" />
                        <a-tab-pane key="pending"
                            :tab="`Pending (${queue.filter(x => x.status == 'pending').length})`" />
                        <a-tab-pane key="pass" :tab="`Passed (${queue.filter(x => x.status == 'pass').length})`" />
                        <a-tab-pane key="fail" :tab="`Failed (${queue.filter(x => x.status == 'fail').length})`" />
                    </a-tabs>
                    <div id="content-tabs">
                        <a-empty v-if="queue_filter.length == 0" />
                        <QueueItem v-for="item in queue_filter" :queue_data="item" :key="item.id" />
                    </div>
                </template>
            </a-page-header>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useAccountTwitterStore } from "@/stores/account_twitter.store"
import { useUserStore } from "@/stores/users.store"
import moment, { duration } from "moment"
import prettyMilliseconds from 'pretty-ms';
import QueueItem from "@/components/QueueItem.vue"
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { message } from 'ant-design-vue';
interface QueueRecord {
    id: string;
    status: string;
    user_id: string;
    tweet_id: string;
    username: string,
    name: string,
    loading: boolean;
    error_message: string
}
let intervalIdTimeRunning: any;
export default defineComponent({
    components: { QueueItem },
    props: {
        tweet_id: {
            type: String,
            default() {
                return ""
            }
        },
        account_twitter_selected: {
            type: Array,
            default() {
                return []
            }
        },
    },
    created() {
        this.generateQueue()
    },
    data(): { delay_time: Number, date_start: string, date_end: string, queue: Array<QueueRecord>, queue_filter: Array<QueueRecord>, tab_active: String, process_running: boolean } {
        return {
            delay_time: 1,
            date_start: moment().format("YYYY-MM-DD HH:mm:ss"),
            date_end: moment().format("YYYY-MM-DD HH:mm:ss"),
            queue: [],
            queue_filter: [],
            tab_active: "all",
            process_running: false
        }
    },
    methods: {
        tabClick(key: any): void {
            switch (key) {
                case "pending": {
                    this.queue_filter = this.queue.filter(x => x.status == 'pending')
                    break;
                }
                case "pass": {
                    this.queue_filter = this.queue.filter(x => x.status == 'pass')
                    break;
                }
                case "fail": {
                    this.queue_filter = this.queue.filter(x => x.status == 'fail')
                    break;
                }
                default:
                    this.queue_filter = this.queue.filter(x => true)
                    break;
            }
        },
        generateQueue() {
            var accounts = this.accountTwitterStore.accountVerified().filter((x) => {
                return this.account_twitter_selected.includes(x.key)
            })
            for (const account of accounts) {
                this.queue.push({
                    id: uuidv4(),
                    status: "pending",
                    user_id: account.id,
                    tweet_id: this.tweet_id,
                    username: account.username,
                    name: account.name,
                    loading: false,
                    error_message: ""
                })
            }
            this.queue_filter = this.queue
        },
        startRunningBoot() {
            this.date_start = moment().format("YYYY-MM-DD HH:mm:ss")
            this.date_end = moment().format("YYYY-MM-DD HH:mm:ss")
            this.process_running = true
            this.timeRunning()
            this.runQueue()
        },
        stopRunningBoot() {
            this.process_running = false
            clearInterval(intervalIdTimeRunning)
        },
        timeRunning() {
            intervalIdTimeRunning = setInterval(() => {
                this.date_end = moment().format("YYYY-MM-DD HH:mm:ss")
            }, 1000)
        },
        runQueue() {
            var process_queue = this.queue.filter(x => x.status == 'pending')
            var i = 0
            const loop = async () => {
                if (process_queue.length > 0) {
                    // precess here
                    var currentProcess = process_queue[i]
                    var find_index_inqueue = this.queue.findIndex(item => item.id == currentProcess.id)
                    currentProcess.loading = true
                    this.queue[find_index_inqueue] = currentProcess
                    try {
                        await this.sendLikeAPI(currentProcess.user_id, currentProcess.tweet_id)
                        currentProcess.status = 'pass'

                    } catch (error: any) {
                        currentProcess.status = 'fail'
                        currentProcess.error_message = error.message
                    }
                    currentProcess.loading = false
                    this.queue[find_index_inqueue] = currentProcess
                    i++;
                    if (i < process_queue.length) {
                        setTimeout(loop, (Number(this.delay_time) * 1000));
                    } else {
                        this.stopRunningBoot()
                    }
                } else {
                    message.warning('Empty process to run boot');
                    this.stopRunningBoot()
                }
            }
            loop();
        },
        sendLikeAPI(user_id: string, tweet_id: string) {
            return axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/like/tweet", { user_id, tweet_id })
                .then((response) => {
                    if (response.data.status == true) {
                        response.data.data.data.liked
                    } else {
                        throw new Error(response.data.message);
                    }
                })
                .catch((error) => {
                    if (error.response?.data?.message) {
                        throw new Error(error.response.data.message);
                    } else {
                        throw new Error(error.message);
                    }
                })
        }
    },
    computed: {
        duration() {
            var diffTime = moment(this.date_end, "YYYY-MM-DD HH:mm:ss").diff(moment(this.date_start, "YYYY-MM-DD HH:mm:ss"), "milliseconds")
            return prettyMilliseconds(diffTime)
        },
        progress_percentage() {
            return Math.floor(((this.queue.filter(x => x.status == 'pass').length / this.queue.length) * 100))
        }
    },
    setup() {
        var accountTwitterStore = useAccountTwitterStore()
        var userStore = useUserStore()
        return {
            accountTwitterStore,
            userStore
        }
    }
})

</script>
<style>
#content-tabs {
    max-height: 50vh;
    overflow: auto;
}
</style>