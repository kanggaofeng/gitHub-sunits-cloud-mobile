<template>
  <view class="formInfo-container">
    <view class="card-container">
      <view class="card-title">派单信息</view>
      <view class="serviceInfoWrap">
        <!-- 使用EditDialog组件 -->
        <EditDialog
          ref="editDialogRef"
          v-bind="tablePopData"
          :model-value="paramForm"
          @update:model-value="handleModelValueChange"
          @item-click="openSelectUser"
          @xiTongPipeiEv="xiTongPipeiEv"
        />
      </view>
    </view>

    <!-- 引入服务网点选择弹窗 -->
    <FuWuZhanPopup ref="fuWuZhanPopupRef" @select="selectGcPopEv" />

    <!-- 引入工程师选择弹窗 -->
    <UserInfoPop ref="userInfoPopRef" @select="selectUserEv" />
  </view>
</template>

<script setup>
import { listStationUser, regionalDirectControSpecify } from '@/api/create-newwork-orderpage/createNewWorkOrderPageApi.js'
import { projectEditAndAddCommonFn } from '@/composables/projectEditAndAddCommon.js'
import EditDialog from '@/components/Edit-Dialog/Edit-Dialog.vue'
import FuWuZhanPopup from './FuWuZhanPopup.vue'
import UserInfoPop from './UserInfoPop.vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
})

const stationId = ref('')

const emit = defineEmits(['upData', 'sendData', 'refresh', 'processIdChange', 'handleStepSuccess'])
const { proxy } = getCurrentInstance()

const rules = ref({})

// 表单引用
const editDialogRef = ref(null)

// 工程师真实ID
const gcsZhen_id = ref('')

// 表单数据
const paramForm = ref({
  izTest: '1', // 默认为测试工单
  stationId: '',
  stationName: '',
  stationCode: '',
  priority: '',
  reponseLevel: '',
})

// 项目信息和派单模式
const projectInfo = ref({})
const selectProcessIdOption_data = ref({})

// 表单配置数据
const tablePopData = ref({
  formItems: [
    {
      field: 'stationName',
      type: 'inputClick',
      label: '服务网点',
      isHiddenForm: true,
      isRequired: '1',
      otherOptions: {
        readonly: true,
      },
      colSpan: 12,
    },
    {
      field: 'priority',
      type: 'select',
      label: '工程师',
      isHiddenForm: true,
      isRequired: '1',
      options: [],
      otherOptions: {},
      loading: false,
      colSpan: 12,
      placeholder: '请选择工程师',
      btnName: '系统匹配',
    },
    {
      field: 'reponseLevel',
      type: 'select',
      label: '区域负责人',
      isHiddenForm: true,
      isRequired: '1',
      options: [],
      otherOptions: {},
      loading: false,
      colSpan: 12,
    },
  ],
})

function commonInit() {
  // 重置表单数据
  resetForm()
}

// 重置表单
function resetForm() {
  paramForm.value = {
    izTest: '1',
    stationId: '',
    stationName: '',
    stationCode: '',
    priority: '',
    reponseLevel: '',
  }
  gcsZhen_id.value = ''
}

// 从projectEditAndAddCommonFn获取工具函数
const { updateFormItemOptions, updateFormItemAttribute } = projectEditAndAddCommonFn(tablePopData)

// 初始化派单信息 - 与PC端保持一致
function initDispatchInfo(cigArr, projectInfoObj, selectProcessIdOption) {
  // 分配方式(1 总部指管| 2区域协调)：distribution
  // 派单范围(0 全部范围| 1指定范围)：dispatchRange
  projectInfo.value = projectInfoObj

  commonInit()
  paramForm.value.izTest = '1'
  // console.log(selectProcessIdOption, 'selectProcessIdOption')
  // console.log(projectInfoObj, 'projectInfoObj')
  selectProcessIdOption_data.value = selectProcessIdOption
  if (selectProcessIdOption && selectProcessIdOption.distribution) {
    if (selectProcessIdOption.distribution == '1') {
      updateFormItemAttribute('stationName', { isHiddenForm: false })
      updateFormItemAttribute('priority', { isHiddenForm: false })
      listStationUserFn()
    }
    if (selectProcessIdOption.distribution == '2') {
      updateFormItemAttribute('reponseLevel', { isHiddenForm: false })

      setReponseLevelOption()
    }
  }
}

function setReponseLevelOption() {
  regionalDirectControSpecify({
    projectId: projectInfo.value.projectId,
    cityId: '',
  }).then((response) => {
    // 展示服务流程
    let options = []
    response.data.forEach((item) => {
      options.push({
        label: item.nickName + '(' + item.userName + ')',
        value: item.userId,
        ...item,
      })
    })
    updateFormItemOptions('reponseLevel', options)
  })
}

