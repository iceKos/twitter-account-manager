<template>
    <a-modal :okText="'Save'" style="width:650px" v-model:visible="globalStore.modal_edit_prompt" title="Edit Prompt" @cancel="cancelEdit" @ok="saveAllPrompts">

        <a-list item-layout="horizontal">
            <template #loadMore>
                <div :style="{ textAlign: 'center', marginTop: '12px', height: '32px', lineHeight: '32px' }">
                    <a-button @click="addPrompt">Add prompt</a-button>
                </div>
            </template>
            <a-list-item v-for="(item, index) in current_prompt" :key="index">
                <template #actions>
                    <span key="list-action-delete" style="color:crimson;cursor: pointer;" @click="delete_prompt(index)">Delete</span>
                </template>
                <a-list-item-meta>
                    <template #title>
                        <a-textarea auto-size v-model:value="current_prompt[index]" />
                    </template>

                    <template #avatar>
                        {{ index+ 1 }})
                    </template>
                </a-list-item-meta>
            </a-list-item>

        </a-list>
    </a-modal>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import { usePromptStore } from "@/stores/prompt.store"
import { useGlobalStore } from "@/stores/global"
import { message } from 'ant-design-vue';
export default defineComponent({
    props: {
        edit_prompt_modal: {
            type: Boolean,
            default: false
        }
    },
    setup() {
        const promptStore = usePromptStore()
        const globalStore = useGlobalStore()
        return {
            promptStore,
            globalStore
        }
    },
    methods: {
        delete_prompt(index: Number) {
            this.current_prompt = this.current_prompt.filter((item,key)=>{
                return key!=index
            })
        },
        addPrompt(){
            this.current_prompt.push("Enter your prompt")
        },
        saveAllPrompts() {
            this.promptStore.setPropmts(this.current_prompt)
            this.orignal_prompt = this.current_prompt
            message.success("Prompt has been saved")

        },
        cancelEdit(){
            this.promptStore.setPropmts(this.orignal_prompt)
        }
    },
    data() :{orignal_prompt:Array<string>,current_prompt:Array<string>} {
        return {
            orignal_prompt: [],
            current_prompt: []
        }
    },
    created() {
        this.orignal_prompt = JSON.parse(JSON.stringify(this.promptStore.prompts))
        this.current_prompt = this.orignal_prompt
    }
})
</script>