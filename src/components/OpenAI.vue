<template>
    <div style="width: 100%;">
        <a-textarea v-model:value="prompt" :auto-size="{ minRows: 10 }" placeholder="Can you enter your prompt" />
        <div style="margin-top:10px">
            <a-button style="float:right" type="primary" @click="getResultOpenAIByPrompt"> Send </a-button>
        </div>
        <a-divider>Result OpenAI</a-divider>
        <a-skeleton active v-if="loading"></a-skeleton>
        <pre>
            {{ open_ai_result }}
        </pre>
    </div>
</template>
<script lang="ts">
import { defineComponent } from "vue"
import axios from "axios"
import { message } from "ant-design-vue"
export default defineComponent({
    data(): { open_ai_result: string, prompt?: string, loading: boolean } {
        return {
            open_ai_result: "",
            prompt: "",
            loading: false
        }
    },
    methods: {
        getResultOpenAIByPrompt() {
            this.loading = true
            this.open_ai_result = ""
            axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/openAI_tweet", { prompt: this.prompt })
                .then((response) => {
                    if (response.data.status == true) {

                        this.open_ai_result = response.data.data
                    } else {
                        message.error(response.data.message)
                    }
                    this.loading = false
                })
        }
    }
})
</script>