import '@/utils/prototypeEnhance'

import Vue from 'vue'
import store from './store/index'

import VueWait from 'vue-wait'
Vue.use(VueWait)

import zh_CN from 'vee-validate/dist/locale/zh_CN'
import VeeValidate, { Validator } from 'vee-validate'
Vue.use(VeeValidate)
Validator.localize('zh_CN', zh_CN)

import { LocaleProvider, Button, Icon, Layout, Table,
	Select, Input, DatePicker, Form, Upload,
	Popconfirm, Modal, Message, Notification, Spin } from 'ant-design-vue';

Vue.use(LocaleProvider)
Vue.use(Button)
Vue.use(Icon)
Vue.use(Layout)
Vue.use(Table)
Vue.use(Select)
Vue.use(Input)
Vue.use(DatePicker)
Vue.use(Form)
Vue.use(Upload)
Vue.use(Popconfirm)
Vue.use(Modal)
Vue.use(Message)
Vue.use(Notification)
Vue.use(Spin)

Vue.$message = Message
Vue.prototype.$message = Message
Vue.$notify = Notification
Vue.prototype.$notify = Notification

Vue.config.productionTip = false

import App from './App.vue'

new Vue({
  store,
  wait: new VueWait({
    // useVuex: true,
  }),
  render: h => h(App)
}).$mount('#app')
