<template>
  <div class="safe-policy-page">

    <el-tabs v-model="activeTab" class="policy-tabs">
      <el-tab-pane label="访问控制" name="access">
        <div class="tab-content">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <div>
                  <span>IP访问控制</span>
                  <small>共 {{ ipRules.length }} 条IP规则</small>
                </div>
                <div class="header-actions">
                  <span class="switch-label">启用IP白名单</span>
                  <el-switch v-model="ipWhiteListEnabled" @change="savePolicy('IP白名单配置已更新')" />
                  <el-button type="primary" size="small" :icon="Plus" @click="savePolicy('添加IP规则')">添加IP规则</el-button>
                </div>
              </div>
            </template>
            <el-table :data="ipRules" border size="small">
              <el-table-column prop="ip" label="IP地址段" min-width="160" />
              <el-table-column prop="type" label="类型" width="110">
                <template #default="{ row }">
                  <el-tag :type="row.type === '白名单' ? 'success' : 'danger'" effect="light">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="110">
                <template #default="{ row }">
                  <el-tag :type="row.status === '启用' ? 'success' : 'info'" effect="plain">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createdAt" label="创建时间" width="130" />
              <el-table-column label="操作" width="140" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link :icon="Edit" @click="savePolicy(`编辑IP规则 ${row.ip}`)">编辑</el-button>
                  <el-button type="danger" link :icon="Delete" @click="confirmAction(`确定删除IP规则 ${row.ip} 吗？`)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>频率限制</span>
                <el-button type="primary" size="small" @click="savePolicy('频率限制配置已保存成功')">保存配置</el-button>
              </div>
            </template>
            <el-form label-position="top" class="policy-form">
              <el-row :gutter="16">
                <el-col :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item label="单IP每秒请求数(QPS)">
                    <el-input-number v-model="rateLimit.singleIpQps" :min="1" controls-position="right" />
                    <span class="unit-text">QPS</span>
                  </el-form-item>
                </el-col>
                <el-col :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item label="单应用每日调用次数">
                    <el-input-number v-model="rateLimit.appDaily" :min="1" controls-position="right" />
                    <span class="unit-text">次/日</span>
                  </el-form-item>
                </el-col>
                <el-col :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item label="单IP每日调用次数">
                    <el-input-number v-model="rateLimit.ipDaily" :min="1" controls-position="right" />
                    <span class="unit-text">次/日</span>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>跨域访问设置</span>
                <el-switch v-model="corsEnabled" @change="savePolicy('跨域访问配置已更新')" />
              </div>
            </template>
            <el-input v-model="allowedOrigins" type="textarea" :rows="4" placeholder="https://api.example.com" />
            <div class="card-footer">
              <el-button type="primary" @click="savePolicy('CORS配置已保存成功')">保存配置</el-button>
            </div>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="认证策略" name="auth">
        <div class="tab-content">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>AppKey认证配置</span>
                <el-switch v-model="appKeyEnabled" @change="savePolicy('AppKey认证配置已更新')" />
              </div>
            </template>
            <el-form label-position="top" class="policy-form">
              <el-row :gutter="16">
                <el-col :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item label="AppKey过期时间">
                    <el-select v-model="authConfig.expire">
                      <el-option label="永不过期" value="never" />
                      <el-option label="30天" value="30" />
                      <el-option label="90天" value="90" />
                      <el-option label="180天" value="180" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :lg="8" :md="8" :sm="24" :xs="24">
                  <el-form-item label="AppKey长度">
                    <el-select v-model="authConfig.length">
                      <el-option label="16位" value="16" />
                      <el-option label="24位" value="24" />
                      <el-option label="32位" value="32" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="签名算法">
                <el-radio-group v-model="authConfig.algorithm" class="radio-card-group">
                  <el-radio-button label="HMAC-SHA256" />
                  <el-radio-button label="HMAC-SHA1" />
                  <el-radio-button label="MD5" />
                </el-radio-group>
              </el-form-item>
            </el-form>
            <div class="card-footer">
              <el-button type="primary" @click="savePolicy('认证配置已保存成功')">保存配置</el-button>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>Token管理</span>
                <small>共 128 个有效Token</small>
              </div>
            </template>
            <el-form label-position="top" class="policy-form">
              <el-row :gutter="16">
                <el-col :lg="8" :md="12" :sm="24" :xs="24">
                  <el-form-item label="Token有效期">
                    <div class="inline-control">
                      <el-input-number v-model="tokenConfig.duration" :min="1" controls-position="right" />
                      <el-select v-model="tokenConfig.unit" class="short-select">
                        <el-option label="分钟" value="minute" />
                        <el-option label="小时" value="hour" />
                        <el-option label="天" value="day" />
                      </el-select>
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :lg="8" :md="12" :sm="24" :xs="24">
                  <el-form-item label="Token刷新机制">
                    <div class="inline-control">
                      <el-switch v-model="tokenConfig.autoRefresh" />
                      <span class="unit-text">阈值</span>
                      <el-input-number v-model="tokenConfig.threshold" :min="1" :max="100" controls-position="right" />
                      <span class="unit-text">%</span>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <el-table :data="tokens" border size="small">
              <el-table-column prop="app" label="应用名称" min-width="160" show-overflow-tooltip />
              <el-table-column prop="token" label="Token值" min-width="130" />
              <el-table-column prop="expiresAt" label="过期时间" min-width="150" />
              <el-table-column prop="status" label="状态" width="110">
                <template #default="{ row }">
                  <el-tag :type="row.status === '有效' ? 'success' : 'warning'" effect="light">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="90" fixed="right" align="center">
                <template #default>
                  <el-button type="danger" link @click="confirmAction('确定撤销此Token吗？')">撤销</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="安全审计" name="audit">
        <div class="tab-content">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>审计规则</span>
                <small>持续检测异常访问行为</small>
              </div>
            </template>
            <div class="audit-rule-list">
              <div v-for="rule in auditRules" :key="rule.name" class="audit-rule-card">
                <div :class="['audit-rule-icon', rule.type]">
                  <el-icon>
                    <component :is="rule.icon" />
                  </el-icon>
                </div>
                <div class="audit-rule-meta">
                  <div class="audit-rule-name">{{ rule.name }}</div>
                  <div class="audit-rule-desc">{{ rule.desc }}</div>
                </div>
                <el-switch v-model="rule.enabled" />
              </div>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>近期安全事件（最近7天）</span>
                <el-button type="primary" link :icon="Refresh" @click="savePolicy('安全事件已刷新')">刷新</el-button>
              </div>
            </template>
            <el-table :data="securityEvents" border size="small">
              <el-table-column prop="time" label="事件时间" min-width="150" />
              <el-table-column prop="type" label="事件类型" min-width="130">
                <template #default="{ row }">
                  <el-tag :type="eventType(row.type)" effect="light">{{ row.type }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="ip" label="来源IP" min-width="120" />
              <el-table-column prop="app" label="涉及应用" min-width="150" show-overflow-tooltip />
              <el-table-column prop="desc" label="事件描述" min-width="260" show-overflow-tooltip />
              <el-table-column label="操作" width="90" fixed="right" align="center">
                <template #default>
                  <el-button type="primary" link :icon="View" @click="savePolicy('已查看事件详情')">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>

      <el-tab-pane label="数据加密" name="encryption">
        <div class="tab-content">
          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>传输加密（TLS/SSL）</span>
                <el-switch v-model="tlsEnabled" @change="savePolicy('强制HTTPS传输配置已更新')" />
              </div>
            </template>
            <el-form label-position="top" class="policy-form">
              <el-row :gutter="16">
                <el-col :lg="8" :md="12" :sm="24" :xs="24">
                  <el-form-item label="最低TLS版本">
                    <el-select v-model="tlsVersion">
                      <el-option label="TLS 1.2" value="TLS 1.2" />
                      <el-option label="TLS 1.3" value="TLS 1.3" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <el-descriptions title="当前证书信息" :column="3" border size="small">
              <template #extra>
                <el-tag type="success" effect="light">有效</el-tag>
              </template>
              <el-descriptions-item label="颁发机构">DigiCert Global CA G2</el-descriptions-item>
              <el-descriptions-item label="有效期至">2025-12-31</el-descriptions-item>
              <el-descriptions-item label="域名">*.jiading.gov.cn</el-descriptions-item>
            </el-descriptions>
            <div class="card-footer">
              <el-button type="primary" :icon="Refresh" @click="savePolicy('证书更新请求已提交')">更新证书</el-button>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>数据存储加密</span>
                <el-switch v-model="storageEncryptEnabled" @change="savePolicy('存储加密配置已更新')" />
              </div>
            </template>
            <el-form label-position="top" class="policy-form">
              <el-row :gutter="16">
                <el-col :lg="10" :md="12" :sm="24" :xs="24">
                  <el-form-item label="加密算法">
                    <el-radio-group v-model="storageConfig.algorithm">
                      <el-radio-button label="AES-256" />
                      <el-radio-button label="SM4国密算法" />
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :lg="8" :md="12" :sm="24" :xs="24">
                  <el-form-item label="密钥轮换周期">
                    <el-select v-model="storageConfig.rotateCycle">
                      <el-option label="30天" value="30" />
                      <el-option label="90天" value="90" />
                      <el-option label="180天" value="180" />
                      <el-option label="自定义" value="custom" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div class="storage-footer">
              <span>上次轮换时间：<strong>2025-02-27 10:30:00</strong></span>
              <el-button type="primary" @click="confirmAction('确定立即轮换加密密钥吗？')">立即轮换密钥</el-button>
            </div>
          </el-card>

          <el-card shadow="never" class="section-card">
            <template #header>
              <div class="section-header">
                <span>数据脱敏规则</span>
                <el-button type="primary" size="small" :icon="Plus" @click="savePolicy('添加脱敏规则')">添加脱敏规则</el-button>
              </div>
            </template>
            <el-table :data="maskRules" border size="small">
              <el-table-column prop="field" label="字段名称" min-width="120" />
              <el-table-column prop="type" label="脱敏方式" width="110" />
              <el-table-column prop="policy" label="脱敏策略" min-width="220" show-overflow-tooltip />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === '启用' ? 'success' : 'warning'" effect="light">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right" align="center">
                <template #default>
                  <el-button type="primary" link :icon="Edit" @click="savePolicy('编辑脱敏规则')">编辑</el-button>
                  <el-button type="danger" link :icon="Delete" @click="confirmAction('确定删除此脱敏规则吗？')">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import {
  CircleCheck,
  CircleClose,
  Delete,
  Edit,
  Histogram,
  Key,
  Lock,
  Operation,
  Plus,
  Refresh,
  View,
  Warning,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

type PolicyTab = 'access' | 'auth' | 'audit' | 'encryption'

const activeTab = ref<PolicyTab>('access')
const ipWhiteListEnabled = ref(true)
const corsEnabled = ref(true)
const appKeyEnabled = ref(true)
const tlsEnabled = ref(true)
const storageEncryptEnabled = ref(true)
const tlsVersion = ref('TLS 1.3')
const allowedOrigins = ref('https://api.example.com\nhttps://data.jiading.gov.cn')

const overviewStats = [
  { label: '安全策略总数', value: '8', trend: '全部策略运行中', trendType: 'success', type: 'blue', icon: Lock },
  { label: '今日告警', value: '3', trend: '较昨日 +1', trendType: 'danger', type: 'red', icon: Warning },
  { label: '异常请求', value: '27', trend: '本月累计', trendType: 'warning', type: 'orange', icon: CircleClose },
  { label: '合规率', value: '99.8%', trend: '较上月 +0.2%', trendType: 'success', type: 'green', icon: CircleCheck },
]

const ipRules = [
  { ip: '10.88.0.0/16', type: '白名单', status: '启用', createdAt: '2024-01-15' },
  { ip: '192.168.1.0/24', type: '白名单', status: '启用', createdAt: '2024-02-20' },
  { ip: '172.16.0.0/12', type: '黑名单', status: '停用', createdAt: '2024-03-10' },
]

const rateLimit = reactive({
  singleIpQps: 100,
  appDaily: 100000,
  ipDaily: 50000,
})

const authConfig = reactive({
  expire: '90',
  length: '32',
  algorithm: 'HMAC-SHA256',
})

const tokenConfig = reactive({
  duration: 24,
  unit: 'hour',
  autoRefresh: true,
  threshold: 70,
})

const tokens = [
  { app: '智慧医疗分析系统', token: 'sk-8291****f3', expiresAt: '2025-06-15 14:30', status: '有效' },
  { app: '交通流量监测平台', token: 'sk-12FE****34', expiresAt: '2025-07-20 09:00', status: '有效' },
  { app: '社区网格化管理App', token: 'sk-CC09****99', expiresAt: '2024-12-01 00:00', status: '即将过期' },
]

const auditRules = reactive([
  { name: '异常登录检测', desc: '检测同一账号在多地同时登录或短时间内频繁登录', enabled: true, type: 'blue', icon: Operation },
  { name: '高频API调用告警', desc: '检测单个应用或IP在短时间内API调用次数超过阈值', enabled: true, type: 'orange', icon: Histogram },
  { name: '敏感数据访问审计', desc: '记录对包含个人隐私、金融信息等敏感数据的API访问行为', enabled: true, type: 'red', icon: Lock },
  { name: '非工作时间访问记录', desc: '记录在非工作时段（18:00-08:00及节假日）的数据访问行为', enabled: false, type: 'purple', icon: Key },
])

const securityEvents = [
  { time: '2024-05-27 14:23:10', type: '异常登录尝试', ip: '10.12.34.56', app: '智慧医疗分析系统', desc: '同一账号在10分钟内从3个不同IP登录' },
  { time: '2024-05-27 11:05:33', type: '高频调用告警', ip: '192.168.1.88', app: '交通流量监测平台', desc: '1分钟内调用流量查询API 350次，超过阈值200' },
  { time: '2024-05-26 22:15:45', type: '越权访问尝试', ip: '172.20.0.15', app: '公共信用信息查询站', desc: '尝试访问未授权的敏感数据API被拦截' },
  { time: '2024-05-26 09:30:18', type: '高频调用告警', ip: '10.88.1.200', app: '社区网格化管理App', desc: '网格事件上报接口调用量突增300%' },
  { time: '2024-05-25 16:50:22', type: '敏感数据访问', ip: '10.88.0.101', app: '智慧医疗分析系统', desc: '批量查询患者身份证信息共1200条' },
  { time: '2024-05-24 03:12:05', type: '异常登录尝试', ip: '45.33.22.11', app: '政务服务网关', desc: '凌晨多次尝试使用错误凭证登录' },
]

const storageConfig = reactive({
  algorithm: 'AES-256',
  rotateCycle: '90',
})

const maskRules = [
  { field: 'phone', type: '手机号', policy: '保留前3后4（138****5678）', status: '启用' },
  { field: 'id_card', type: '身份证', policy: '保留前6后4（310101****5678）', status: '启用' },
  { field: 'bank_card', type: '银行卡', policy: '保留前4后4（6222****1234）', status: '启用' },
  { field: 'name', type: '姓名', policy: '保留姓氏（张*）', status: '启用' },
  { field: 'address', type: '地址', policy: '保留省市+星级（上海市***）', status: '草稿' },
]

const savePolicy = (message: string) => {
  ElMessage.success(message)
}

const confirmAction = (message: string) => {
  ElMessageBox.confirm(message, '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    ElMessage.success('操作已提交')
  }).catch(() => undefined)
}

const eventType = (type: string) => {
  if (type.includes('异常') || type.includes('越权')) return 'danger'
  if (type.includes('高频')) return 'warning'
  return 'primary'
}
</script>

<style lang="scss" scoped>
.safe-policy-page {
  height: 100%;
  box-sizing: border-box;
  background: #f0f2f5;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  height: 100%;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 96px;
  padding: 18px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #ffffff;
}

.overview-icon,
.audit-rule-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  font-size: 24px;

  &.blue {
    background: #e6f0ff;
    color: #1a6eff;
  }

  &.red {
    background: #fff1f0;
    color: #ff4d4f;
  }

  &.orange {
    background: #fff7e6;
    color: #fa8c16;
  }

  &.green {
    background: #f6ffed;
    color: #52c41a;
  }

  &.purple {
    background: #f5f0ff;
    color: #722ed1;
  }
}

