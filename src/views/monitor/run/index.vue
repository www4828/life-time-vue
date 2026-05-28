<template>
  <div class="run-monitor-page">
    <el-card shadow="never" class="page-card">
      <el-tabs v-model="activeTab" class="run-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="监控看板" name="dashboard">
          <div class="dashboard-panel">
            <div class="dashboard-toolbar">
              <div>
                <div class="dashboard-title">系统实时运行监控看板</div>
                <div class="dashboard-subtitle">QPS、并发、错误率、延迟与实时告警统一监控</div>
              </div>
              <div class="dashboard-controls">
                <el-radio-group v-model="dashboardRange" size="small">
                  <el-radio-button v-for="item in dashboardRanges" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </el-radio-button>
                </el-radio-group>
                <el-select v-model="dashboardSystem" size="small" class="dashboard-system-select">
                  <el-option v-for="item in dashboardSystems" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
                <el-tag type="success" effect="light" round>
                  实时同步中
                  <span class="sync-interval">刷新间隔: 5s</span>
                </el-tag>
              </div>
            </div>

            <el-row :gutter="16">
              <el-col :lg="12" :md="24" :sm="24" :xs="24">
                <el-card shadow="never" class="dashboard-card chart-card">
                  <template #header>
                    <div class="dashboard-card-header">
                      <span>QPS 实时趋势分析</span>
                      <el-tag type="primary" effect="plain">当前 {{ currentQps }} QPS</el-tag>
                    </div>
                  </template>
                  <div ref="qpsTrendRef" class="echarts-box"></div>
                </el-card>
              </el-col>
              <el-col :lg="6" :md="12" :sm="24" :xs="24">
                <el-card shadow="never" class="dashboard-card chart-card">
                  <template #header>
                    <div class="dashboard-card-header">
                      <span>并发连接负载</span>
                      <el-tag effect="plain">1,963 总并发</el-tag>
                    </div>
                  </template>
                  <div ref="concurrencyRef" class="echarts-box"></div>
                </el-card>
              </el-col>
              <el-col :lg="6" :md="12" :sm="24" :xs="24">
                <el-card shadow="never" class="dashboard-card chart-card">
                  <template #header>
                    <div class="dashboard-card-header">
                      <span>接口健康度 (错误率)</span>
                      <el-tag type="success" effect="plain">健康</el-tag>
                    </div>
                  </template>
                  <div ref="healthGaugeRef" class="echarts-box"></div>
                </el-card>
              </el-col>
              <el-col :lg="12" :md="24" :sm="24" :xs="24">
                <el-card shadow="never" class="dashboard-card chart-card">
                  <template #header>
                    <div class="dashboard-card-header">
                      <span>响应时间(Latency) 分布统计</span>
                      <span class="muted">单位: 请求数</span>
                    </div>
                  </template>
                  <div ref="latencyRef" class="echarts-box"></div>
                </el-card>
              </el-col>
              <el-col :lg="6" :md="12" :sm="24" :xs="24">
                <el-card shadow="never" class="dashboard-card chart-card">
                  <template #header>
                    <div class="dashboard-card-header">
                      <span>热门接口调用排行</span>
                      <span class="muted">Top 5</span>
                    </div>
                  </template>
                  <div ref="topApiRef" class="echarts-box"></div>
                </el-card>
              </el-col>
              <el-col :lg="6" :md="12" :sm="24" :xs="24">
                <el-card shadow="never" class="dashboard-card chart-card">
                  <template #header>
                    <div class="dashboard-card-header">
                      <span>P99/P95 延迟趋势</span>
                      <span class="muted">单位: ms</span>
                    </div>
                  </template>
                  <div ref="p99TrendRef" class="echarts-box"></div>
                </el-card>
              </el-col>
            </el-row>

            <el-card shadow="never" class="dashboard-card alert-flow-card">
              <template #header>
                <div class="alert-flow-header">
                  <div class="alert-title">
                    <span class="alert-icon"></span>
                    <span>实时告警明细流水</span>
                  </div>
                  <div class="alert-summary">
                    <span><i class="level-dot danger"></i>严重(2)</span>
                    <span><i class="level-dot major"></i>重大(4)</span>
                    <span><i class="level-dot minor"></i>次要(8)</span>
                  </div>
                </div>
              </template>
              <el-table :data="realtimeAlerts" border size="small">
                <el-table-column prop="level" label="级别" width="92">
                  <template #default="{ row }">
                    <el-tag :type="dashboardAlertType(row.level)" effect="light">{{ row.level }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="time" label="告警时间" width="170" show-overflow-tooltip />
                <el-table-column prop="source" label="来源" min-width="150" show-overflow-tooltip />
                <el-table-column prop="message" label="告警内容" min-width="320" show-overflow-tooltip />
                <el-table-column prop="status" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="dashboardAlertStatusType(row.status)" effect="plain">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="90" fixed="right" align="center">
                  <template #default>
                    <el-button type="primary" link :icon="View">查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-tab-pane>
        <el-tab-pane label="服务监控" name="service">
          <div class="tab-body">
            <el-card shadow="never" class="section-card">
              <template #header>
                <div class="section-header">
                  <span>服务状态</span>
                  <el-tag type="success" effect="plain">5 正常 / 1 异常</el-tag>
                </div>
              </template>

              <el-row :gutter="16">
                <el-col v-for="service in serviceList" :key="service.name" :lg="12" :md="12" :sm="24" :xs="24">
                  <div :class="['service-card', { 'is-error': service.status === '异常' }]">
                    <div class="service-info">
                      <div :class="['service-icon', service.iconClass]">
                        <el-icon>
                          <component :is="service.icon" />
                        </el-icon>
                      </div>
                      <div class="service-meta">
                        <div class="service-name">{{ service.name }}</div>
                        <div class="service-desc">
                          <el-tag :type="service.status === '异常' ? 'danger' : 'success'" size="small" effect="light">
                            {{ service.status }}
                          </el-tag>
                          <span>{{ service.description }}</span>
                        </div>
                      </div>
                    </div>
                    <el-button
                      :type="service.status === '异常' ? 'primary' : 'default'"
                      size="small"
                      :icon="Refresh"
                      @click="restartService(service)"
                    >
                      重启
                    </el-button>
                  </div>
                </el-col>
              </el-row>
            </el-card>

            <el-card shadow="never" class="section-card">
              <template #header>
                <div class="section-header">
                  <span>近 24 小时 API 调用趋势</span>
                  <span class="muted">单位：次/小时</span>
                </div>
              </template>
              <div class="chart-wrap">
                <canvas ref="trendCanvasRef" class="chart-canvas"></canvas>
              </div>
            </el-card>

            <el-card shadow="never" class="section-card">
              <template #header>
                <div class="section-header">
                  <span>服务节点拓扑</span>
                  <span class="muted">实时链路状态</span>
                </div>
              </template>
              <div class="topology">
                <template v-for="(node, index) in topologyNodes" :key="node.name">
                  <div :class="['topo-node', node.type]">
                    <span>{{ node.name }}</span>
                    <small v-if="node.subTitle">{{ node.subTitle }}</small>
                  </div>
                  <el-icon v-if="index < topologyNodes.length - 1" class="topo-arrow">
                    <ArrowRight />
                  </el-icon>
                </template>
              </div>
              <div class="legend">
                <span><i class="legend-dot success"></i>运行中</span>
                <span><i class="legend-dot danger"></i>异常</span>
                <span><i class="legend-dot primary"></i>网关</span>
              </div>
            </el-card>
          </div>
        </el-tab-pane>

        <el-tab-pane label="资源监控" name="resource">
          <div class="tab-body">
            <section>
              <div class="section-title">服务器节点概览</div>
              <el-row :gutter="16">
                <el-col v-for="node in resourceNodes" :key="node.name" :lg="8" :md="12" :sm="24" :xs="24">
                  <el-card shadow="hover" class="node-card">
                    <div class="node-head">
                      <div>
                        <div class="node-name">{{ node.name }}</div>
                        <div class="node-ip">{{ node.ip }}</div>
                      </div>
                      <el-tag :type="node.status === '正常' ? 'success' : 'warning'" effect="light">
                        {{ node.status }}
                      </el-tag>
                    </div>

                    <div class="metric-list">
                      <div v-for="metric in node.metrics" :key="metric.name" class="metric-row">
                        <div class="metric-label">
                          <span>{{ metric.name }}</span>
                          <span>{{ metric.value }}%</span>
                        </div>
                        <el-progress
                          :percentage="metric.value"
                          :stroke-width="8"
                          :show-text="false"
                          :color="progressColor(metric.value)"
                        />
                      </div>
                    </div>

                    <div class="network-row">
                      <span>网络流入/流出</span>
                      <strong>{{ node.network }}</strong>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </section>

            <el-card shadow="never" class="section-card">
              <template #header>
                <div class="section-header">
                  <span>实时网络流量（最近 1 小时）</span>
                  <div class="chart-legend">
                    <span><i class="legend-dot primary"></i>流入流量</span>
                    <span><i class="legend-dot success"></i>流出流量</span>
                  </div>
                </div>
              </template>
              <div class="chart-wrap">
                <canvas ref="networkCanvasRef" class="chart-canvas"></canvas>
              </div>
            </el-card>

            <el-card shadow="never" class="section-card">
              <template #header>
                <div class="section-header">
                  <span>资源告警记录</span>
                  <el-button type="primary" link :icon="Refresh" @click="refreshAlerts">刷新</el-button>
                </div>
              </template>
              <el-table :data="alertList" size="small" border>
                <el-table-column prop="time" label="告警时间" min-width="150" show-overflow-tooltip />
                <el-table-column prop="node" label="节点名称" min-width="130" show-overflow-tooltip />
                <el-table-column prop="resource" label="资源类型" width="100" />
                <el-table-column prop="threshold" label="告警阈值" width="120" />
                <el-table-column prop="current" label="当前值" width="110">
                  <template #default="{ row }">
                    <span :class="row.level === '严重' ? 'value-danger' : 'value-warning'">{{ row.current }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="level" label="级别" width="90">
                  <template #default="{ row }">
                    <el-tag :type="row.level === '严重' ? 'danger' : 'warning'" effect="light">
                      {{ row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="110">
                  <template #default="{ row }">
                    <el-tag :type="alertStatusType(row.status)" effect="plain" @click="cycleAlertStatus(row)">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="90" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link :icon="View" @click="showAlert(row)">查看</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="alertDialogVisible" title="告警详情" width="620px">
      <el-descriptions v-if="currentAlert" :column="2" border size="small">
        <el-descriptions-item label="告警时间">{{ currentAlert.time }}</el-descriptions-item>
        <el-descriptions-item label="节点名称">{{ currentAlert.node }}</el-descriptions-item>
        <el-descriptions-item label="资源类型">{{ currentAlert.resource }}</el-descriptions-item>
        <el-descriptions-item label="告警级别">{{ currentAlert.level }}</el-descriptions-item>
        <el-descriptions-item label="告警阈值">{{ currentAlert.threshold }}</el-descriptions-item>
        <el-descriptions-item label="当前值">{{ currentAlert.current }}</el-descriptions-item>
        <el-descriptions-item label="处理状态">{{ currentAlert.status }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="alertDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import {
  ArrowRight,
  Coin,
  Connection,
  Document,
  Message,
  Refresh,
  Service,
  Switch,
  View,
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

type TabName = 'dashboard' | 'service' | 'resource'
type ServiceStatus = '运行中' | '异常'
type AlertStatus = '未处理' | '处理中' | '已恢复'
type DashboardAlertLevel = '严重' | '重大' | '次要' | '警告'
type DashboardAlertStatus = '待处理' | '已确认' | '已恢复' | '未处理'

interface ServiceItem {
  name: string
  status: ServiceStatus
  description: string
  icon: object
  iconClass: string
}

interface ResourceMetric {
  name: string
  value: number
}

interface ResourceNode {
  name: string
  ip: string
  status: '正常' | '警告'
  network: string
  metrics: ResourceMetric[]
}

interface AlertItem {
  time: string
  node: string
  resource: string
  threshold: string
  current: string
  level: '警告' | '严重'
  status: AlertStatus
}

interface DashboardAlertItem {
  level: DashboardAlertLevel
  time: string
  source: string
  message: string
  status: DashboardAlertStatus
}

const activeTab = ref<TabName>('dashboard')
const trendCanvasRef = ref<HTMLCanvasElement>()
const networkCanvasRef = ref<HTMLCanvasElement>()
const qpsTrendRef = ref<HTMLDivElement>()
const concurrencyRef = ref<HTMLDivElement>()
const healthGaugeRef = ref<HTMLDivElement>()
const latencyRef = ref<HTMLDivElement>()
const topApiRef = ref<HTMLDivElement>()
const p99TrendRef = ref<HTMLDivElement>()
const alertDialogVisible = ref(false)
const currentAlert = ref<AlertItem>()
const dashboardRange = ref('1h')
const dashboardSystem = ref('all')
const currentQps = ref(1245)
const dashboardCharts: echarts.ECharts[] = []
let qpsTrendChart: echarts.ECharts | undefined
let healthGaugeChart: echarts.ECharts | undefined
let dashboardTimer: ReturnType<typeof window.setInterval> | undefined

const dashboardRanges = [
  { label: '近1小时', value: '1h' },
  { label: '近24小时', value: '24h' },
  { label: '近7天', value: '7d' },
  { label: '近30天', value: '30d' },
]

const dashboardSystems = [
  { label: '所有应用系统', value: 'all' },
  { label: '政务服务中心', value: 'gov-service' },
  { label: '卫生健康委员会', value: 'health' },
  { label: '公安局户籍系统', value: 'police' },
]

const realtimeAlerts: DashboardAlertItem[] = [
  {
    level: '严重',
    time: '2024-05-28 10:42:15',
    source: 'API-Gateway-01',
    message: '接口 /v1/user/auth 响应时间超过 5000ms，触发熔断阈值',
    status: '待处理',
  },
  {
    level: '重大',
    time: '2024-05-28 10:40:22',
    source: 'DB-Cluster-Main',
    message: '数据库连接池使用率达到 88%，存在阻塞风险',
    status: '已确认',
  },
  {
    level: '次要',
    time: '2024-05-28 10:35:10',
    source: 'App-Server-Node2',
    message: 'CPU 使用率超过 75%，持续时间 > 5min',
    status: '已恢复',
  },
  {
    level: '警告',
    time: '2024-05-28 10:30:05',
    source: 'OSS-Storage',
    message: '存储桶访问频次异常增加，建议核查访问来源',
    status: '未处理',
  },
]

const serviceList: ServiceItem[] = [
  { name: 'API网关服务', status: '运行中', description: '正常运行 127 天', icon: Connection, iconClass: 'blue' },
  { name: '数据交换引擎', status: '运行中', description: '正常运行 127 天', icon: Switch, iconClass: 'green' },
  { name: '认证授权服务', status: '运行中', description: '正常运行 90 天', icon: Service, iconClass: 'purple' },
  { name: '数据治理服务', status: '运行中', description: '正常运行 127 天', icon: Coin, iconClass: 'teal' },
  { name: '日志采集服务', status: '运行中', description: '正常运行 60 天', icon: Document, iconClass: 'cyan' },
  { name: '消息推送服务', status: '异常', description: '已停止，最后响应 2024-01-15 08:23:12', icon: Message, iconClass: 'red' },
]

const topologyNodes = [
  { name: '用户请求', type: 'success' },
  { name: 'API网关', subTitle: '负载均衡', type: 'primary' },
  { name: '数据交换引擎', type: 'success' },
  { name: '认证授权服务', type: 'success' },
  { name: '后端数据源', type: 'success' },
]

const resourceNodes: ResourceNode[] = [
  {
    name: 'API网关节点',
    ip: '10.88.1.10',
    status: '正常',
    network: '1.2 Gbps / 0.8 Gbps',
    metrics: [
      { name: 'CPU使用率', value: 45 },
      { name: '内存使用率', value: 62 },
      { name: '磁盘使用率', value: 38 },
    ],
  },
  {
    name: '数据交换节点',
    ip: '10.88.1.11',
    status: '正常',
    network: '2.5 Gbps / 1.8 Gbps',
    metrics: [
      { name: 'CPU使用率', value: 78 },
      { name: '内存使用率', value: 55 },
      { name: '磁盘使用率', value: 72 },
    ],
  },
  {
    name: '日志服务节点',
    ip: '10.88.1.12',
    status: '警告',
    network: '0.3 Gbps / 0.2 Gbps',
    metrics: [
      { name: 'CPU使用率', value: 23 },
      { name: '内存使用率', value: 41 },
      { name: '磁盘使用率', value: 85 },
    ],
  },
]

const alertList = ref<AlertItem[]>([
  { time: '2024-05-28 00:08:12', node: '日志服务节点', resource: '磁盘', threshold: '>80%', current: '85%', level: '严重', status: '未处理' },
  { time: '2024-05-27 23:55:03', node: '数据交换节点', resource: 'CPU', threshold: '>75%', current: '78%', level: '警告', status: '处理中' },
  { time: '2024-05-27 21:40:18', node: 'API网关节点', resource: '内存', threshold: '>60%', current: '62%', level: '警告', status: '未处理' },
  { time: '2024-05-27 15:20:10', node: 'API网关节点', resource: '网络', threshold: '流入>1.0 Gbps', current: '1.2 Gbps', level: '严重', status: '已恢复' },
  { time: '2024-05-27 10:30:00', node: '数据交换节点', resource: '磁盘', threshold: '>70%', current: '72%', level: '严重', status: '未处理' },
])

const trendData = [320, 280, 250, 230, 210, 195, 188, 210, 350, 520, 680, 750, 820, 790, 710, 650, 580, 620, 780, 850, 720, 560, 450, 380]

const restartService = (service: ServiceItem) => {
  if (service.status === '异常') {
    ElMessageBox.confirm(`确定重启${service.name}吗？`, '重启确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      ElMessage.success(`重启指令已下发至 ${service.name}`)
    }).catch(() => undefined)
    return
  }
  ElMessage.success(`重启指令已下发至 ${service.name}`)
}

const commonDashboardGrid = {
  left: '3%',
  right: '4%',
  bottom: '8%',
  top: '10%',
  containLabel: true,
}

const createDashboardChart = (target: HTMLDivElement | undefined, option: echarts.EChartsOption) => {
  if (!target) return undefined
  const chart = echarts.init(target)
  chart.setOption(option)
  dashboardCharts.push(chart)
  return chart
}

const disposeDashboardCharts = () => {
  dashboardCharts.forEach((chart) => chart.dispose())
  dashboardCharts.length = 0
  qpsTrendChart = undefined
  healthGaugeChart = undefined
}

const resizeDashboardCharts = () => {
  dashboardCharts.forEach((chart) => chart.resize())
}

const initDashboardCharts = () => {
  disposeDashboardCharts()

  qpsTrendChart = createDashboardChart(qpsTrendRef.value, {
    grid: commonDashboardGrid,
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['10:00', '10:05', '10:10', '10:15', '10:20', '10:25', '10:30', '10:35', '10:40', '10:45'],
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#666666' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e8e8e8', type: 'dashed' } },
      axisLabel: { color: '#666666' },
    },
    series: [
      {
        name: 'QPS',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#1890ff' },
        lineStyle: { color: '#1890ff', width: 3 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(24, 144, 255, 0.24)' },
            { offset: 1, color: 'rgba(24, 144, 255, 0.02)' },
          ]),
        },
        data: [820, 932, 901, 1234, 1290, 1330, 1320, 1450, 1520, 1245],
      },
    ],
  })

  createDashboardChart(concurrencyRef.value, {
    tooltip: { trigger: 'item' },
    series: [
      {
        name: '连接状态',
        type: 'pie',
        radius: ['60%', '85%'],
        center: ['50%', '52%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        data: [
          { value: 1048, name: '活跃连接', itemStyle: { color: '#1890ff' } },
          { value: 735, name: '空闲连接', itemStyle: { color: '#40a9ff' } },
          { value: 180, name: '等待中', itemStyle: { color: '#69c0ff' } },
        ],
      },
    ],
    graphic: {
      type: 'text',
      left: 'center',
      top: 'middle',
      style: {
        text: '1,963\n总并发',
        textAlign: 'center',
        fill: '#303133',
        fontSize: 18,
        fontWeight: 700,
        lineHeight: 28,
      },
    },
  })

  healthGaugeChart = createDashboardChart(healthGaugeRef.value, {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 1,
        center: ['50%', '65%'],
        radius: '96%',
        splitNumber: 4,
        axisLine: {
          lineStyle: {
            width: 18,
            color: [
              [0.3, '#52c41a'],
              [0.7, '#faad14'],
              [1, '#ff4d4f'],
            ],
          },
        },
        pointer: { icon: 'roundRect', length: '58%', width: 6, offsetCenter: [0, '-8%'] },
        axisTick: { show: false },
        splitLine: { length: 10, lineStyle: { width: 2, color: '#ffffff' } },
        axisLabel: { color: '#606266', distance: -36, fontSize: 10 },
        detail: {
          fontSize: 24,
          offsetCenter: [0, '8%'],
          valueAnimation: true,
          formatter: '{value}%',
          color: '#303133',
        },
        title: { offsetCenter: [0, '35%'], color: '#909399', fontSize: 12 },
        data: [{ value: 0.02, name: '当前错误率' }],
      },
    ],
  })

  createDashboardChart(latencyRef.value, {
    grid: commonDashboardGrid,
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['<10ms', '10-50ms', '50-100ms', '100-500ms', '500-1s', '>1s'],
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#666666' },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#e8e8e8', type: 'dashed' } },
      axisLabel: { color: '#666666' },
    },
    series: [
      {
        name: '请求数',
        type: 'bar',
        barWidth: '40%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#40a9ff' },
            { offset: 1, color: '#1890ff' },
          ]),
          borderRadius: [6, 6, 0, 0],
        },
        data: [450, 820, 310, 120, 45, 12],
      },
    ],
  })

  createDashboardChart(topApiRef.value, {
    grid: { left: '3%', right: '12%', bottom: '4%', top: '5%', containLabel: true },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: { type: 'value', splitLine: { show: false }, axisLabel: { color: '#909399' } },
    yAxis: {
      type: 'category',
      data: ['用户认证', '社保查询', '电子证照', '信用核验', '交通违章'],
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#303133', fontSize: 11 },
    },
    series: [
      {
        type: 'bar',
        data: [1200, 980, 850, 720, 600],
        itemStyle: { color: '#1890ff', borderRadius: [0, 4, 4, 0] },
        label: { show: true, position: 'right', color: '#1890ff', fontSize: 10 },
      },
    ],
  })

  createDashboardChart(p99TrendRef.value, {
    grid: { left: '3%', right: '4%', bottom: '18%', top: '8%', containLabel: true },
    tooltip: { trigger: 'axis' },
    legend: { data: ['P99', 'P95'], bottom: 0, textStyle: { color: '#666666', fontSize: 10 } },
    xAxis: {
      type: 'category',
      data: ['10:00', '10:10', '10:20', '10:30', '10:40', '10:50'],
      axisLine: { lineStyle: { color: '#e8e8e8' } },
      axisLabel: { color: '#666666' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value}ms', color: '#666666' },
      splitLine: { lineStyle: { color: '#e8e8e8', type: 'dashed' } },
    },
    series: [
      { name: 'P99', type: 'line', smooth: true, data: [45, 52, 48, 65, 42, 38], itemStyle: { color: '#1890ff' } },
      { name: 'P95', type: 'line', smooth: true, data: [32, 35, 30, 42, 28, 25], itemStyle: { color: '#52c41a' } },
    ],
  })
}

