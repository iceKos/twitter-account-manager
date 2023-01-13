<template>
    <div class="list">
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

} from '@ant-design/icons-vue';
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
    },
    methods: {
        goToAccount(username: string) {
            window.open(`https://twitter.com/${username}`)
        },
    }
})
</script>
<style>
.list {
    height: 100px;
    border-bottom: 0.5px solid rgb(157, 157, 157);
}

.ant-tag>span>svg {
    margin-top: -6px
}
</style>