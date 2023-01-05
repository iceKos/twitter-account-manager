import axios from 'axios';
import { defineStore } from 'pinia'
import { useGlobalStore } from "@/stores/global"
import { ref } from 'vue';
// const globalStore = useGlobalStore()
// export const useAccountTwitterStore = defineStore({
//   id: 'account_twitter',
//   state: (): { twitter_account: Array<any> } => ({
//     twitter_account: []
//   }),
//   getters: {
//     getTwitterAccount: (state) => state.twitter_account
//   },
//   actions: {
//     setListAccount(twitter_account: Array<any>) {
//       console.log(twitter_account);

//       this.twitter_account = twitter_account
//     },
//     fetchTwitterAccount() {

//       axios.get(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/get_twitter_account")
//         .then((data: any) => {
//           var { data } = data
//           // this.twitter_account = data.data

//         })
//     }
//   }
// })


export const useAccountTwitterStore = defineStore("account_twitter", () => {
  var twitter_account: any = ref([])
  var globalStore = useGlobalStore()
  function setListAccount(twitter_account_list: any[]) {
    console.log(twitter_account_list);


    twitter_account.value = twitter_account_list
  }

  function getTwitterAccount() {
    return twitter_account.value
  }

  function fetchTwitterAccount(cb = () => { }) {
    globalStore.openLoading()
    axios.get(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/get_twitter_account")
      .then((data: any) => {
        var { data } = data
        twitter_account.value = data.data
        globalStore.closeLoading()
        cb()
      })
  }
  return {
    setListAccount,
    getTwitterAccount,
    fetchTwitterAccount,
    twitter_account
  }
})