<template>
    <!-- <a-layout-header class="header">
    <div class="logo">Nakamoto Twitter</div>
  </a-layout-header> -->

    <body style="display: flex;justify-content: center;align-items: center">

        <a-form :model="formState" name="normal_login" class="login-form" @finish="onFinish"
            @finishFailed="onFinishFailed">
            <h1 class="login">Nakamoto <span style="color:#8cc5f2;font-weight: bold;">Twitter</span></h1>
            <div class="borders">

                <a-form-item label="Email" name="email"
                    :rules="[{ required: true, message: 'Please input your email!' }]"
                    style="top: 10px; padding-left: 15px; left: 5px;">
                    <a-input v-model:value="formState.email" style="max-width: 200px; margin: 5px; ;">
                        <template #prefix>
                            <UserOutlined class="site-form-item-icon" />
                        </template>
                    </a-input>
                </a-form-item>

                <a-form-item label="Password" name="password"
                    :rules="[{ required: true, message: 'Please input your password!' }]" style="margin-top: 10px;">
                    <a-input-password v-model:value="formState.password" style="max-width: 200px; margin: 5px; ">
                        <template #prefix>
                            <LockOutlined class="site-form-item-icon" />
                        </template>
                    </a-input-password>
                </a-form-item>

                <a-form-item>
                    <a-form-item name="remember" no-style>
                        <a-checkbox v-model:checked="formState.remember">Remember me</a-checkbox>
                    </a-form-item>
                </a-form-item>

                <a-form-item>
                    <a-button :disabled="disabled" type="primary" html-type="submit" class="login-form-button"
                        style="align-items: center">
                        Log in
                    </a-button>
                </a-form-item>
            </div>
        </a-form>

    </body>
</template>
<script lang="ts">
import { defineComponent, reactive, computed } from 'vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import axios from 'axios'
import { message } from 'ant-design-vue'
interface FormStateLogin {
    email: string
    password: string
    remember: boolean
}
export default defineComponent({
    components: {
        UserOutlined,
        LockOutlined
    },
    setup() {
        const formState = reactive<FormStateLogin>({
            email: '',
            password: '',
            remember: true
        })
        const onFinish = (values: FormStateLogin) => {

            axios.put(import.meta.env.VITE_API_ENDPOINT + "/api/admin/auth/authentication", { "data": values })
                .then((response) => {
                    if (response.data.status == true) {
                        message.success("login success")
                    } else {
                        message.warning(response.data.message)
                    }
                }).catch((err) => {
                    message.error(err.message)
                })
        }

        const onFinishFailed = (errorInfo: any) => {
            console.log('Failed:', errorInfo)
        }
        const disabled = computed(() => {
            return !(formState.email && formState.password)
        })
        return {
            formState,
            onFinish,
            onFinishFailed,
            disabled
        }
    }
})
</script>
<style>
.NAKA {
    padding-top: 15px;
    font-size: 50px;
    text-transform: uppercase;
    font-weight: bold;
    top: 250px;
    left: 60%;
    text-align: center;
    max-width: fit-content;
}

.TWITTER {
    padding-top: 15px;
    font-size: 50px;
    /* text-transform: uppercase; */
    font-weight: bold;
    top: 250px;
    left: 62%;
    text-align: center;
    max-width: fit-content;
    color: #00acee;
}

.login {
    padding-top: 15px;
    font-size: 25px;
    font-weight: bold;
}

.borders {
    padding-bottom: 10px;
    padding-left: 10px;
    padding-right: 10px;
}

.login-form {
    width: 350px;

    box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
    border-radius: 5px;
    text-align: center;
    height: 350px;
    background-color: rgb(251, 251, 251)
}

.login-form-button {
    max-width: fit-content;
}
</style>