// 处理服务网点选择结果
function seleectFuWuZhanEv(params) {
  paramForm.value.stationId = params.id
  paramForm.value.stationName = params.stationName
  paramForm.value.stationCode = params.stationCode
  paramForm.value.priority = ''
  listStationUserFn()
}

/** 打开授权用户表弹窗 */
function openSelectUser(val) {
  if (val.field === 'stationName') {
    // 获取客户信息
    console.log('📢 [DispatchMode.vue:185]', selectProcessIdOption_data.value)
    proxy.$refs['fuWuZhanPopupRef'].open(paramForm, selectProcessIdOption_data.value, { province: '', city: '', county: '' })
  }
}

const handleModelValueChange = (value, selectItem) => {
  if (value.priority && selectItem && selectItem.options) {
    selectItem.options.forEach((item) => {
      if (item.id == value.priority) {
        paramForm.value.stationId = item.stationId
        paramForm.value.stationName = item.stationName
        paramForm.value.stationCode = item.stationCode
        paramForm.value.priority = item.id
      }
    })
  }

  Object.assign(paramForm.value, value)
}

function selectGcPopEv(params) {
  paramForm.value.stationId = params.id
  paramForm.value.stationName = params.stationName
  paramForm.value.stationCode = params.stationCode
  paramForm.value.priority = ''
  gcsZhen_id.value = ''
  // 选中服务网点后请求工程师列表
  listStationUserFn()
}

function xiTongPipeiEv(val) {
  listStationUser({
    pageNum: 1,
    pageSize: 10000,
    userName: '',
    stationId: paramForm.value.stationId,
    status: '0',
    delFlag: '0',
    userType: '2',
  })
    .then((res) => {
      let options = []
      res.rows.forEach((item) => {
        options.push({
          label: item.nickName + '(' + item.userName + ')',
          value: item.id,
          ...item,
        })
      })
      updateFormItemOptions('priority', options)
      if (res.total == 1) {
        paramForm.value.priority = res.rows[0].userName
        paramForm.value.stationId = res.rows[0].stationId
        paramForm.value.stationName = res.rows[0].stationName
        paramForm.value.stationCode = res.rows[0].stationCode
        gcsZhen_id.value = res.rows[0].id
      } else {
        proxy.$refs.userInfoPopRef.open(paramForm.value.stationId, gcsZhen_id.value ? gcsZhen_id.value : paramForm.value.priority)
      }
    })
    .finally(() => {})
}

function listStationUserFn() {
  return listStationUser({
    pageNum: 1,
    pageSize: 10000,
    userName: '',
    stationId: paramForm.value.stationId,
    status: '0',
    delFlag: '0',
    userType: '2',
  })
    .then((res) => {
      let options = []
      res.rows.forEach((item) => {
        options.push({
          label: item.nickName + '(' + item.userName + ')',
          value: item.id,
          ...item,
        })
      })
      updateFormItemOptions('priority', options)
    })
    .finally(() => {})
}

// 处理工程师选择结果
function selectUserEv(params) {
  console.log('工程师选择结果:', params)
  paramForm.value.priority = params.userName
  paramForm.value.stationId = params.stationId
  paramForm.value.stationName = params.stationName
  paramForm.value.stationCode = params.stationCode
  gcsZhen_id.value = params.id
  // 选中工程师后不需要再请求接口
}

// 提交表单 - 与PC端保持一致
function submitForm() {
  let receivePerson = '' // 接收人
  if (selectProcessIdOption_data.value.distribution == '1') {
    receivePerson = gcsZhen_id.value ? gcsZhen_id.value : paramForm.value.priority
  }
  if (selectProcessIdOption_data.value.distribution == '2') {
    receivePerson = paramForm.value.reponseLevel
  }
  return new Promise((resolve, reject) => {
    proxy.$refs.editDialogRef.EditDialogPop.validate((valid) => {
      if (valid) {
        let objInfo = {
          dispatchMode: selectProcessIdOption_data.value.distribution || '', ////派单模式 流程选中之后的接口中返回
          izTest: paramForm.value.izTest,
          serviceStationId: paramForm.value.stationId || '',
          receivePerson: receivePerson || '',
        }
        resolve(objInfo)
      } else {
        reject('验证失败')
      }
    })
  })
}

defineExpose({
  initDispatchInfo,
  submitForm,
})
</script>

<style lang="scss" scoped>
@import '@/components/Edit-Dialog/compont/Edit-Dialog.scss';
</style>
