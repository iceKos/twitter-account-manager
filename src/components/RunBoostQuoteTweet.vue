<template>
    <div>
        <div>
            <a-page-header class="demo-page-header" style="border: 1px solid rgb(235, 237, 240)"
                title="Run Boost Process" sub-title="Boost Quote Tweet">
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
                    <a-input-number v-model:value="delay_time" :step="1" :min="0" placeholder="Delay Time"
                        style="width:250px" addon-after="second" addon-before="Delay Time">
                    </a-input-number>
                    <a-button @click="stopRunningBoot" v-if="process_running == true">Stop Boost</a-button>
                    <a-button @click="startRunningBoot" type="primary" v-if="process_running == false">Run
                        boost</a-button>

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
                        <a-tab-pane key="all" :tab="`All (${queue_boost.length})`" />
                        <a-tab-pane key="pending"
                            :tab="`Pending (${queue_boost.filter(x => x.status == 'pending').length})`" />
                        <a-tab-pane key="pass"
                            :tab="`Passed (${queue_boost.filter(x => x.status == 'pass').length})`" />
                        <a-tab-pane key="fail"
                            :tab="`Failed (${queue_boost.filter(x => x.status == 'fail').length})`" />
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
export interface QueueRecord {
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
import { defineComponent } from "vue"
import { useUserStore } from "@/stores/users.store"
import moment from "moment"
import prettyMilliseconds from 'pretty-ms';
import { message } from 'ant-design-vue';
import { notification } from 'ant-design-vue';
let intervalIdTimeRunning: any;
import axios from 'axios';
export default defineComponent({
    props: {
        queue_boost: {
            type: Array<QueueRecord>,
            default: []
        },
        tweet_id: {
            type: String,
            default() {
                return ""
            }
        },
    },
    data(): { process_stage: string, delay_time: Number, date_start: string, date_end: string, queue_filter: Array<QueueRecord>, tab_active: String, process_running: boolean } {
        return {
            delay_time: 1,
            date_start: moment().format("YYYY-MM-DD HH:mm:ss"),
            date_end: moment().format("YYYY-MM-DD HH:mm:ss"),
            queue_filter: this.queue_boost,
            tab_active: "all",
            process_running: false,
            process_stage: "pending"
        }
    },
    methods: {

        startRunningBoot() {
            this.process_stage = "process"
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
            var process_queue = this.queue_boost.filter(x => x.status == 'pending')
            var i = 0

            const loop = async () => {
                if (process_queue.length > 0) {
                    // precess here
                    var currentProcess = process_queue[i]
                    var find_index_inqueue = this.queue_boost.findIndex(item => item.id == currentProcess.id)
                    currentProcess.loading = true
                    this.queue_boost[find_index_inqueue] = currentProcess
                    try {
                        await this.sendQuoteTweetAPI(currentProcess.user_id, currentProcess.tweet_id, currentProcess.content)
                        currentProcess.status = 'pass'

                    } catch (error: any) {
                        currentProcess.status = 'fail'
                        currentProcess.error_message = error.message
                    }
                    currentProcess.loading = false
                    this.queue_boost[find_index_inqueue] = currentProcess
                    i++;
                    if (i < process_queue.length) {
                        setTimeout(loop, (Number(this.delay_time) * 1000));
                    } else {
                        notification.success({
                            message: 'Notification',
                            description:
                                'All processes are done.',
                            duration: 20
                        });
                        this.stopRunningBoot()
                        this.process_stage = 'done'
                    }
                } else {
                    message.warning('Empty process to run boot');
                    this.stopRunningBoot()
                }
            }
            loop();
        },
        sendQuoteTweetAPI(user_id: string, tweet_id: string, content: string) {
            return axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/tweet", { user_id, quote_tweet_id: tweet_id, content, tweet_mode: "shadow_tweet" })
                .then((response) => {
                    if (response.data.status == true) {
                        console.log(response.data);

                        return true
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
        },
        tabClick(key: any): void {
            switch (key) {
                case "pending": {
                    this.queue_filter = this.queue_boost.filter(x => x.status == 'pending')
                    break;
                }
                case "pass": {
                    this.queue_filter = this.queue_boost.filter(x => x.status == 'pass')
                    break;
                }
                case "fail": {
                    this.queue_filter = this.queue_boost.filter(x => x.status == 'fail')
                    break;
                }
                default:
                    this.queue_filter = this.queue_boost.filter(x => true)
                    break;
            }
        }
    },
    setup() {
        var userStore = useUserStore()
        return {
            userStore
        }
    },
    computed: {
        duration() {
            var diffTime = moment(this.date_end, "YYYY-MM-DD HH:mm:ss").diff(moment(this.date_start, "YYYY-MM-DD HH:mm:ss"), "milliseconds")
            return prettyMilliseconds(diffTime)
        },
        progress_percentage() {
            return Math.floor(((this.queue_boost.filter(x => x.status == 'pass').length / this.queue_boost.length) * 100))
        }
    },
});

</script>