const updateDashboardRealtime = () => {
  if (activeTab.value !== 'dashboard' || !qpsTrendChart || !healthGaugeChart) return
  currentQps.value = Math.floor(1100 + Math.random() * 500)
  const option = qpsTrendChart.getOption()
  const qpsSeries = option.series?.[0] as { data?: number[] } | undefined
  const qpsData = Array.isArray(qpsSeries?.data) ? [...qpsSeries.data] : []
  if (qpsData.length > 0) {
    qpsData.shift()
    qpsData.push(currentQps.value)
    qpsTrendChart.setOption({ series: [{ data: qpsData }] })
  }
  healthGaugeChart.setOption({
    series: [{ data: [{ value: Number((Math.random() * 0.05).toFixed(2)), name: '当前错误率' }] }],
  })
}

const handleTabChange = () => {
  nextTick(drawActiveCharts)
}

const drawActiveCharts = () => {
  if (activeTab.value === 'dashboard') {
    initDashboardCharts()
    return
  }

  if (activeTab.value === 'service') {
    drawLineChart({
      canvas: trendCanvasRef.value,
      series: [{ data: trendData, color: '#1a6eff' }],
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      area: true,
    })
  } else {
    drawLineChart({
      canvas: networkCanvasRef.value,
      series: [
        { data: createTrafficData(60, 0.3, 2.5), color: '#1a6eff' },
        { data: createTrafficData(60, 0.2, 1.8), color: '#52c41a' },
      ],
      labels: ['0min', '10min', '20min', '30min', '40min', '50min', '60min'],
    })
  }
}

