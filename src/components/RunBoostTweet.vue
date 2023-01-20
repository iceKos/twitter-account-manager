<template>
    <div>
        <div>
            <a-page-header class="demo-page-header" style="border: 1px solid rgb(235, 237, 240)"
                title="Run Boost Process" sub-title="Boost Tweet By AI">
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
                    <span style="color:red;font-size: 12px;">Recommend a minimum time of more than 30 sec to avoid being
                        seen as a robot.</span>
                    <a-input-number @blur="regenQueue" v-model:value="delay_range.start" :step="1" :min="0"
                        placeholder="Delay Time" style="width:200px" addon-before="Delay Time">
                    </a-input-number>
                    <span>To</span>
                    <a-input-number @blur="regenQueue" v-model:value="delay_range.end" :step="1"
                        :min="delay_range.start + 1" placeholder="Delay Time" style="width:200px" addon-after="second">
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
    delay_time: Number
}
import { defineComponent } from "vue"
import { useUserStore } from "@/stores/users.store"
import moment from "moment"
import prettyMilliseconds from 'pretty-ms';
import { message } from 'ant-design-vue';
import { notification } from 'ant-design-vue';
let intervalIdTimeRunning: any;
import axios from 'axios';
import randomNumber from "@/helper/randomNumber"
import QueueItem from "@/components/QueueItem.vue"
import {
    SyncOutlined, CheckCircleOutlined
} from '@ant-design/icons-vue';
export default defineComponent({
    components: {
        SyncOutlined, CheckCircleOutlined,QueueItem
    },
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
    data(): { queue: Array<QueueRecord>, delay_range: { start: number, end: number }, process_stage: string, delay_time: Number, date_start: string, date_end: string, queue_filter: Array<QueueRecord>, tab_active: String, process_running: boolean } {
        return {
            delay_time: 1,
            delay_range: {
                start: 20,
                end: 40
            },
            date_start: moment().format("YYYY-MM-DD HH:mm:ss"),
            date_end: moment().format("YYYY-MM-DD HH:mm:ss"),

            tab_active: "all",
            process_running: false,
            process_stage: "pending",
            queue: JSON.parse(JSON.stringify(this.queue_boost)),
            queue_filter: [],
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
                        await this.sendQuoteTweetAPI(currentProcess.user_id, currentProcess.tweet_id, currentProcess.content)
                        currentProcess.status = 'pass'

                    } catch (error: any) {
                        currentProcess.status = 'fail'
                        currentProcess.error_message = error.message
                    }
                    currentProcess.loading = false
                    this.queue[find_index_inqueue] = currentProcess
                    i++;
                    if (i < process_queue.length) {
                        setTimeout(loop, (Number(currentProcess.delay_time) * 1000));
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
            return axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/tweet", { user_id, content, tweet_mode: "shadow_tweet" })
                .then((response) => {
                    if (response.data.status == true) {
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
        regenQueue() {
            this.queue = this.queue.map((x) => {
                x.delay_time = randomNumber(this.delay_range.start, this.delay_range.end)
                return x
            })
        },
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
            return Math.floor(((this.queue.filter(x => x.status == 'pass').length / this.queue.length) * 100))
        }
    },
    created() {
        this.queue = this.queue.map((x) => {
            x.delay_time = randomNumber(this.delay_range.start, this.delay_range.end)
            return x
        })
        this.queue_filter = this.queue
    }

});

</script>