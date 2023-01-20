import { defineStore } from 'pinia'
import { ref } from 'vue';

export const usePromptStore = defineStore("prompt", () => {
    var initPromptQuoteTweet: Array<string> = JSON.parse(`${localStorage.getItem('prompts_quote_tweet')}`)
    var initPromptReplyTweet: Array<string> = JSON.parse(`${localStorage.getItem('prompts_reply_tweet')}`)
    var initPromptTweet: Array<string> = JSON.parse(`${localStorage.getItem('prompts_tweet')}`)
    if (!initPromptQuoteTweet) {
        initPromptQuoteTweet = [
            "can you create short positive good sentence for Nakamoto.games platform play to earn and add #NAKA , emoji",
            "can you make shot positive good word say to some platform and add emoji",
            "Please provide me with short good sentence say to some platform and add #NAKA in your sentence"
        ]
    }

    if (!initPromptReplyTweet) {
        initPromptReplyTweet = [
            "can you create short positive good sentence  for reply tweet some",
            "Please provide me with short great sentence for reply tweet some one"
        ]
    }

    if (!initPromptTweet) {
        initPromptTweet = [
            "can you create short positive good sentence  for tweet post on twitter"
        ]
    }
    var prompts_quote_tweet: any = ref(initPromptQuoteTweet)
    var prompts_reply_tweet: any = ref(initPromptReplyTweet)
    var prompts_tweet: any = ref(initPromptTweet)
    function setPropmts(prompt: Array<string>, prompt_type: string) {
        localStorage.setItem(prompt_type, JSON.stringify(prompt))
        switch (prompt_type) {
            case "prompts_quote_tweet":
                prompts_quote_tweet.value = prompt
                break;
            case "prompts_reply_tweet":
                prompts_reply_tweet.value = prompt
                break;
            case "prompts_tweet":
                prompts_tweet.value = prompt
                break;
            default:
                break;
        }
    }

    function getPropmtsSet(prompt_type: string) {
        
        switch (prompt_type) {
            case "prompts_quote_tweet":
                return  JSON.parse(JSON.stringify(prompts_quote_tweet.value)) 
            case "prompts_reply_tweet":
                return JSON.parse(JSON.stringify(prompts_reply_tweet.value))
            case "prompts_tweet":
                return JSON.parse(JSON.stringify(prompts_tweet.value))
            default:
                return []
        }
    }

    return {
        prompts_quote_tweet,
        prompts_reply_tweet,
        prompts_tweet,
        setPropmts,
        getPropmtsSet
    }
})