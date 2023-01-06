import { defineStore } from 'pinia'
import { ref } from 'vue';

export const useUserStore = defineStore("users", () => {
    var initUser = JSON.parse(`${localStorage.getItem('user')}`)
    var user: any = ref(initUser)
    function setUser(_user: { _id: string }) {
        localStorage.setItem('user', JSON.stringify(_user))
        user.value = _user
    }
    return {
        user,
        setUser
    }
})