const drawLineChart = (options: {
  canvas?: HTMLCanvasElement
  series: Array<{ data: number[]; color: string }>
  labels: string[]
  area?: boolean
}) => {
  const { canvas, series, labels, area } = options
  if (!canvas || !canvas.parentElement) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const rect = canvas.parentElement.getBoundingClientRect()
  const ratio = window.devicePixelRatio || 1
  const width = Math.max(320, rect.width)
  const height = 240
  canvas.width = width * ratio
  canvas.height = height * ratio
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)

  const padding = { top: 18, right: 24, bottom: 34, left: 54 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom
  const maxVal = Math.max(...series.flatMap((item) => item.data)) * 1.15

  ctx.clearRect(0, 0, width, height)
  ctx.strokeStyle = '#edf0f5'
  ctx.lineWidth = 1
  ctx.font = '12px sans-serif'

  for (let i = 0; i <= 4; i += 1) {
    const y = padding.top + (chartH / 4) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.fillStyle = '#909399'
    ctx.textAlign = 'right'
    ctx.fillText(String(Math.round(maxVal - (maxVal / 4) * i)), padding.left - 8, y + 4)
  }

  series.forEach((item, seriesIndex) => {
    const points = item.data.map((value, index) => ({
      x: padding.left + (chartW / (item.data.length - 1)) * index,
      y: padding.top + chartH - (value / maxVal) * chartH,
    }))

    if (area && seriesIndex === 0) {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH)
      gradient.addColorStop(0, 'rgba(26, 110, 255, 0.18)')
      gradient.addColorStop(1, 'rgba(26, 110, 255, 0)')
      ctx.beginPath()
      ctx.moveTo(points[0].x, padding.top + chartH)
      points.forEach((point) => ctx.lineTo(point.x, point.y))
      ctx.lineTo(points[points.length - 1].x, padding.top + chartH)
      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()
    }

    ctx.beginPath()
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y)
      else ctx.lineTo(point.x, point.y)
    })
    ctx.strokeStyle = item.color
    ctx.lineWidth = 2
    ctx.stroke()

    points.forEach((point, index) => {
      if (index % Math.ceil(points.length / 12) !== 0) return
      ctx.beginPath()
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = item.color
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.stroke()
    })
  })

  ctx.fillStyle = '#909399'
  ctx.textAlign = 'center'
  labels.forEach((label, index) => {
    const x = padding.left + (chartW / (labels.length - 1)) * index
    ctx.fillText(label, x, height - 12)
  })
}

