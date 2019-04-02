<template>
  <div class="teacher">
    <a-table
      :columns="assignmentColumns"
      :rowKey="assignment => assignment.assignment_id"
      :dataSource="teacher.assignments"
      :pagination="false"
    >
      <template slot="operation" slot-scope="operation, record, index">
        <div v-if="record.work_count > 0">
          <a-button v-if="!revisingAssignment" type="primary" icon="plus-square-o" @click="revisingAssignment = record">展开</a-button>
          <a-button v-else type="primary" icon="minus-square-o" @click="revisingAssignment = false">收起</a-button>
          <a :href="`${downloadHost}All?id=${record.assignment_id}`">
            <a-button icon="download">下载全部</a-button>
          </a>
        </div>
        <a-popconfirm v-else title="确定删除该作业？" okText="确定" cancelText="取消"
          @confirm="removeAssignment(record.assignment_id)">
          <a-button type="danger" icon="delete">删除</a-button>
        </a-popconfirm>
      </template>
    </a-table>

    <a-table v-if="revisingAssignment"
      :columns="workColumns"
      :rowKey="work => work.id"
      :dataSource="revisingAssignment.works"
      :pagination="false"
    >
      <template slot="operation" slot-scope="operation, record, index">
        <a :href="`${downloadHost}?id=${record.id}&type=student`">
          <a-button icon="download">下载</a-button>
        </a>
        <a-button type="primary" icon="form" @click="revisingWork = record; reviseForm.review = record.teacher_review">批改</a-button>
      </template>
    </a-table>

    <a-modal :visible="Boolean(revisingWork)" @cancel="revisingWork = false" :footer="null">
      <form :disabled="$wait.is('creating')">
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label='状态'>
          <a-select v-model="reviseForm.status" name="status"
            v-validate="'required'" data-vv-as="状态"
            :class="{ error: errors.has('status') }"
          >
            <a-select-option v-for="(status_name, status) of work_status" :key="`status_${status}`"
              :value="status">{{ status_name }}</a-select-option>
          </a-select>
          <span class="error-tip" v-show="errors.has('status')">{{ errors.first('status') }}</span>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label='批改意见'>
          <a-textarea v-model="reviseForm.review" name="review" autosize
            v-validate="'required'" data-vv-as="批改意见"
            :class="{ error: errors.has('review') }" />
          <span class="error-tip" v-show="errors.has('review')">{{ errors.first('review') }}</span>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" label='附件'>
          <a-upload name="file" :action="uploadHost"
            :headers="{ Token: token }" :data="{ id: revisingWork.id }"
            @change="handleUpload">
            <a-button icon="upload">上传</a-button>
          </a-upload>
        </a-form-item>
        <a-form-item :labelCol="labelCol" :wrapperCol="wrapperColNoLabel">
          <a-button type='primary' @click="reviseWork" :loading="$wait.is('creating')">保存</a-button>
        </a-form-item>
      </form>
    </a-modal>
  </div>
</template>

<script>
import { get } from 'vuex-pathify'
import { api } from '@/utils/api'
const HOST = "http://sandbox_api.estudy.chanke.xyz"


export default {
  name: 'Teacher',
  props: ['teacher'],
  data() {
    return {
      revisingAssignment: false,
      revisingWork: false,
      reviseForm: {
        status: 1,
        review: '',
      },
      uploadHost: HOST + '/teacher/upload',
      downloadHost: HOST + '/teacher/download',
      workColumns: [
        {
          title: '学员名字',
          dataIndex: 'user.full_name',
        }, {
          title: '学号',
          dataIndex: 'user.name',
        }, {
          title: '提交的作业名称',
          dataIndex: 'student_upload_name',
        }, {
          title: '提交时间',
          dataIndex: 'commit_time',
        }, {
          title: '状态',
          dataIndex: 'status',
          customRender: status => {
            return this.work_status[status] || status;
          },
        }, {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
        }
      ],
    };
  },
  computed: {
    ...get('layout/*'),
    work_status: get('consts/work_status'),
    token: get('user/info@token'),
    assignmentColumns() {
      return [
        {
          title: '课程',
          dataIndex: 'org_name',
        }, {
          title: '作业名称',
          dataIndex: 'name',
        }, {
          title: '开始-截止时间',
          dataIndex: 'start_time',
          customRender(start_time, record, index) {
            return `${start_time} ~ ${record.end_time}`;
          },
        }, {
          title: '状态',
          dataIndex: 'status',
          customRender(start_time, record, index) {
            return `${record.student_count} 个学员 / ${record.work_count} 个提交` +
              (record.work_update_time ? ` - ${record.work_update_time}` : '');
          },
        }, {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          filteredValue: this.revisingAssignment ? [this.revisingAssignment.assignment_id] : null,
          onFilter: (value, record) => {
            return record.assignment_id == value;
          }
        }
      ];
    },
  },
  methods: {
    removeAssignment(assignmentId) {
      api.post('/teacher/deleteAssignment', { id: assignmentId }).then(resp => {
        const index = this.teacher.assignments.findIndex(assignment => assignment.assignment_id == assignmentId);
        if (index != -1) {
          this.teacher.assignments.splice(index, 1);
          this.$message.info('作业已删除');
        }
      });
    },
    reviseWork() {
      this.$validator.validateAll().then(result => {
        if (result) {
          const params = {
            id: this.revisingWork.id,
            status: this.reviseForm.status,
            review: this.reviseForm.review,
          };
          this.$wait.start('creating');
          api.post('/teacher/review', params).then(resp => {
            // 将 resp 内的字段覆盖到 this.revisingWork
            Object.entries(resp).forEach(entry => this.$set(this.revisingWork, entry[0], entry[1]))
          }).finally(() => {
            this.revisingWork = false;
            this.$wait.end('creating');
          });
        }
      });
    },
    handleUpload() {

    },
  }
}
</script>

<style scoped lang="scss">
</style>
