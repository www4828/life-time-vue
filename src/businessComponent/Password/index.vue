<template>
  <el-dialog
    :model-value="props.dialogVisible"
    title="修改密码"
    width="30%"
    @close="handleClose"
    custom-class="card"
    :modal="false"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div
      v-loading.fullscreen.lock="loading"
      element-loading-background="rgba(255,255,255,0.3)"
      element-loading-text="正在提交请稍后!"
    >
      <el-form
        ref="passForm"
        :model="ruleForm"
        :rules="rules"
        label-position="right"
        :inline="true"
        style="margin-bottom: 50px"
      >
        <el-form-item label="旧密码:" prop="oldPassword">
          <el-input
            v-model="ruleForm.oldPassword"
            type="password"
            autocomplete="off"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码:" prop="pass">
          <el-input
            v-model="ruleForm.pass"
            type="password"
            autocomplete="off"
            show-password
            @input="passChange"
          />
          <div class="levelBox">
            <span :class="ruleForm.level > 32 ? 'low' : 'levels'">弱</span>
            <span :class="ruleForm.level > 65 ? 'medium' : 'levels'">中</span>
            <span :class="ruleForm.level > 99 ? 'hight' : 'levels'">强</span>
          </div>
        </el-form-item>
        <!-- <el-form-item label="密码强度" class="progress-block">
        <el-progress :percentage="ruleForm.level" :color="customColors" :format="format" />
      </el-form-item> -->
        <el-form-item label="确认密码:" prop="checkPass">
          <el-input
            v-model="ruleForm.checkPass"
            type="password"
            autocomplete="off"
            show-password
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submit"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { ElMessage, type FormRules } from 'element-plus'
import { UserService } from '@/api/service/System/UserService'
import { verifyPasswordStrength } from '@/utils/toolsValidate'
import { Session } from '@/utils/storage'

const emit = defineEmits(['close', 'save'])
interface Props {
  dialogVisible?: boolean
}
const customColors = [
  { color: '#f56c6c', percentage: 33 },
  { color: '#e6a23c', percentage: 66 },
  { color: '#5cb87a', percentage: 100 },
  { color: '#1989fa', percentage: 80 },
  { color: '#6f7ad3', percentage: 100 },
]
const loading = ref(false)

const validateOldPass = (rule: any, value: any, callback: any) => {
  if (value == '') {
    callback(new Error('请输入旧密码'))
  } else {
    let { username } = Session.get('userInfo')
    passForm.value!.clearValidate('oldPassword')
    userService
      .checkPassword({
        userCode: username,
        password: ruleForm.oldPassword,
      })
      .then((res) => {
        if (res.data) {
          callback()
        } else {
          callback(new Error('密码错误！'))
        }
      })
  }
}
const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入新密码'))
  } else {
    if (value.length > 5 && value.length < 17) {
      if (value === ruleForm.oldPassword) {
        callback(new Error('该密码正在使用'))
      } else {
        if (verifyPasswordStrength(value) == '强') {
          callback()
        } else {
          callback(new Error('由数字、字母、特殊符号组成'))
        }
      }
    } else {
      callback(new Error('长度在6-16，由数字、字母、特殊符号组成'))
    }
  }
}
const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== ruleForm.pass) {
    callback(new Error('两次密码不同!'))
  } else {
    callback()
  }
}

const passChange = (value: any) => {
  ruleForm.checkPass = ''
  let level = verifyPasswordStrength(value)
  if (level === '强') {
    ruleForm.level = 100
  } else if (level === '中') {
    ruleForm.level = 66
  } else {
    ruleForm.level = 33
  }
}
const format = (percentage: any) => {
  if (percentage < 34) {
    return '弱'
  } else if (percentage > 66) {
    return '强'
  } else {
    return '中'
  }
}
const rules = reactive<FormRules>({
  oldPassword: [{ validator: validateOldPass, trigger: 'blur' }],
  pass: [{ validator: validatePass, trigger: 'blur' }],
  checkPass: [{ validator: validatePass2, trigger: 'blur' }],
})

let ruleForm: any = reactive({
  pass: '',
  checkPass: '',
  level: 0,
  oldPassword: '',
})

const passForm: any = ref()
const userService = new UserService()
const props = withDefaults(defineProps<Props>(), {
  dialogVisible: false,
})

const submit = async () => {
  if (ruleForm.pass === ruleForm.oldPassword) {
    ElMessage.warning('新密码和旧密码相同！')
  } else if (ruleForm.level != 100) {
    ElMessage.warning('密码强度不够！')
  } else {
    await passForm.value!.validate((valid: any, fields: any) => {
      if (valid) {
        let { username } = Session.get('userInfo')
        loading.value = true
        userService
          .updatePassword({
            userCode: username,
            password: ruleForm.pass,
          })
          .then((res) => {
            loading.value = false
            ElMessage({
              type: res.code == 200 ? 'success' : 'error',
              message: res.message,
            })
            handleClose()
          })
      }
    })
  }
}

const handleClose = () => {
  emit('close', false)
  passForm.value!.resetFields()
  ruleForm.level = 0
}
</script>
<style lang="scss" scoped>
.el-progress {
  width: 100%;

  ::v-deep(.el-progress__text) {
    min-width: 0;
  }
}

.slider-demo-block {
  display: flex;
  align-items: center;
}

.slider-demo-block .el-slider {
  margin-top: 0;
  padding: 0 10px 10px;
  box-sizing: border-box;
}

.slider-demo-block .demonstration {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 44px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 0;
}

.slider-demo-block .demonstration + .el-slider {
  flex: 0 0 70%;
}

::v-deep(.el-slider__marks-text) {
  margin-top: 5px;
}

.oldPassword {
  padding: 20px 0 20px 20px;
}

.progress-block {
  width: calc(100% - 120px);
  display: flex;
  align-items: center;
  justify-content: end;
}

.levelBox {
  width: 100%;
  height: 15px;
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
}

.levels {
  width: 32%;
  text-align: center;
  border: 1px solid #e6e6e6;
  font-size: 8px;
  line-height: 15px;
  background-color: #e6e6e6;
}

.low {
  width: 32%;
  text-align: center;
  border: 1px solid #ffd700;
  font-size: 8px;
  line-height: 15px;
  background-color: #ffd700;
  color: #fff;
}

.medium {
  width: 32%;
  text-align: center;
  border: 1px solid #ff7f00;
  font-size: 8px;
  line-height: 15px;
  background-color: #ff7f00;
  color: #fff;
}

.hight {
  width: 32%;
  text-align: center;
  border: 1px solid #ee4000;
  font-size: 8px;
  line-height: 15px;
  background-color: #ee4000;
  color: #fff;
}
</style>