const createTrafficData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin(index / 6) * 0.35 + Math.cos(index / 11) * 0.2
    return Number((min + (max - min) * (0.48 + wave) + (index % 7) * 0.02).toFixed(2))
  })
}

const progressColor = (value: number) => {
  if (value >= 80) return '#ff4d4f'
  if (value >= 60) return '#faad14'
  if (value >= 40) return '#1a6eff'
  return '#52c41a'
}

const alertStatusType = (status: AlertStatus) => {
  if (status === '已恢复') return 'success'
  if (status === '处理中') return 'warning'
  return 'danger'
}

const cycleAlertStatus = (row: AlertItem) => {
  const nextMap: Record<AlertStatus, AlertStatus> = {
    未处理: '处理中',
    处理中: '已恢复',
    已恢复: '未处理',
  }
  row.status = nextMap[row.status]
}

const showAlert = (row: AlertItem) => {
  currentAlert.value = row
  alertDialogVisible.value = true
}

const refreshAlerts = () => {
  ElMessage.success('资源告警记录已刷新')
}

const dashboardAlertType = (level: DashboardAlertLevel) => {
  if (level === '严重') return 'danger'
  if (level === '重大') return 'warning'
  if (level === '次要') return 'info'
  return 'primary'
}

const dashboardAlertStatusType = (status: DashboardAlertStatus) => {
  if (status === '已恢复') return 'success'
  if (status === '已确认') return 'warning'
  if (status === '待处理') return 'danger'
  return 'info'
}

