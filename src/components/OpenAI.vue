<template>
    <div style="width: 100%;">
        <a-textarea v-model:value="prompt" placeholder="Can you enter your propt" :auto-size="{ minRows: 10, }" />
        <div style="margin-top:10px"><a-button style="float: right" type="primary" @click="getResultOpenAIBypropmt">Send</a-button></div>
        <a-divider>Result</a-divider>
        <a-skeleton active v-if="loading" />
        <pre>
            {{ open_ai_result }}
        </pre>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from "axios"
export default defineComponent({
    data(): { open_ai_result: string, prompt: string,loading:boolean } {
        return {
            open_ai_result: "",
            prompt: "",
            loading: false,
        }
    },
    methods: {
        getResultOpenAIBypropmt() {
            this.loading = true
            axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/openAI_tweet", { prompt: this.prompt })
                .then(async (data: any) => {
                    
                    this.open_ai_result = data.data.data
                    this.loading = false
                    
                })
        }
    }
})
</script>˜