.overview-meta {
  min-width: 0;
}

.overview-label {
  color: #909399;
  font-size: 12px;
}

.overview-value {
  margin-top: 4px;
  color: #303133;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.overview-trend {
  margin-top: 4px;
  font-size: 11px;

  &.success {
    color: #52c41a;
  }

  &.danger {
    color: #ff4d4f;
  }

  &.warning {
    color: #fa8c16;
  }
}

.policy-tabs {
  padding: 0 16px 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #ffffff;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;

  ::v-deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
}

.section-card {
  border-radius: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 700;

  small {
    display: block;
    margin-top: 4px;
    color: #909399;
    font-size: 12px;
    font-weight: 400;
  }
}

.header-actions,
.inline-control,
.storage-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

.switch-label,
.unit-text {
  color: #909399;
  font-size: 12px;
}

.policy-form {
  ::v-deep(.el-input-number) {
    width: 100%;
  }

  ::v-deep(.el-select) {
    width: 100%;
  }
}

.short-select {
  width: 92px !important;
}

.radio-card-group {
  display: flex;
  flex-wrap: wrap;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.audit-rule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.audit-rule-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.audit-rule-icon {
  width: 38px;
  height: 38px;
  font-size: 18px;
}

.audit-rule-meta {
  flex: 1;
  min-width: 0;
}

.audit-rule-name {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.audit-rule-desc {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.storage-footer {
  justify-content: space-between;
  margin-top: 16px;
  color: #909399;
  font-size: 12px;

  strong {
    color: #606266;
    font-weight: 600;
  }
}

@media (max-width: 992px) {
  .overview-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .safe-policy-page {
    padding: 10px;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .policy-tabs {
    padding: 0 10px 10px;
  }

  .section-header,
  .header-actions,
  .inline-control,
  .storage-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .short-select {
    width: 100% !important;
  }
}
</style>