const handleResize = () => {
  if (activeTab.value === 'dashboard') {
    resizeDashboardCharts()
    return
  }

  drawActiveCharts()
}

onMounted(() => {
  nextTick(drawActiveCharts)
  dashboardTimer = window.setInterval(updateDashboardRealtime, 5000)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  if (dashboardTimer) window.clearInterval(dashboardTimer)
  disposeDashboardCharts()
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.run-monitor-page {
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  overflow: auto;
  background: #f0f2f5;
}

.page-card {
  min-height: 100%;
  border-radius: 8px;
}

.run-tabs {
  ::v-deep(.el-tabs__header) {
    margin-bottom: 0;
  }

  ::v-deep(.el-tabs__content) {
    padding-top: 16px;
  }
}

.dashboard-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dashboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #ffffff;
}

.dashboard-title {
  color: #303133;
  font-size: 18px;
  font-weight: 700;
}

.dashboard-subtitle {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.dashboard-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.dashboard-system-select {
  width: 172px;
}

.sync-interval {
  margin-left: 8px;
  color: #67c23a;
  font-size: 12px;
}

.dashboard-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.chart-card {
  height: 320px;

  ::v-deep(.el-card__body) {
    padding: 8px 12px 12px;
  }
}

.dashboard-card-header,
.alert-flow-header,
.alert-title,
.alert-summary {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dashboard-card-header,
.alert-flow-header {
  justify-content: space-between;
  color: #303133;
  font-size: 14px;
  font-weight: 700;
}

.echarts-box {
  width: 100%;
  height: 250px;
}

.alert-flow-card {
  margin-bottom: 0;

  ::v-deep(.el-card__header) {
    background: #fff7f7;
  }
}

.alert-title {
  color: #303133;
}

.alert-icon {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff4d4f;
  box-shadow: 0 0 0 4px rgb(255 77 79 / 12%);
}

.alert-summary {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

.alert-summary span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.level-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;

  &.danger {
    background: #ff4d4f;
  }

  &.major {
    background: #fa8c16;
  }

  &.minor {
    background: #fadb14;
  }
}

.tab-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-card {
  border-radius: 8px;
}

.section-header,
.node-head,
.metric-label,
.network-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.section-header {
  color: #303133;
  font-size: 14px;
  font-weight: 700;
}

.section-title {
  margin-bottom: 12px;
  color: #303133;
  font-size: 14px;
  font-weight: 700;
}

.muted {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

.service-card,
.node-card {
  margin-bottom: 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  transition: all 0.2s;
}

.service-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 78px;
  padding: 14px 16px;

  &:hover {
    border-color: #d9d9d9;
    box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
  }

  &.is-error {
    border-color: #ffccc7;
    background: #fff7f7;
  }
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.service-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 20px;

  &.blue {
    background: #e6f0ff;
    color: #1a6eff;
  }

  &.green {
    background: #f6ffed;
    color: #52c41a;
  }

  &.purple {
    background: #f5f0ff;
    color: #722ed1;
  }

  &.teal {
    background: #e6fffb;
    color: #13c2c2;
  }

  &.cyan {
    background: #e6f7ff;
    color: #1890ff;
  }

  &.red {
    background: #fff1f0;
    color: #ff4d4f;
  }
}

.service-meta {
  min-width: 0;
}

.service-name,
.node-name {
  color: #303133;
  font-size: 14px;
  font-weight: 700;
}

.service-desc {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
}

.chart-wrap {
  width: 100%;
  overflow: hidden;
}

.chart-canvas {
  display: block;
  width: 100%;
  height: 240px;
}

.topology {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 0 8px;
}

.topo-node {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  min-width: 110px;
  min-height: 46px;
  padding: 8px 14px;
  border: 2px solid #52c41a;
  border-radius: 8px;
  background: #f6ffed;
  color: #303133;
  font-size: 12px;
  font-weight: 700;
  text-align: center;

  &.primary {
    border-color: #1a6eff;
    background: #e6f0ff;
  }

  &.danger {
    border-color: #ff4d4f;
    background: #fff1f0;
  }

  small {
    margin-top: 2px;
    color: #909399;
    font-size: 10px;
    font-weight: 400;
  }
}

.topo-arrow {
  color: #909399;
  font-size: 20px;
}

.legend,
.chart-legend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  color: #909399;
  font-size: 12px;
}

.chart-legend {
  justify-content: flex-end;
}

.legend span,
.chart-legend span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;

  &.success {
    background: #52c41a;
  }

  &.danger {
    background: #ff4d4f;
  }

  &.primary {
    background: #1a6eff;
  }
}

.node-card {
  height: calc(100% - 16px);
  padding: 16px;
}

.node-ip {
  margin-top: 3px;
  color: #909399;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
}

.metric-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 14px;
}

