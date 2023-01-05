<template>
  <!-- <a-layout-header class="header">
    <div class="logo">Nakamoto Twitter</div>
  </a-layout-header> -->
<body style=" background: radial-gradient(ellipse at left, #00acee, transparent 70%);">

    <a-form
    :model="formState"
    name="normal_login"
    class="login-form"
    @finish="onFinish"
    @finishFailed="onFinishFailed"
    
  >
    <h1 class="login">Login</h1>
    <div class="borders">
        
      <a-form-item
        label="Email"
        name="email"
        :rules="[{ required: true, message: 'Please input your email!' }]"
        style="top: 10px; padding-left: 15px; left: 5px;"
      >
        <a-input
          v-model:value="formState.email"
          style="max-width: 200px; margin: 5px; ;"
        >
          <template #prefix>
            <UserOutlined class="site-form-item-icon" />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label="Password"
        name="password"
        :rules="[{ required: true, message: 'Please input your password!' }]"
        style="margin-top: 10px;"
      >
        <a-input-password
          v-model:value="formState.password"
          style="max-width: 200px; margin: 5px; "
        >
          <template #prefix>
            <LockOutlined class="site-form-item-icon" />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-form-item name="remember" no-style>
          <a-checkbox v-model:checked="formState.remember"
            >Remember me</a-checkbox
          >
        </a-form-item>
      </a-form-item>

      <a-form-item>
        <a-button
          :disabled="disabled"
          type="primary"
          html-type="submit"
          class="login-form-button"
          style="align-items: center"
        >
          Log in
        </a-button>
      </a-form-item>
    </div>
  </a-form>

  <h1 class="NAKA">NAKAMOTO</h1>
    <h1 class="TWITTER">TWITTER</h1>
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

      axios.put(import.meta.env.VITE_API_ENDPOINT + "/api/admin/auth/authentication",{"data":values})
      .then((response)=>{
        if(response.data.status == true){
          message.success("login success")  
        }else{
          message.warning(response.data.message)
        }
      }).catch((err)=>{
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
  text-transform: uppercase;
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
  text-transform: uppercase;
  font-weight: bold;
}
.borders {
  padding-bottom: 10px;
  padding-left: 10px;
  padding-right: 10px;
}
.login-form {
  border: 1px solid #00acee;
  box-shadow: 5px 5px #00acee;
  border-radius: 25px;
  text-align: center;
  position: absolute;
  top: 350px;
  left: 30%;
  transform: translate(-50%, -50%);
  background-color: rgb(251, 251, 251)
}
.login-form-button {
  max-width: fit-content;
}
</style>
