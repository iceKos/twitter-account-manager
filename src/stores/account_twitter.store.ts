import axios from 'axios';
import { defineStore } from 'pinia'
import { useGlobalStore } from "@/stores/global"
import { ref } from 'vue';

export const useAccountTwitterStore = defineStore("account_twitter", () => {
  var getLocalStorageAccountFavorite = localStorage.getItem("account_favorite")

  let initAccountFavorite = []

  if (getLocalStorageAccountFavorite != null) {
    initAccountFavorite = JSON.parse(getLocalStorageAccountFavorite)
  }
  var twitter_account: any = ref([])
  var account_favorite: any = ref(initAccountFavorite)
  var globalStore = useGlobalStore()
  function setListAccount(twitter_account_list: any[]) {
    twitter_account.value = twitter_account_list
  }

  function getTwitterAccount() {
    return twitter_account.value
  }

  function getFavoriteAccount() {
    var favorite = JSON.parse(JSON.stringify(account_favorite.value))
    let _twitter_account = JSON.parse(JSON.stringify(twitter_account.value)).filter((x: any) => favorite.includes(x.id))
    return _twitter_account
  }

  function fetchTwitterAccount(cb = () => { }) {
    globalStore.openLoading()
    axios.get(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/get_twitter_account")
      .then((data: any) => {
        var { data } = data
        twitter_account.value = data.data.map((x: any, index: number) => {
          x.key = index.toString()
          x.disabled = false
          return x
        })
        globalStore.closeLoading()
        cb()
      })
  }

  function accountFavorite(user_id: string) {
    var favorite = JSON.parse(JSON.stringify(account_favorite.value))

    if (!favorite.find((x: any) => x == user_id)) {
      account_favorite.value.push(user_id)
    } else {
      account_favorite.value = account_favorite.value.filter((x: any) => x != user_id)
    }
  }

  function accountVerified(): Array<any> {
    return twitter_account.value.filter((x: any) => {
      return x.twitter_user_id != null
    })
  }
  return {
    setListAccount,
    getTwitterAccount,
    fetchTwitterAccount,
    getFavoriteAccount,
    accountFavorite,
    twitter_account,
    account_favorite,
    accountVerified
  }
})