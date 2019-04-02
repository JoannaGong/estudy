<template>
  <div class="student">
    <a-table
      :columns="columns"
      :rowKey="assignment => assignment.assignment_id"
      :dataSource="student.assignments"
      :pagination="false"
    >
      <template slot="operation" slot-scope="operation, record, index">
        <a-upload name="file" :action="uploadHost" :showUploadList="false"
          :headers="{ Token: token }" :data="{ id: record.assignment_id }"
          @change="handleUpload">
          <a-button icon="upload">上传</a-button>
        </a-upload>
        <a v-if="record.work" :href="`${downloadHost}?id=${record.work.id}&type=student`">
          <a-button icon="download">下载</a-button>
        </a>
      </template>
      <template slot="info" slot-scope="info, record, index">
        <div v-if="record.work">
          <div v-if="record.work.status == 0">
            {{ !record.work.teacher_download_time.isZeroDate() ?
              `${record.work.teacher_download_time} 老师已下载` :
              `${record.work.commit_time} 提交` }}
          </div>
          <div v-else-if="record.work.status == 1">
            <p>{{ `${record.work.review_time} 老师提交修改意见` }}</p>
            <a-button icon="exclamation-circle-o" @click="revision = record.work">查看详细</a-button>
          </div>
          <div v-else>
            <p>{{ `${record.work.review_time} 老师点评完成` }}</p>
            <a-button icon="check-circle-o" @click="revision = record.work">查看详细</a-button>
          </div>
        </div>
      </template>
    </a-table>

    <a-modal :visible="Boolean(revision)" @cancel="revision = false">
      <h4>批改意见</h4>
      <p v-if="revision && revision.teacher_review">{{ revision.teacher_review }}</p>
      <a v-if="revision && revision.teacher_upload_name" :href="`${downloadHost}?id=${revision.id}&type=teacher`">
        <a-button icon="paper-clip">附件</a-button>
      </a>

      <template slot="footer">
        <a-button type="primary" @click="revision = false">明白了</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { get } from 'vuex-pathify'
const HOST = "http://sandbox_api.estudy.chanke.xyz"

export default {
  name: 'Student',
  props: ['student'],
  data() {
    return {
      revision: undefined,
      uploadHost: HOST + '/student/upload',
      downloadHost: HOST + '/student/download',
      columns: [
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
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
        }, {
          title: '状态',
          dataIndex: 'status',
          customRender: (status, record, index) => {
            if (!record.work) return '未提交';
            return this.work_status[record.work.status] || record.work.status;
          },
        }, {
          title: '信息',
          dataIndex: 'info',
          scopedSlots: { customRender: 'info' },
        }
      ],
    };
  },
  computed: {
    token: get('user/info@token'),
    work_status: get('consts/work_status'),
  },
  methods: {
    handleUpload(info) {
      const resp = info.file.response;
      if (info.file.status === 'done' && resp.data) {
        this.$message.info('上传成功');
        const assignment = this.student.assignments.find(asmt => asmt.assignment_id == resp.data.assignment_id);
        if (assignment) {
          this.$set(assignment, 'work', resp.data);
        }
      } else if (info.file.status === 'error') {
        this.$notify.error({
          message: '上传失败',
          description: resp.errorMessage
        });
      }
    }
  }
}
</script>

<style scoped lang="scss">
</style>