.metric-label {
  margin-bottom: 6px;
  color: #606266;
  font-size: 12px;
}

.network-row {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
  color: #909399;
  font-size: 12px;

  strong {
    color: #303133;
    font-weight: 600;
  }
}

.value-danger {
  color: #ff4d4f;
  font-family: Consolas, 'Courier New', monospace;
  font-weight: 700;
}

.value-warning {
  color: #fa8c16;
  font-family: Consolas, 'Courier New', monospace;
  font-weight: 700;
}

::v-deep(.el-tag) {
  cursor: default;
}

@media (max-width: 768px) {
  .run-monitor-page {
    padding: 10px;
  }

  .section-header,
  .service-card,
  .dashboard-toolbar,
  .dashboard-card-header,
  .alert-flow-header,
  .chart-legend,
  .legend {
    align-items: flex-start;
    flex-direction: column;
  }

  .dashboard-controls {
    justify-content: flex-start;
    width: 100%;
  }

  .dashboard-system-select {
    width: 100%;
  }

  .chart-card {
    height: 300px;
  }

  .echarts-box {
    height: 230px;
  }

  .topology {
    align-items: stretch;
    flex-direction: column;
  }

  .topo-arrow {
    transform: rotate(90deg);
    align-self: center;
  }
}
</style>
