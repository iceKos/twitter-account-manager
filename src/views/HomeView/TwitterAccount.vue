<template>
    <div>
        <div style="display: flex;">
            <div><a-avatar :size="64" :src="record.profile_image_url" /></div>
            <div class="name-display">
                <div style="font-weight: 700;">{{ record.name }}</div>
                <div @click="goToAccount(record.username)" style="cursor: pointer;">@{{ record.username }}</div>
            </div>
            <div style="display:flex;align-items:center" v-if="record?.access_token == null">
                <a-button style="margin-left: 10px;" type="primary"
                    @click="authenTwitterApp(record.authentication_url)">Authenticate</a-button>

                <div style="margin-left: 10px">
                    <a-tag color="orange">Please log in with a valid account before click the
                        button Authenticate</a-tag>
                </div>
            </div>
            <div v-else style="display:flex;align-items:center;justify-content:end;width: 100%;">
                <a-popconfirm title="Are you you want to Synchronize your account?" ok-text="Yes" cancel-text="No"
                    @confirm="confirmSync">
                    <a-button style="margin-left: 10px;" type="">Sync Account Twitter</a-button>
                </a-popconfirm>
                <a-popconfirm title="Are you sure delete this Account?" ok-text="Yes" cancel-text="No"
                    @confirm="confirmDelete">
                    <a-button style="margin-left: 10px;" type="danger">Delete Account</a-button>
                </a-popconfirm>

            </div>
        </div>
        <a-divider />
        <div v-if="record?.access_token != null" style="margin-top:10px">
            <div style="display:flex" id="tweet-box">
                <div style="flex:1">
                    <a-form>
                        <a-textarea v-model:value="tweet_content" placeholder="What's happening?"
                            :auto-size="{ minRows: 5 }" />
                        <a-form-item label="Quote Tweet">
                            <a-switch v-model:checked="quote_tweet_status" @change="disableQuoteTweet" />
                        </a-form-item>
                        <a-form-item label="Quote Tweet ID" v-if="quote_tweet_status == true">
                            <a-input v-model:value="quote_tweet_id" />
                        </a-form-item>
                        <!-- <a-form-item name="upload" label="Upload Media">
                            <a-upload  name="logo" 
                                list-type="picture">
                                <a-button>
                                    <template #icon>
                                        <UploadOutlined />
                                    </template>
                                    Click to upload
                                </a-button>
                            </a-upload>
                        </a-form-item> -->
                        <a-form-item name="upload" label="Upload Media">
                            <a-upload-dragger :file-list="fileList" :supportServerRender="false" :showUploadList="false"
                                :multiple="false" accept="image/png, image/jpeg ,image/gif ,video/mp4"
                                :beforeUpload="async () => { return null }" :customRequest="() => { return null }"
                                @change="handleChangeFileUpload" @drop="handleDropFileUpload">
                                <p class="ant-upload-drag-icon">
                                    <UploadOutlined />
                                </p>
                                <p class="ant-upload-text">Click or drag file to this area to upload</p>
                                <p class="ant-upload-hint">
                                    Support for a single file and type of file can be mp4,png,jpeg and gif
                                </p>
                            </a-upload-dragger>
                        </a-form-item>
                    </a-form>
                    <div id="box-btn-tweet">
                        <a-button type="primary" shape="round" size="large" style="float: right;"
                            @click="tweetToTwitter">
                            <template #icon>
                                <span style="font-size:16px;font-weight: bold;">Post Tweet</span>
                            </template>
                        </a-button>
                    </div>
                </div>
                <div style="flex:1">
                    <div id="preview-card">
                        <div style="display: flex;">
                            <div><a-avatar :size="62" :src="record.profile_image_url" /></div>
                            <div class="name-display" style="width: 100%;">
                                <div style="font-weight: 700;">{{ record.name }}</div>
                                <div @click="goToAccount(record.username)" style="cursor: pointer;">
                                    @{{ record.username }}
                                </div>
                                <a-divider />
                                <div id="text-preview" v-html="parserPreview(tweet_content)">

                                </div>
                                <div id="preview-media" v-if="url && media_type" @mouseover="preview_show = true"
                                    @mouseleave="preview_show = false">
                                    <img v-if="url && ['image/png', 'image/jpeg', 'image/gif'].includes(media_type)"
                                        :src="url" />
                                    <video v-if="url && ['video/mp4'].includes(media_type)" :src="url"> </video>
                                    <div id="remove-media-btn" v-if="preview_show">
                                        <a-button type="dashed" ghost @click="handleRemoveMedia">Remove</a-button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- {{ record }} -->


    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAccountTwitterStore } from "@/stores/account_twitter.store"
