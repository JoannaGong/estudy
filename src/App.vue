<template>
  <a-locale-provider :locale="zh_CN">
    <a-layout id="app">
      <a-layout-header class="header flexrow" :class="{ teacher: isTeacher }">
        <h2 class="logo">蝉壳 eStudy</h2>
        <div class="right flexrow" v-if="loggedIn">
          <div class="flexrow" v-if="isTeacher">
            <h4>{{ info.name }}</h4>
            <a-button class="vcenter" icon="file-add" type="primary" @click="createModalDisplay = true">新建作业</a-button>
          </div>
          <div class="flexrow" v-else>
            <h4 class="flexcol">
              <span v-if="info.full_name">{{ info.full_name }}</span>
              <span>学号：{{ info.name }}</span>
            </h4>
            <h5 class="flexcol" v-if="loaded">
              <span v-for="(org, index) of student.orgs" :key="`org_${index}`">{{ org }}</span>
            </h5>
            <div v-if="loaded">
              <label>{{ student.stats.uncommitted }}个作业待提交</label>
              <label>{{ student.stats.revising }}个作业待批改</label>
              <label>{{ student.stats.improvable }}个作业需完善</label>
              <label>{{ student.stats.finished }}个作业已完成</label>
            </div>
          </div>
          
          <a class="vcenter" href="http://vipgit.chanke.xyz/" target="_blank">
            <a-button icon="home">代码仓库</a-button>
          </a>
          <a-button class="vcenter" icon="logout" @click="$store.commit('user/logout')">退出</a-button>
        </div>
      </a-layout-header>

      <a-layout-content>
        <Authorization v-if="!loggedIn" />
        <div v-else>
          <Teacher v-if="isTeacher" :teacher="teacher" />
          <Student v-else :student="student" />
        </div>

        <a-modal :visible="createModalDisplay" @cancel="createModalDisplay = false" :footer="null">
          <form :disabled="$wait.is('creating')">
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label='课程'>
              <a-select v-model="createForm.org_id" name="org_id"
                v-validate="'required'" data-vv-as="课程"
                :class="{ error: errors.has('org_id') }"
              >
                <a-select-option v-for="(org, index) of teacher.orgs" :key="`org_${index}`"
                  :value="org.id">{{ org.full_name }}</a-select-option>
              </a-select>
              <span class="error-tip" v-show="errors.has('org_id')">{{ errors.first('org_id') }}</span>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label='作业名称'>
              <a-input v-model="createForm.name" name="name"
                v-validate="'required'" data-vv-as="作业名称"
                :class="{ error: errors.has('name') }" />
              <span class="error-tip" v-show="errors.has('name')">{{ errors.first('name') }}</span>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label='开始/结束时间'>
              <a-range-picker v-model="createForm.time_range" name="time_range"
                v-validate="'required'" data-vv-as="开始/结束时间" />
              <span class="error-tip" v-show="errors.has('time_range')">{{ errors.first('time_range') }}</span>
            </a-form-item>
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperColNoLabel">
              <a-button type='primary' @click="createAssignment" :loading="$wait.is('creating')">保存</a-button>
            </a-form-item>
          </form>
        </a-modal>
      </a-layout-content>
    </a-layout>
  </a-locale-provider>
</template>

<script>
import { get } from 'vuex-pathify'
import { api } from '@/utils/api'
import zh_CN from 'ant-design-vue/lib/locale-provider/zh_CN';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');

import Authorization from '@/components/Authorization.vue'
import Teacher from '@/components/Teacher.vue'
import Student from '@/components/Student.vue'

export default {
  name: 'app',
  components: {
    Authorization,
    Teacher,
    Student,
  },
  data () {
    return {
      zh_CN,
      createModalDisplay: false,
      createForm: {
        org_id: '',
        name: '',
        time_range: [moment(), moment()],
      },
      loaded: false,
      student: {
        orgs: [],
        stats: {},
        assignments: [],
      },
      teacher: {
        orgs: [],
        assignments: [],
      },
    }
  },
  computed: {
    ...get('user/*'),
    ...get('layout/*'),
    isTeacher() {
      return this.info.is_admin > 0;
    },
  },
  created () {
    if (this.loggedIn && !this.loaded) {
      this.loadDetail();
    }
  },
  watch: {
    loggedIn: function(val) {
      if (val) {
        this.loadDetail();
      }
    },
  },
  methods: {
    loadDetail() {
      if (this.isTeacher) {
        api.get('/teacher/detail').then(resp => {
          this.teacher.orgs = resp.orgs;
          this.teacher.assignments = resp.assignments;
          this.loaded = true;
        });
      } else {
        api.get('/student/detail').then(resp => {
          this.student.orgs = resp.orgs;
          this.student.stats = resp.stats;
          this.student.assignments = resp.assignments;
          this.loaded = true;
        });
      }
    },
    createAssignment() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const params = {
            org_id: this.createForm.org_id,
            name: this.createForm.name,
            start_time: this.createForm.time_range[0].format('YYYY-MM-DD'),
            end_time: this.createForm.time_range[1].format('YYYY-MM-DD'),
          };
          this.$wait.start('creating');
          api.post('/teacher/createAssignment', params).then(resp => {
            this.loadDetail();
          }).finally(() => {
            this.createModalDisplay = false;
            this.$wait.end('creating');
          });
        }
      });
    },
  },
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  min-height: 100vh;
}
.header {
  font-size: 1.1em;
  color: white;
  padding: 0 40px;

  h1, h2, h3, h4, h5, h6 {
    color: white;
  }
  .right > .flexrow > * {
    margin-right: 25px;
  }
  label {
    padding: 0 5px;
  }
}
.logo {
}

.flexrow {
  display: flex;
  flex-flow: row nowrap;
}
.flexcol {
  height: 100%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-evenly;

  & > * {
    flex: 1;
    max-height: 20px;
    line-height: 20px;
  }
}
.right {
  margin-left: auto;
}
.center {
  text-align: center;
}
.vcenter {
  align-self: center;
}
.pointer {
  cursor: pointer;
}
.error {
  border: 1px solid red;
}
.error-tip {
  color: red;
  font-size: 10px;
}
</style>
