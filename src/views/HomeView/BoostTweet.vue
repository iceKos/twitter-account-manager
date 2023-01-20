<template>
    <div>
        <a-steps v-model:current="current">
            <a-step v-for="item in steps" :key="item.title" :title="item.title" />
        </a-steps>
        <div>

        </div>
        <div class="steps-content">
            <div v-if="current == 0">
                <div>
                    <a-typography-title :level="3">Select your account you want to run boost <a-tag color="orange" style="font-size: 18px;font-weight: bold;">Tweet by AI</a-tag>
                    </a-typography-title>
                    <a-transfer v-model:target-keys="targetKeys" :data-source="accountTwitterStore.accountVerified()"
                        style="padding:20px" :show-search="true"
                        :filter-option="(inputValue: any, item: any) => item.title.indexOf(inputValue) !== -1"
                        :show-select-all="true" @change="onChange" pagination>
                        <template #children="{
                            direction,
                            filteredItems,
                            selectedKeys,
                            disabled: listDisabled,
                            onItemSelectAll,
                            onItemSelect,
                        }">
                            <a-table :row-selection="
                                getRowSelection({
                                    disabled: listDisabled,
                                    selectedKeys,
                                    onItemSelectAll,
                                    onItemSelect,
                                })
                            " :columns="direction === 'left' ? leftColumns : rightColumns" :data-source="filteredItems"
                                size="small" :style="{ pointerEvents: listDisabled ? 'none' : null }" />
                        </template>
                    </a-transfer>


                </div>
                <div><a-button style="float:right" type="primary" @click="next">Next</a-button></div>
            </div>
           
            <div v-if="current == 1">
                <div>
                    <GenerateContentOpenAI @submit-event="submit_generate_content" :tweet_id="tweet_id"
                        :account_twitter_selected="targetKeys" :prompt_type="'prompts_tweet'"/>
                </div>
            </div>
            <div v-if="current == 2">
                <div>
                    <RunBoostTweet :tweet_id="tweet_id" :queue_boost="queue_boost" />
                </div>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { message } from 'ant-design-vue';
import Tweet from "vue-tweet";
import { useAccountTwitterStore } from "@/stores/account_twitter.store"
import RunBoostReTweet from "@/components/RunBoostReTweet.vue"
import GenerateContentOpenAI from "@/components/GenerateContentOpenAI.vue"
import RunBoostTweet from "@/components/RunBoostTweet.vue"
type tableColumn = Record<string, string>;

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
    delay_time: Number
}

const leftTableColumns = [
    {
        dataIndex: 'name',
        title: 'Name',
    },
    {
        dataIndex: 'username',
        title: 'Username',
    },
];
const rightTableColumns = [
    {
        dataIndex: 'name',
        title: 'Name',
    },
    {
        dataIndex: 'username',
        title: 'Username',
    },
];
export default defineComponent({
    methods: {
        onTweetLoadSuccess(embedNode: any) {
            this.load_tweet_content_success = false
        },
        onTweetLoadError(error: any) {
            this.load_tweet_content_success = true
        },
        submit_generate_content(queue_to_boost: Array<QueueRecord>) {
            this.queue_boost = queue_to_boost.map((item) => {
                item.status = "pending"
                return item
            })
            this.current = 2
        }
    },
    setup() {
        var accountTwitterStore = useAccountTwitterStore()
        const current = ref<number>(0);
        const next = () => {
            current.value++;
        };
        const prev = () => {
            current.value--;
        };

        const targetKeys = ref<string[]>([]);

        const leftColumns = ref<tableColumn[]>(leftTableColumns);
        const rightColumns = ref<tableColumn[]>(rightTableColumns);

        const onChange = (nextTargetKeys: string[]) => {
            // console.log('nextTargetKeys', nextTargetKeys);
        };

        const getRowSelection = ({
            disabled,
            selectedKeys,
            onItemSelectAll,
            onItemSelect,
        }: Record<string, any>) => {
            return {
                getCheckboxProps: (item: Record<string, string | boolean>) => ({
                    disabled: disabled || item.disabled,
                }),
                onSelectAll(selected: boolean, selectedRows: Record<string, string | boolean>[]) {
                    const treeSelectedKeys = selectedRows
                        .filter(item => !item.disabled)
                        .map(({ key }) => key);
                    onItemSelectAll(treeSelectedKeys, selected);
                },
                onSelect({ key }: Record<string, string>, selected: boolean) {
                    onItemSelect(key, selected);
                },
                selectedRowKeys: selectedKeys,
            };
        };

        return {
            accountTwitterStore,
            message,
            current,
            steps: [
                {
                    title: 'Select your Account',
                    content: 'First-content',
                },
                {
                    title: 'Generate Content by AI',
                    content: 'Second-content',
                },
                {
                    title: 'Process Boost Quote Tweet',
                    content: 'Last-content',
                },
            ],
            next,
            prev,
            targetKeys,
            leftColumns,
            rightColumns,
            onChange,
            getRowSelection,
        };
    },
    components: {
        Tweet,
        RunBoostReTweet,
        GenerateContentOpenAI,
        RunBoostTweet
    },
    data(): { tweet_id: string, load_tweet_content_success: boolean, queue_boost: Array<QueueRecord> } {
        return {
            tweet_id: "",
            load_tweet_content_success: true,
            queue_boost: []
        }
    }
})
</script>
<style>
.padding-20 {
    padding: 20px;
}

.steps-content {
    margin-top: 20px;
}

.ant-steps-icon>span>svg {
    margin-top: -8px
}
</style>