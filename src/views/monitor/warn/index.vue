<template>
  <div class="warn-page">
    <el-row :gutter="16" class="metric-grid">
      <el-col v-for="item in overviewCards" :key="item.label" :lg="6" :md="12" :sm="12" :xs="24">
        <el-card shadow="hover" :class="['overview-card', item.color]">
          <div class="overview-main">
            <div>
              <div class="overview-label">{{ item.label }}</div>
              <div class="overview-value">{{ item.value }}</div>
            </div>
            <div :class="['overview-icon', item.color]">
              <el-icon>
                <component :is="item.icon" />
              </el-icon>
            </div>
          </div>
          <div :class="['overview-extra', item.extraType]">{{ item.extra }}</div>
        </el-card>
      </el-col>
    </el-row>

    <section class="section-block">
      <div class="section-header">
        <div class="section-title">
          <span class="title-mark"></span>
          <span>预警规则配置</span>
        </div>
        <el-button type="primary" link :icon="Setting" @click="manageRules">规则管理</el-button>
      </div>

      <el-row :gutter="16">
        <el-col v-for="rule in warningRules" :key="rule.id" :lg="6" :md="12" :sm="12" :xs="24">
          <el-card shadow="hover" class="rule-card">
            <div class="rule-top">
              <div :class="['rule-icon', rule.color]">
                <el-icon>
                  <component :is="rule.icon" />
                </el-icon>
              </div>
              <el-switch
                v-model="rule.enabled"
                inline-prompt
                active-text="启"
                inactive-text="停"
                @change="toggleRule(rule)"
              />
            </div>
            <div class="rule-name">{{ rule.name }}</div>
            <div class="rule-desc">{{ rule.description }}</div>
          </el-card>
        </el-col>
      </el-row>
    </section>

    <el-card shadow="never" class="event-card">
      <template #header>
        <div class="event-header">
          <div class="section-title">
            <span class="title-mark"></span>
            <span>近期预警事件（最近 7 天）</span>
          </div>
          <div class="event-actions">
            <el-input
              v-model.trim="filters.keyword"
              class="search-input"
              clearable
              placeholder="搜索事件/对象"
              :prefix-icon="Search"
              @keyup.enter="applyFilters"
            />
            <el-select v-model="filters.level" clearable placeholder="严重级别" class="filter-select">
              <el-option label="严重" value="严重" />
              <el-option label="警告" value="警告" />
              <el-option label="提示" value="提示" />
            </el-select>
            <el-select v-model="filters.status" clearable placeholder="状态" class="filter-select">
              <el-option label="待处理" value="待处理" />
              <el-option label="处理中" value="处理中" />
              <el-option label="已闭环" value="已闭环" />
            </el-select>
            <el-button :icon="Refresh" @click="resetFilters">重置</el-button>
            <el-button type="primary" :icon="Search" @click="applyFilters">筛选</el-button>
            <el-button :icon="Download" @click="exportEvents">导出</el-button>
          </div>
        </div>
      </template>

      <el-table :data="pagedEvents" border stripe>
        <el-table-column prop="name" label="事件名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="level" label="严重级别" width="110">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)" effect="light">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="target" label="告警对象" min-width="180" show-overflow-tooltip />
        <el-table-column prop="triggerTime" label="触发时间" min-width="160" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="dark">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.status === '待处理'" type="primary" link @click="claimEvent(row)">
              认领
            </el-button>
            <el-button v-else type="primary" link :icon="View" @click="openDetail(row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <span>显示 {{ rangeText }}，共 {{ filteredEvents.length }} 条记录</span>
        <el-pagination
          v-model:current-page="page.currentPage"
          v-model:page-size="page.pageSize"
          background
          layout="prev, pager, next"
          :total="filteredEvents.length"
        />
      </div>
    </el-card>

    <el-dialog v-model="detailVisible" title="预警事件详情" width="680px">
      <el-descriptions v-if="currentEvent" :column="2" border size="small">
        <el-descriptions-item label="事件名称">{{ currentEvent.name }}</el-descriptions-item>
        <el-descriptions-item label="严重级别">{{ currentEvent.level }}</el-descriptions-item>
        <el-descriptions-item label="告警对象">{{ currentEvent.target }}</el-descriptions-item>
        <el-descriptions-item label="触发时间">{{ currentEvent.triggerTime }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ currentEvent.status }}</el-descriptions-item>
        <el-descriptions-item label="处置人">{{ currentEvent.owner || '未认领' }}</el-descriptions-item>
        <el-descriptions-item label="处置建议" :span="2">{{ currentEvent.suggestion }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
          v-if="currentEvent && currentEvent.status !== '已闭环'"
          type="success"
          @click="closeEvent(currentEvent)"
        >
          标记闭环
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import {
  AlarmClock,
  Bell,
  CircleCheck,
  Download,
  Refresh,
  Search,
  Select,
  Setting,
  TrendCharts,
  View,
  Warning,
  WarningFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

type WarningLevel = '严重' | '警告' | '提示'
type EventStatus = '待处理' | '处理中' | '已闭环'

interface OverviewCard {
  label: string
  value: number
  extra: string
  extraType: 'danger' | 'warning' | 'primary' | 'success'
  color: 'blue' | 'orange' | 'cyan' | 'green'
  icon: object
}

interface WarningRule {
  id: number
  name: string
  description: string
  enabled: boolean
  color: 'orange' | 'red' | 'green' | 'purple'
  icon: object
}

interface WarningEvent {
  id: number
  name: string
  level: WarningLevel
  target: string
  triggerTime: string
  status: EventStatus
  owner?: string
  suggestion: string
}

interface Filters {
  keyword: string
  level: '' | WarningLevel
  status: '' | EventStatus
}

const overviewCards: OverviewCard[] = [
  { label: '总预警数', value: 128, extra: '+12% 较昨日', extraType: 'danger', color: 'blue', icon: Bell },
  { label: '待处理', value: 23, extra: '需要立即关注', extraType: 'warning', color: 'orange', icon: WarningFilled },
  { label: '处理中', value: 15, extra: '5 个任务即将超时', extraType: 'primary', color: 'cyan', icon: Refresh },
  { label: '已闭环', value: 90, extra: '本周闭环率 85%', extraType: 'success', color: 'green', icon: CircleCheck },
]

const warningRules = reactive<WarningRule[]>([
  {
    id: 1,
    name: '高并发扩容处置',
    description: '监测接口 QPS 与并发数，达到负载阈值时自动或手动触发资源扩容。',
    enabled: true,
    color: 'orange',
    icon: TrendCharts,
  },
  {
    id: 2,
    name: '故障实时预警提醒',
    description: '接口调用失败率飙升、响应超时、服务熔断等故障实时推送。',
    enabled: true,
    color: 'red',
    icon: AlarmClock,
  },
  {
    id: 3,
    name: '故障闭环处置',
    description: '记录预警事件、处置状态与复盘记录，形成监测、预警、处置、复盘闭环。',
    enabled: true,
    color: 'green',
    icon: Select,
  },
  {
    id: 4,
    name: '接口熔断保护',
    description: '检测接口响应延迟与错误率，触发熔断后自动降级并限流。',
    enabled: false,
    color: 'purple',
    icon: Warning,
  },
])

const allEvents = ref<WarningEvent[]>([
  { id: 1, name: 'QPS峰值告警', level: '严重', target: '/api/order/submit', triggerTime: '2025-01-15 14:23:18', status: '待处理', suggestion: '建议扩容网关实例并检查订单服务下游耗时。' },
  { id: 2, name: '服务响应超时', level: '严重', target: 'payment-service', triggerTime: '2025-01-15 13:45:02', status: '处理中', owner: '张工', suggestion: '排查支付服务线程池与第三方支付网关连接状态。' },
  { id: 3, name: '数据库连接池耗尽', level: '警告', target: 'mysql-master-01', triggerTime: '2025-01-15 11:20:35', status: '处理中', owner: '李工', suggestion: '检查慢 SQL 与连接池最大连接数配置。' },
  { id: 4, name: '接口熔断触发', level: '警告', target: '/api/inventory/check', triggerTime: '2025-01-14 22:15:44', status: '已闭环', owner: '王工', suggestion: '已完成降级恢复，建议复盘库存服务响应延迟。' },
  { id: 5, name: '高并发扩容完成', level: '提示', target: 'gateway-cluster', triggerTime: '2025-01-14 18:30:12', status: '已闭环', owner: '系统自动化', suggestion: '扩容完成后继续观察 30 分钟流量曲线。' },
  { id: 6, name: '第三方服务断连', level: '严重', target: 'external-payment-gateway', triggerTime: '2025-01-14 16:08:55', status: '待处理', suggestion: '建议切换备用通道，并联系第三方确认可用性。' },
  { id: 7, name: 'API调用错误率飙升', level: '警告', target: '/api/user/login', triggerTime: '2025-01-13 09:12:30', status: '已闭环', owner: '赵工', suggestion: '登录接口错误率已恢复，需确认认证服务日志。' },
  { id: 8, name: '节点CPU过载告警', level: '警告', target: 'node-03-server', triggerTime: '2025-01-13 07:45:10', status: '已闭环', owner: '系统自动化', suggestion: 'CPU 已回落，建议检查定时任务峰值。' },
])

const filters = reactive<Filters>({
  keyword: '',
  level: '',
  status: '',
})

const activeFilters = reactive<Filters>({
  keyword: '',
  level: '',
  status: '',
})

const page = reactive({
  currentPage: 1,
  pageSize: 8,
})

const detailVisible = ref(false)
const currentEvent = ref<WarningEvent>()

const filteredEvents = computed(() => {
  const keyword = activeFilters.keyword.toLowerCase()
  return allEvents.value.filter((event) => {
    if (keyword && !`${event.name} ${event.target}`.toLowerCase().includes(keyword)) return false
    if (activeFilters.level && event.level !== activeFilters.level) return false
    if (activeFilters.status && event.status !== activeFilters.status) return false
    return true
  })
})

const pagedEvents = computed(() => {
  const start = (page.currentPage - 1) * page.pageSize
  return filteredEvents.value.slice(start, start + page.pageSize)
})

const rangeText = computed(() => {
  if (!filteredEvents.value.length) return '0 到 0 条'
  const start = (page.currentPage - 1) * page.pageSize + 1
  const end = Math.min(start + page.pageSize - 1, filteredEvents.value.length)
  return `${start} 到 ${end} 条`
})

watch(filteredEvents, () => {
  const totalPages = Math.max(1, Math.ceil(filteredEvents.value.length / page.pageSize))
  if (page.currentPage > totalPages) page.currentPage = totalPages
})

const applyFilters = () => {
  Object.assign(activeFilters, filters)
  page.currentPage = 1
}

const resetFilters = () => {
  Object.assign(filters, { keyword: '', level: '', status: '' })
  Object.assign(activeFilters, { keyword: '', level: '', status: '' })
  page.currentPage = 1
}

const manageRules = () => {
  ElMessage.info('规则管理入口已打开')
}

const toggleRule = (rule: WarningRule) => {
  ElMessage.success(`${rule.name} 已${rule.enabled ? '启用' : '停用'}`)
}

const claimEvent = (event: WarningEvent) => {
  event.status = '处理中'
  event.owner = '当前用户'
  ElMessage.success('事件已成功认领')
}

const openDetail = (event: WarningEvent) => {
  currentEvent.value = event
  detailVisible.value = true
}

const closeEvent = (event: WarningEvent) => {
  event.status = '已闭环'
  detailVisible.value = false
  ElMessage.success('事件已标记为闭环')
}

const exportEvents = () => {
  ElMessage.success('预警事件导出任务已提交')
}

const levelTagType = (level: WarningLevel) => {
  if (level === '严重') return 'danger'
  if (level === '警告') return 'warning'
  return ''
}

const statusTagType = (status: EventStatus) => {
  if (status === '待处理') return 'danger'
  if (status === '处理中') return ''
  return 'success'
}
</script>

<style lang="scss" scoped>
.warn-page {
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow-x: hidden;
  // background: #f8fafc;
}

.metric-grid {
  margin-bottom: 18px;
}

.overview-card {
  margin-bottom: 16px;
  border-top: 4px solid #409eff;
  border-radius: 8px;

  &.blue {
    border-top-color: #3b82f6;
  }

  &.orange {
    border-top-color: #f97316;
  }

  &.cyan {
    border-top-color: #38bdf8;
  }

  &.green {
    border-top-color: #22c55e;
  }
}

.overview-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.overview-label {
  margin-bottom: 6px;
  color: #64748b;
  font-size: 13px;
}

.overview-value {
  color: #0f172a;
  font-size: 30px;
  font-weight: 700;
  line-height: 1.1;
}

.overview-icon,
.rule-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 22px;
}

.overview-icon {
  &.blue {
    background: #eff6ff;
    color: #2563eb;
  }

  &.orange {
    background: #fff7ed;
    color: #ea580c;
  }

  &.cyan {
    background: #eff6ff;
    color: #3b82f6;
  }

  &.green {
    background: #f0fdf4;
    color: #16a34a;
  }
}

.overview-extra {
  margin-top: 16px;
  font-size: 12px;

  &.danger {
    color: #ef4444;
  }

  &.warning {
    color: #f97316;
  }

  &.primary {
    color: #64748b;
  }

  &.success {
    color: #16a34a;
  }
}

.section-block {
  margin-bottom: 18px;
}

.section-header,
.event-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.section-header {
  margin-bottom: 14px;
}

.section-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.title-mark {
  width: 6px;
  height: 20px;
  border-radius: 999px;
  background: #2563eb;
}

.rule-card {
  height: calc(100% - 16px);
  margin-bottom: 16px;
  border-radius: 8px;
}

.rule-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.rule-icon {
  &.orange {
    background: #fff7ed;
    color: #f97316;
  }

  &.red {
    background: #fef2f2;
    color: #ef4444;
  }

  &.green {
    background: #f0fdf4;
    color: #22c55e;
  }

  &.purple {
    background: #faf5ff;
    color: #a855f7;
  }
}

.rule-name {
  margin-bottom: 8px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
}

.rule-desc {
  color: #64748b;
  font-size: 12px;
  line-height: 1.7;
}

.event-card {
  border-radius: 8px;
}

.event-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
}

.search-input {
  width: 260px;
}

.filter-select {
  width: 120px;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 14px;
  color: #64748b;
  font-size: 12px;
}

@media (max-width: 900px) {
  .section-header,
  .event-header,
  .pagination-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .event-actions {
    justify-content: flex-start;
  }

  .search-input,
  .filter-select {
    width: 100%;
  }
}
</style>
