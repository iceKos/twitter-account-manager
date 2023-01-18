import { defineStore } from 'pinia'
import { ref } from 'vue';

export const usePromptStore = defineStore("prompt", () => {
    var initPrompt: Array<string> = JSON.parse(`${localStorage.getItem('prompts')}`)
    if (!initPrompt) {
        initPrompt = [
            "can you create short positive good sentence for Nakamoto.games platform play to earn and add #NAKA , emoji",
            "can you make shot positive good word say to some platform and add emoji",
            "Please provide me with short good sentence and add #NAKA in your sentence"
        ]
    }
    var prompts: any = ref(initPrompt)
    function setPropmts(prompt: Array<string>) {
        localStorage.setItem('prompts', JSON.stringify(prompt))
        prompts.value = prompt
    }
    
    return {
        prompts,
        setPropmts
    }
})