
import { useDict, getAllDict, defineComponentTitleFn, generatePassword, getAllProjects, getAllCity } from '@/utils/dict'
import { parseTime, resetForm, addDateRange, addCityRange, handleTree, selectDictLabel, selectDictLabels } from '@/utils/ruoyi'
import { handlePushClick, handlePushReceive } from '@/utils/messages'

export default function registerGlobalMethods(app) {
  // 全局方法挂载
  app.config.globalProperties.useDict = useDict
  app.config.globalProperties.getAllCity = getAllCity
  app.config.globalProperties.getAllProjects = getAllProjects
  app.config.globalProperties.getAllDict = getAllDict
  app.config.globalProperties.generatePassword = generatePassword
  app.config.globalProperties.defineComponentTitleFn = defineComponentTitleFn
  app.config.globalProperties.parseTime = parseTime
  app.config.globalProperties.resetForm = resetForm
  app.config.globalProperties.handleTree = handleTree
  app.config.globalProperties.addDateRange = addDateRange
  app.config.globalProperties.addCityRange = addCityRange
  app.config.globalProperties.selectDictLabel = selectDictLabel
  app.config.globalProperties.selectDictLabels = selectDictLabels
  app.config.globalProperties.handlePushReceive = handlePushReceive
  app.config.globalProperties.handlePushClick = handlePushClick
}
