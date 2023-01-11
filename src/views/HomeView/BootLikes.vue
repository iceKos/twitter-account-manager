<template>
    <div>
        <a-steps :current="current">
            <a-step v-for="item in steps" :key="item.title" :title="item.title" />
        </a-steps>
        <div>

        </div>
        <div class="steps-content">
            <div v-if="current == 0">
                <div>
                    <a-typography-title :level="3">Select your account you want to Like the post</a-typography-title>
                    <a-transfer v-model:target-keys="targetKeys" :data-source="accountTwitterStore.$state.twitter_account"
                        :show-search="true"
                        :filter-option="(inputValue:any, item:any) => item.title.indexOf(inputValue) !== -1"
                        :show-select-all="true" @change="onChange"
                        pagination
                        >
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
                                size="small" :style="{ pointerEvents: listDisabled ? 'none' : null }"  />
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
                                    <a-input v-model:value="tweet_id" style="width: calc(100% - 200px)" />
                                    
                                </a-input-group>
                            </a-form-item>
                        </a-form>
                    </div>

                    <div style="flex:1" class="padding-20">
                        <Tweet :key="tweet_id" cards="hidden" conversation="none" lang="en" theme="light" align="center"
                            @tweet-load-success="onTweetLoadSuccess" :width="650" :dnt="false" :tweet-id="tweet_id">
                            <template v-slot:loading>
                                <span>Loading...</span>
                            </template>
                            <template v-slot:error>
                                <span>Sorry, that tweet doesn't exist!</span>
                            </template>
                        </Tweet>
                    </div>
                </div>

                <div>
                    <a-button style="float:right;margin-left: 10px;" type="primary" @click="next">Next</a-button>
                    <a-button style="float:right" type="primary" @click="prev"
                        :disabled="load_tweet_content_success">Prev</a-button>
                </div>
            </div>
            <div v-if="current == 2">
                Boot List
                <div>
                    <a-button style="float:right" type="primary" @click="next">Done</a-button>
                    <a-button style="float:right" type="primary" @click="prev">Prev</a-button>
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
interface MockData {
    key: string;    
    disabled: boolean;
    name: string;
    username: string;
}
type tableColumn = Record<string, string>;
const mockData: MockData[] = [];
for (let i = 0; i < 10; i++) {
    mockData.push({
        key: i.toString(),
        disabled: false,
        name:`content${i + 1}`,
        username:`content${i + 1}`
    });
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
            console.log("embedNode");

            this.load_tweet_content_success = false
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
                    title: 'Select Account',
                    content: 'First-content',
                },
                {
                    title: 'Select Tweet',
                    content: 'Second-content',
                },
                {
                    title: 'Boot likes',
                    content: 'Last-content',
                },
            ],
            next,
            prev,
            mockData,
            targetKeys,
            leftColumns,
            rightColumns,
            onChange,
            getRowSelection,
        };
    },
    components: {
        Tweet
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
.steps-content{
    margin-top: 20px;
}
</style>