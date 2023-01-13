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
                    <a-typography-title :level="3">Select your account you want to boot like tweet </a-typography-title>
                    <a-transfer v-model:target-keys="targetKeys" :data-source="accountTwitterStore.accountVerified()" style="padding:20px"
                        :show-search="true"
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
                <div style="display: flex;">
                    <div style="flex:1" class="padding-20">
                        <a-form>
                            <a-form-item name="select" label="Tweet ID">
                                <a-input-group compact>
                                    <a-input v-model:value="tweet_id" placeholder="Enter your tweet ID" />

                                </a-input-group>
                            </a-form-item>
                        </a-form>
                    </div>

                    <div style="flex:1" class="padding-20">
                        <a-empty v-if="tweet_id == ''"/>
                        <Tweet v-else :key="tweet_id" cards="hidden" conversation="none" lang="en" theme="light" align="center"
                            @tweet-load-success="onTweetLoadSuccess" :width="650" :dnt="false" :tweet-id="tweet_id"
                            @tweet-load-error="onTweetLoadError">
                            <template v-slot:loading>
                                <a-skeleton active />
                            </template>
                            <template v-slot:error>
                                <span>Sorry, that tweet doesn't exist!</span>
                            </template>
                        </Tweet>
                    </div>
                </div>
                <div>
                    <a-button style="float:right;margin-left: 10px;" type="primary" @click="next"
                        :disabled="load_tweet_content_success || tweet_id == ''">Next</a-button>
                    <a-button style="float:right" type="primary" @click="prev">Prev</a-button>
                </div>
            </div>
            <div v-if="current == 2">
                <div>
                    <RunBootLikes :tweet_id="tweet_id" :account_twitter_selected="targetKeys" />
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
import RunBootLikes from "@/components/RunBootLikes.vue"

type tableColumn = Record<string, string>;


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
            console.log("embedNode");

            this.load_tweet_content_success = false
        },
        onTweetLoadError(error: any) {
            this.load_tweet_content_success = true
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
            console.log('nextTargetKeys', nextTargetKeys);
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
                    console.log(key, selected);

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
                    title: 'Select your Tweet',
                    content: 'Second-content',
                },
                {
                    title: 'Process Boots like',
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
        RunBootLikes
    },
    data() {
        return {
            tweet_id: "",
            load_tweet_content_success: true
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