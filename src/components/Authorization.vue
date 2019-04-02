<template>
  <div class="authorization flexrow">
    <form autocomplete="false" action="javascript:;" @submit.prevent="validateBeforeSubmit">
      <fieldset :disabled="$wait.is('auth')">
        <div class="field">
          <a-input placeholder="请输入用户名" type="text" name="name" data-vv-as="用户名"
            :disabled="$wait.is('auth')"
            v-model="form.name"
            v-validate="'required'"
            :class="{ error: errors.has('name') }">
            <a-icon slot="prefix" type='user' class='icon' />
          </a-input>
          <span class="error-tip" v-show="errors.has('name')">{{ errors.first('name') }}</span>
        </div>
        <div class="field">
          <a-input placeholder="请输入密码" type="password" name="password" data-vv-as="密码"
            :disabled="$wait.is('auth')"
            v-model="form.password"
            v-validate="'required'"
            :class="{ error: errors.has('password') }">
            <a-icon slot="prefix" type='lock' class='icon' />
          </a-input>
          <span class="error-tip" v-show="errors.has('password')">{{ errors.first('password') }}</span>
        </div>
        <div class="field">
          <a-button htmlType="submit" type="primary" :disabled="errors.any()" :loading="$wait.is('auth')">登录</a-button>
        </div>
      </fieldset>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Authorization',
  data: () => ({
    form: {
      name: '',
      password: '',
    }
  }),
  methods: {
    validateBeforeSubmit() {
      this.$validator.validateAll().then(result => {
        if (result) {
          this.$wait.start('auth');
          this.$store.dispatch('user/login', this.form).finally(() => {
            this.$wait.end('auth');
          });
        }
      });
    },
  }
}
</script>

<style scoped lang="scss">
.authorization {
  justify-content: center;
}
form {
  width: 400px;
}
.field {
  margin: 20px;

  button {
    width: 100%;
  }
}
.icon {
  color: rgba(0,0,0,.25);
}
</style>