import { useGlobalStore } from '@/stores/global';
import { message } from 'ant-design-vue';
import router from "@/router";
import { TwitterOutlined, UploadOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
export default defineComponent({
    components: {
        TwitterOutlined,
        UploadOutlined
    },
    async created() {
        this.findUser()
    },
    methods: {
        handleRemoveMedia() {
            this.media_id = undefined
            this.media_type = ""
            this.url = undefined
        },
        handleChangeFileUpload(event: any) {
            var { file } = event

            this.url = URL.createObjectURL(file.originFileObj);

            this.uploadMedia(file.originFileObj)


        },
        handleDropFileUpload(event: any) {
            var { file } = event
            this.url = URL.createObjectURL(file.originFileObj);
            this.uploadMedia(file.originFileObj)
        },
        uploadMedia(file: File) {
            var formData = new FormData()
            formData.append("media", file)
            formData.append("twitter_user_id", this.record.twitter_user_id)

            this.globalStore.openLoading()

            axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/upload-media", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then((response) => {
                    this.globalStore.closeLoading()
                    if (response.data.status == true) {
                        this.media_type = response.data.data.file_type
                        this.media_id = response.data.data.media_data.media_id_string
                    } else {
                        message.error(response.data.message)
                    }
                })
                .catch((error) => {
                    message.error(error.message)
                })
        },
        findUser() {
            this.globalStore.openLoading()
            this.user_id = String(this.$route.params.user_id)
            var find_user = this.accountTwitterStore.$state.twitter_account.find((x: any) => x.id == this.user_id)
            if (find_user != undefined) {
                setTimeout(() => {
                    this.record = find_user
                    this.globalStore.closeLoading()
                }, 200);
            } else {
                this.globalStore.closeLoading()
                router.push("/home")
            }
        },
        authenTwitterApp(url: string) {
            window.open(url)
        },
        goToAccount(username: string) {
            window.open(`https://twitter.com/${username}`)
        },
        parserPreview(content: string) {
            return content.replace(new RegExp("\n", "g"), "</br>")
        },
        tweetToTwitter() {

            if (this.tweet_content == "") {
                message.warning("Could not find a Content to Tweet.")
                return false
            }

            this.globalStore.openLoading()

            let madia_id = {}

            if (this.media_id != undefined) {
                madia_id = {
                    madia_id: this.media_id
                }
            }

            axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/tweet", { ...madia_id, user_id: this.record.id, content: this.tweet_content, tweet_mode: "shadow_tweet", quote_tweet_id: this.quote_tweet_id })
                .then((data) => {
                    console.log(data.data);
                    if (data.data.status == true) {
                        message.success("Tweet Success")
                        window.open(`https://twitter.com/${this.record.username}/status/${data.data.data.data.id}`)
                    } else {
                        message.error(data.data.message)
                    }
                    this.globalStore.closeLoading()
                })
                .catch((error) => {
                    message.error(error.message)
                    this.globalStore.closeLoading()
                })

        },
        disableQuoteTweet(event: any) {
            if (event == false) {
                this.quote_tweet_id = undefined
            }
        },
        confirmDelete() {
            this.globalStore.openLoading()
            axios.post(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/delete_twitter_account/" + this.user_id)
                .then((response) => {
                    this.globalStore.closeLoading()
                    if (response.data.status == true) {
                        message.success(response.data.data)
                        this.accountTwitterStore.fetchTwitterAccount()
                    } else {
                        message.error(response.data.message)
                    }
                })
                .catch((error) => {
                    this.globalStore.closeLoading()
                    message.error(error.message)
                })
        },
        confirmSync() {
            this.globalStore.openLoading()
            axios.get(import.meta.env.VITE_API_ENDPOINT + "/api/twitter/sync-profile/" + this.user_id)
                .then((response) => {
                    this.globalStore.closeLoading()
                    if (response.data.status == true) {
                        message.success(response.data.data)
                        this.accountTwitterStore.fetchTwitterAccount()
                    } else {
                        message.error(response.data.message)
                    }
                })
                .catch((error) => {
                    this.globalStore.closeLoading()
                    message.error(error.message)
                })
        }
    },
    data(): { preview_show: boolean, media_id?: string, url?: string, media_type: string, fileList: any[], user_id: string, record: any, tweet_content: string, quote_tweet_status: boolean, quote_tweet_id?: string } {
        return {
            preview_show: false,
            media_id: undefined,
            url: undefined,
            fileList: [],
            user_id: "",
            record: {
                name: "New Account",
                username: "Unknow",
                authentication_url: null,
                profile_image_url: null,
                twitter_user_id: null
            },
            tweet_content: "",
            quote_tweet_status: false,
            quote_tweet_id: undefined,
            media_type: ""
        }
    },
    setup() {
        var accountTwitterStore = useAccountTwitterStore()
        var globalStore = useGlobalStore()
        return {
            accountTwitterStore,
            globalStore
        }
    },
    watch: {
        'accountTwitterStore.$state.twitter_account': function () {
            this.findUser()
        }

    }
})
</script>

<style>
.name-display {
    width: 300px;
}

.name-display>div {
    padding: 2.5px;
    margin-left: 10px;
    font-size: 1.1em;

}

#preview-card {
    padding: 30px;
    background-color: none;
    height: 100%;

    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

#tweet-box>div {
    padding: 15px;
}

#preview-media {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
}

#preview-media img,
#preview-media video {
    max-width: 100%;
    max-height: 500px;
}

#remove-media-btn {
    display: flex;
    position: absolute;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.229);
}
</style>