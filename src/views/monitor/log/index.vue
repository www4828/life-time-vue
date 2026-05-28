<template>
  <div class="log-page">
    <section class="filter-panel">
      <el-form :model="filterForm" label-position="top" size="default">
        <el-row :gutter="16">
          <el-col :lg="4" :md="8" :sm="12" :xs="24">
            <el-form-item label="接口名称">
              <el-input
                v-model.trim="filterForm.apiName"
                clearable
                placeholder="请输入接口名称"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :lg="4" :md="8" :sm="12" :xs="24">
            <el-form-item label="应用名称">
              <el-select v-model="filterForm.app" clearable placeholder="全部应用">
                <el-option v-for="app in appOptions" :key="app" :label="app" :value="app" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="4" :md="8" :sm="12" :xs="24">
            <el-form-item label="请求 IP">
              <el-input
                v-model.trim="filterForm.ip"
                clearable
                placeholder="请输入请求 IP"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :lg="4" :md="8" :sm="12" :xs="24">
            <el-form-item label="调用状态">
              <el-select v-model="filterForm.status" clearable placeholder="全部状态">
                <el-option label="成功(2xx)" value="2xx" />
                <el-option label="重定向(3xx)" value="3xx" />
                <el-option label="客户端错误(4xx)" value="4xx" />
                <el-option label="服务端错误(5xx)" value="5xx" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :lg="4" :md="8" :sm="12" :xs="24">
            <el-form-item label="响应码">
              <el-input
                v-model.trim="filterForm.code"
                clearable
                placeholder="如 200, 404, 500"
                @keyup.enter="handleSearch"
              />
            </el-form-item>
          </el-col>
          <el-col :lg="4" :md="8" :sm="12" :xs="24">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="filterForm.timeRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                format="YYYY-MM-DD HH:mm"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>

        <div class="filter-actions">
          <div>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
          </div>
          <el-button type="success" :icon="Download" @click="handleExport">导出日志</el-button>
        </div>
      </el-form>
    </section>

    <section class="table-panel">
      <div class="panel-title">
        <div class="title-left">
          <span class="title-mark"></span>
          <span class="title-text"> 日志记录列表</span>
          <span class="title-count">共 {{ filteredLogs.length }} 条</span>
        </div>
      </div>

      <el-table
        :data="logData"
        height="100%"
        stripe
        row-key="id"
        :row-class-name="tableRowClassName"
        empty-text="暂无匹配的日志记录"
      >
        <el-table-column type="expand" width="48">
          <template #default="{ row }">
            <div class="expand-content">
              <div class="message-title request">请求报文</div>
              <el-descriptions :column="1" size="small" border>
                <el-descriptions-item label="请求 URL">{{ row.requestUrl }}</el-descriptions-item>
                <el-descriptions-item label="请求方法">{{ row.requestMethod }}</el-descriptions-item>
                <el-descriptions-item label="请求头">
                  <pre>{{ row.requestHeaders }}</pre>
                </el-descriptions-item>
                <el-descriptions-item v-if="row.requestBody !== emptyValue" label="请求体">
                  <pre>{{ row.requestBody }}</pre>
                </el-descriptions-item>
              </el-descriptions>

              <div class="message-title response">响应报文</div>
              <el-descriptions :column="1" size="small" border>
                <el-descriptions-item label="响应状态码">{{ row.responseStatusCode }}</el-descriptions-item>
                <el-descriptions-item label="响应头">
                  <pre>{{ row.responseHeaders }}</pre>
                </el-descriptions-item>
                <el-descriptions-item v-if="row.responseBody !== emptyValue" label="响应体">
                  <pre>{{ row.responseBody }}</pre>
                </el-descriptions-item>
              </el-descriptions>

              <template v-if="row.errorStack">
                <div class="message-title error">异常堆栈</div>
                <pre class="error-stack">{{ row.errorStack }}</pre>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="time" label="时间" min-width="160" show-overflow-tooltip />
        <el-table-column prop="app" label="应用名称" min-width="130" show-overflow-tooltip />
        <el-table-column prop="path" label="接口地址" min-width="200" show-overflow-tooltip />
        <el-table-column prop="method" label="请求方式" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="methodTagType(row.method)" effect="light">{{ row.method }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="statusCode" label="状态码" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.statusCode)" effect="plain">
              {{ row.statusCode }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="响应时长" width="110" align="center">
          <template #default="{ row }">
            <span :class="{ 'duration-danger': row.duration >= 3000 }">{{ row.duration }}ms</span>
          </template>
        </el-table-column>
        <el-table-column prop="result" label="调用结果" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.result === '成功' ? 'success' : 'danger'" effect="light">
              {{ row.result }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link :icon="View" @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-bar">
        <span>第 {{ page.currentPage }} 页 / 共 {{ totalPages }} 页</span>
        <el-pagination
          v-model:current-page="page.currentPage"
          v-model:page-size="page.pageSize"
          background
          layout="prev, pager, next"
          :total="filteredLogs.length"
        />
      </div>
    </section>


    <el-dialog v-model="detailVisible" title="日志详情" width="780px" top="6vh" destroy-on-close>
      <template v-if="detailLog">
        <el-descriptions :column="2" border size="small" class="detail-summary">
          <el-descriptions-item label="接口地址">{{ detailLog.path }}</el-descriptions-item>
          <el-descriptions-item label="调用时间">{{ detailLog.time }}</el-descriptions-item>
          <el-descriptions-item label="应用名称">{{ detailLog.app }}</el-descriptions-item>
          <el-descriptions-item label="请求 IP">{{ detailLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="状态码">
            {{ detailLog.statusCode }} {{ detailLog.responseStatusCode.split(' ').slice(1).join(' ') }}
          </el-descriptions-item>
          <el-descriptions-item label="响应时长">{{ detailLog.duration }}ms</el-descriptions-item>
        </el-descriptions>

        <el-tabs model-value="request" class="detail-tabs">
          <el-tab-pane label="请求报文" name="request">
            <div class="code-block">
              <div><span>请求 URL：</span>{{ detailLog.requestUrl }}</div>
              <div><span>请求方法：</span>{{ detailLog.requestMethod }}</div>
              <div><span>请求头：</span></div>
              <pre>{{ detailLog.requestHeaders }}</pre>
              <template v-if="detailLog.requestBody !== emptyValue">
                <div><span>请求体：</span></div>
                <pre>{{ detailLog.requestBody }}</pre>
              </template>
            </div>
          </el-tab-pane>
          <el-tab-pane label="响应报文" name="response">
            <div class="code-block">
              <div><span>响应状态码：</span>{{ detailLog.responseStatusCode }}</div>
              <div><span>响应头：</span></div>
              <pre>{{ detailLog.responseHeaders }}</pre>
              <template v-if="detailLog.responseBody !== emptyValue">
                <div><span>响应体：</span></div>
                <pre>{{ detailLog.responseBody }}</pre>
              </template>
            </div>
          </el-tab-pane>
          <el-tab-pane v-if="detailLog.errorStack" label="异常堆栈" name="error">
            <pre class="code-block error-stack">{{ detailLog.errorStack }}</pre>
          </el-tab-pane>
        </el-tabs>
      </template>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Coin, Download, Monitor, RefreshLeft, Search, View } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type StatusRange = '' | '2xx' | '3xx' | '4xx' | '5xx'

interface LogItem {
  id: number
  time: string
  app: string
  path: string
  method: HttpMethod
  statusCode: number
  duration: number
  result: '成功' | '失败'
  ip: string
  requestUrl: string
  requestMethod: HttpMethod
  requestHeaders: string
  requestBody: string
  responseStatusCode: string
  responseHeaders: string
  responseBody: string
  errorStack: string
}

interface FilterForm {
  apiName: string
  app: string
  ip: string
  status: StatusRange
  code: string
  timeRange: string[]
}

interface RowClassParams {
  row: LogItem
  rowIndex: number
}

const emptyValue = '—'

const logData: LogItem[] = [
  { id: 1, time: '2024-01-15 14:32:15', app: '数据交换服务', path: '/api/v1/data/query', method: 'POST', statusCode: 200, duration: 45, result: '成功', ip: '192.168.1.100', requestUrl: 'https://api.example.com/api/v1/data/query?page=1&size=20', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: 550e8400-e29b-41d4-a716-446655440000', requestBody: '{\n  "userId": "12345",\n  "dataType": "public",\n  "filters": {"status": "active"}\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 45ms', responseBody: '{\n  "code": 0,\n  "message": "success",\n  "data": [{"id": 1, "name": "张三"}]\n}', errorStack: '' },
  { id: 2, time: '2024-01-15 14:30:22', app: 'API网关', path: '/api/v1/user/auth', method: 'GET', statusCode: 401, duration: 12, result: '失败', ip: '10.0.0.55', requestUrl: 'https://api.example.com/api/v1/user/auth?token=invalid', requestMethod: 'GET', requestHeaders: 'Content-Type: application/json\nX-Request-ID: 660e8400-e29b-41d4-a716-446655440001', requestBody: emptyValue, responseStatusCode: '401 Unauthorized', responseHeaders: 'Content-Type: application/json\nWWW-Authenticate: Bearer', responseBody: '{\n  "code": 401,\n  "message": "Invalid or expired token",\n  "timestamp": "2024-01-15T14:30:22Z"\n}', errorStack: '' },
  { id: 3, time: '2024-01-15 14:28:05', app: '认证中心', path: '/api/v1/oauth/token', method: 'POST', statusCode: 200, duration: 68, result: '成功', ip: '192.168.1.200', requestUrl: 'https://api.example.com/api/v1/oauth/token', requestMethod: 'POST', requestHeaders: 'Content-Type: application/x-www-form-urlencoded\nX-Request-ID: 770e8400-e29b-41d4-a716-446655440002', requestBody: 'grant_type=client_credentials&client_id=test&client_secret=***', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nCache-Control: no-store', responseBody: '{\n  "access_token": "eyJhbGciOi...",\n  "token_type": "Bearer",\n  "expires_in": 3600\n}', errorStack: '' },
  { id: 4, time: '2024-01-15 14:25:48', app: '用户管理服务', path: '/api/v1/user/profile', method: 'GET', statusCode: 500, duration: 3200, result: '失败', ip: '192.168.1.150', requestUrl: 'https://api.example.com/api/v1/user/profile?userId=99999', requestMethod: 'GET', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: 880e8400-e29b-41d4-a716-446655440003', requestBody: emptyValue, responseStatusCode: '500 Internal Server Error', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 3200ms', responseBody: '{\n  "code": 500,\n  "message": "Internal server error",\n  "path": "/api/v1/user/profile"\n}', errorStack: 'java.lang.NullPointerException: null\n    at com.shanghai.data.user.controller.UserController.getProfile(UserController.java:85)\n    at org.springframework.web.method.support.InvocableHandlerMethod.invoke(InvocableHandlerMethod.java:215)\n    at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:878)\n    ... 25 common frames omitted' },
  { id: 5, time: '2024-01-15 14:22:10', app: '数据交换服务', path: '/api/v1/data/upload', method: 'POST', statusCode: 200, duration: 230, result: '成功', ip: '192.168.1.101', requestUrl: 'https://api.example.com/api/v1/data/upload', requestMethod: 'POST', requestHeaders: 'Content-Type: multipart/form-data\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: 990e8400-e29b-41d4-a716-446655440004', requestBody: '--boundary\nContent-Disposition: form-data; name="file"; filename="data.csv"\nContent-Type: text/csv\n\n... binary data ...', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 230ms', responseBody: '{\n  "code": 0,\n  "message": "upload success",\n  "fileId": "f_20240115_001"\n}', errorStack: '' },
  { id: 6, time: '2024-01-15 14:20:33', app: '日志服务', path: '/api/v1/logs/collect', method: 'POST', statusCode: 202, duration: 15, result: '成功', ip: '10.0.0.10', requestUrl: 'https://api.example.com/api/v1/logs/collect', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nX-Request-ID: aa0e8400-e29b-41d4-a716-446655440005', requestBody: '{\n  "logLevel": "INFO",\n  "source": "api-gateway-01",\n  "message": "Request processed successfully",\n  "timestamp": "2024-01-15T14:20:33Z"\n}', responseStatusCode: '202 Accepted', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 15ms', responseBody: '{\n  "code": 0,\n  "message": "accepted",\n  "logId": "log_20240115_001"\n}', errorStack: '' },
  { id: 7, time: '2024-01-15 14:18:55', app: 'API网关', path: '/api/v1/data/query', method: 'GET', statusCode: 200, duration: 38, result: '成功', ip: '192.168.1.50', requestUrl: 'https://api.example.com/api/v1/data/query?type=all', requestMethod: 'GET', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: bb0e8400-e29b-41d4-a716-446655440006', requestBody: emptyValue, responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 38ms', responseBody: '{\n  "code": 0,\n  "message": "success",\n  "data": [{"id": 1}, {"id": 2}]\n}', errorStack: '' },
  { id: 8, time: '2024-01-15 14:15:20', app: '认证中心', path: '/api/v1/user/register', method: 'POST', statusCode: 409, duration: 52, result: '失败', ip: '192.168.2.88', requestUrl: 'https://api.example.com/api/v1/user/register', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nX-Request-ID: cc0e8400-e29b-41d4-a716-446655440007', requestBody: '{\n  "username": "test_user",\n  "email": "test@example.com",\n  "phone": "13800138000"\n}', responseStatusCode: '409 Conflict', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 52ms', responseBody: '{\n  "code": 409,\n  "message": "User already exists",\n  "details": "username: test_user already taken"\n}', errorStack: '' },
  { id: 9, time: '2024-01-15 14:12:40', app: '数据交换服务', path: '/api/v1/data/sync', method: 'POST', statusCode: 200, duration: 5100, result: '失败', ip: '192.168.1.102', requestUrl: 'https://api.example.com/api/v1/data/sync', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: dd0e8400-e29b-41d4-a716-446655440008', requestBody: '{\n  "source": "db_01",\n  "target": "db_02",\n  "tableList": ["user", "order", "product"]\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 5100ms', responseBody: '{\n  "code": 0,\n  "message": "sync completed",\n  "duration": 5100,\n  "syncedRows": 15000\n}', errorStack: 'WARNING: Sync duration exceeded threshold (5000ms)' },
  { id: 10, time: '2024-01-15 14:10:05', app: '用户管理服务', path: '/api/v1/user/list', method: 'GET', statusCode: 200, duration: 120, result: '成功', ip: '192.168.1.201', requestUrl: 'https://api.example.com/api/v1/user/list?page=1&size=50', requestMethod: 'GET', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: ee0e8400-e29b-41d4-a716-446655440009', requestBody: emptyValue, responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 120ms', responseBody: '{\n  "code": 0,\n  "message": "success",\n  "total": 1024,\n  "data": [{"id": 1, "name": "张三"}, {"id": 2, "name": "李四"}]\n}', errorStack: '' },
  { id: 11, time: '2024-01-15 14:08:30', app: 'API网关', path: '/api/v1/health/check', method: 'GET', statusCode: 200, duration: 5, result: '成功', ip: '10.0.0.1', requestUrl: 'https://api.example.com/api/v1/health/check', requestMethod: 'GET', requestHeaders: 'X-Request-ID: ff0e8400-e29b-41d4-a716-446655440010', requestBody: emptyValue, responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json', responseBody: '{\n  "status": "UP",\n  "timestamp": "2024-01-15T14:08:30Z"\n}', errorStack: '' },
  { id: 12, time: '2024-01-15 14:05:18', app: '数据交换服务', path: '/api/v1/data/delete', method: 'DELETE', statusCode: 403, duration: 8, result: '失败', ip: '192.168.3.66', requestUrl: 'https://api.example.com/api/v1/data/delete?id=100', requestMethod: 'DELETE', requestHeaders: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: aa1e8400-e29b-41d4-a716-446655440011', requestBody: emptyValue, responseStatusCode: '403 Forbidden', responseHeaders: 'Content-Type: application/json', responseBody: '{\n  "code": 403,\n  "message": "Insufficient permissions",\n  "requiredRole": "ADMIN"\n}', errorStack: '' },
  { id: 13, time: '2024-01-15 14:02:44', app: '日志服务', path: '/api/v1/logs/search', method: 'POST', statusCode: 200, duration: 450, result: '成功', ip: '192.168.1.30', requestUrl: 'https://api.example.com/api/v1/logs/search', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nX-Request-ID: bb1e8400-e29b-41d4-a716-446655440012', requestBody: '{\n  "startTime": "2024-01-15T00:00:00Z",\n  "endTime": "2024-01-15T14:00:00Z",\n  "level": "ERROR",\n  "page": 1,\n  "size": 20\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 450ms', responseBody: '{\n  "code": 0,\n  "total": 5,\n  "data": [{"id": "e1", "message": "Connection timeout"}]\n}', errorStack: '' },
  { id: 14, time: '2024-01-15 13:58:30', app: '认证中心', path: '/api/v1/oauth/refresh', method: 'POST', statusCode: 200, duration: 32, result: '成功', ip: '192.168.1.88', requestUrl: 'https://api.example.com/api/v1/oauth/refresh', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nX-Request-ID: cc1e8400-e29b-41d4-a716-446655440013', requestBody: '{\n  "refreshToken": "rt_eyJhbGciOiJIUzI1NiIs..."\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json', responseBody: '{\n  "access_token": "eyJhbGciOi...",\n  "expires_in": 3600\n}', errorStack: '' },
  { id: 15, time: '2024-01-15 13:55:00', app: '用户管理服务', path: '/api/v1/user/update', method: 'PUT', statusCode: 200, duration: 89, result: '成功', ip: '192.168.1.202', requestUrl: 'https://api.example.com/api/v1/user/update', requestMethod: 'PUT', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: dd1e8400-e29b-41d4-a716-446655440014', requestBody: '{\n  "userId": "12345",\n  "email": "newemail@example.com",\n  "phone": "13900139000"\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 89ms', responseBody: '{\n  "code": 0,\n  "message": "update success"\n}', errorStack: '' },
  { id: 16, time: '2024-01-15 13:52:12', app: 'API网关', path: '/api/v1/data/export', method: 'GET', statusCode: 504, duration: 30000, result: '失败', ip: '192.168.2.120', requestUrl: 'https://api.example.com/api/v1/data/export?format=csv', requestMethod: 'GET', requestHeaders: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: ee1e8400-e29b-41d4-a716-446655440015', requestBody: emptyValue, responseStatusCode: '504 Gateway Timeout', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 30000ms', responseBody: '{\n  "code": 504,\n  "message": "Upstream service timeout",\n  "upstream": "data-export-service:8080"\n}', errorStack: 'org.springframework.web.client.ResourceAccessException: I/O error on GET request for "http://data-export-service:8080/export": Read timed out; nested exception is java.net.SocketTimeoutException: Read timed out\n    at org.springframework.web.client.RestTemplate.doExecute(RestTemplate.java:748)\n    at org.springframework.web.client.RestTemplate.execute(RestTemplate.java:670)\n    ... 15 common frames omitted' },
  { id: 17, time: '2024-01-15 13:48:40', app: '数据交换服务', path: '/api/v1/data/query', method: 'POST', statusCode: 200, duration: 55, result: '成功', ip: '192.168.1.103', requestUrl: 'https://api.example.com/api/v1/data/query?page=2&size=20', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: ff1e8400-e29b-41d4-a716-446655440016', requestBody: '{\n  "userId": "67890",\n  "dataType": "protected",\n  "filters": {"status": "pending"}\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 55ms', responseBody: '{\n  "code": 0,\n  "message": "success",\n  "data": [{"id": 10, "name": "王五"}]\n}', errorStack: '' },
  { id: 18, time: '2024-01-15 13:45:22', app: '日志服务', path: '/api/v1/logs/aggregate', method: 'POST', statusCode: 200, duration: 980, result: '成功', ip: '10.0.0.12', requestUrl: 'https://api.example.com/api/v1/logs/aggregate', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nX-Request-ID: aa2e8400-e29b-41d4-a716-446655440017', requestBody: '{\n  "metrics": ["count", "avg_duration"],\n  "groupBy": ["app", "status_code"],\n  "timeRange": {"start": "2024-01-14T00:00:00Z", "end": "2024-01-15T13:45:00Z"}\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 980ms', responseBody: '{\n  "code": 0,\n  "data": [\n    {"app": "数据交换服务", "count": 1520, "avg_duration": 45.2},\n    {"app": "API网关", "count": 890, "avg_duration": 32.1}\n  ]\n}', errorStack: '' },
  { id: 19, time: '2024-01-15 13:40:15', app: '认证中心', path: '/api/v1/user/logout', method: 'POST', statusCode: 200, duration: 10, result: '成功', ip: '192.168.1.89', requestUrl: 'https://api.example.com/api/v1/user/logout', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: bb2e8400-e29b-41d4-a716-446655440018', requestBody: '{\n  "userId": "12345"\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json', responseBody: '{\n  "code": 0,\n  "message": "logout success"\n}', errorStack: '' },
  { id: 20, time: '2024-01-15 13:35:50', app: '用户管理服务', path: '/api/v1/user/delete', method: 'DELETE', statusCode: 204, duration: 25, result: '成功', ip: '192.168.1.203', requestUrl: 'https://api.example.com/api/v1/user/delete?id=999', requestMethod: 'DELETE', requestHeaders: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: cc2e8400-e29b-41d4-a716-446655440019', requestBody: emptyValue, responseStatusCode: '204 No Content', responseHeaders: 'X-Response-Time: 25ms', responseBody: emptyValue, errorStack: '' },
  { id: 21, time: '2024-01-15 13:30:10', app: 'API网关', path: '/api/v1/rate-limit/status', method: 'GET', statusCode: 429, duration: 2, result: '失败', ip: '192.168.5.200', requestUrl: 'https://api.example.com/api/v1/rate-limit/status', requestMethod: 'GET', requestHeaders: 'X-Request-ID: dd2e8400-e29b-41d4-a716-446655440020', requestBody: emptyValue, responseStatusCode: '429 Too Many Requests', responseHeaders: 'Content-Type: application/json\nRetry-After: 60', responseBody: '{\n  "code": 429,\n  "message": "Rate limit exceeded",\n  "retryAfter": 60\n}', errorStack: '' },
  { id: 22, time: '2024-01-15 13:25:35', app: '数据交换服务', path: '/api/v1/data/query', method: 'POST', statusCode: 200, duration: 42, result: '成功', ip: '192.168.1.104', requestUrl: 'https://api.example.com/api/v1/data/query?page=3&size=20', requestMethod: 'POST', requestHeaders: 'Content-Type: application/json\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIs...\nX-Request-ID: ee2e8400-e29b-41d4-a716-446655440021', requestBody: '{\n  "userId": "11111",\n  "dataType": "public",\n  "filters": {"category": "finance"}\n}', responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 42ms', responseBody: '{\n  "code": 0,\n  "message": "success",\n  "data": [{"id": 50, "name": "赵六"}]\n}', errorStack: '' },
  { id: 23, time: '2024-01-15 13:20:00', app: '日志服务', path: '/api/v1/logs/cleanup', method: 'DELETE', statusCode: 200, duration: 2800, result: '成功', ip: '10.0.0.15', requestUrl: 'https://api.example.com/api/v1/logs/cleanup?before=2024-01-01', requestMethod: 'DELETE', requestHeaders: 'X-Request-ID: ff2e8400-e29b-41d4-a716-446655440022', requestBody: emptyValue, responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json\nX-Response-Time: 2800ms', responseBody: '{\n  "code": 0,\n  "message": "cleanup completed",\n  "deletedCount": 50000\n}', errorStack: '' },
  { id: 24, time: '2024-01-15 13:15:45', app: 'API网关', path: '/api/v1/circuit-breaker/status', method: 'GET', statusCode: 200, duration: 8, result: '成功', ip: '10.0.0.2', requestUrl: 'https://api.example.com/api/v1/circuit-breaker/status', requestMethod: 'GET', requestHeaders: 'X-Request-ID: aa3e8400-e29b-41d4-a716-446655440023', requestBody: emptyValue, responseStatusCode: '200 OK', responseHeaders: 'Content-Type: application/json', responseBody: '{\n  "circuitBreakers": {\n    "data-service": "CLOSED",\n    "auth-service": "CLOSED",\n    "export-service": "HALF_OPEN"\n  }\n}', errorStack: '' },
]

const createEmptyFilters = (): FilterForm => ({
  apiName: '',
  app: '',
  ip: '',
  status: '',
  code: '',
  timeRange: [],
})

const filterForm = reactive<FilterForm>(createEmptyFilters())
const activeFilters = reactive<FilterForm>(createEmptyFilters())
const page = reactive({
  currentPage: 1,
  pageSize: 10,
})
const detailVisible = ref(false)
const detailLog = ref<LogItem>()

const appOptions = computed(() => Array.from(new Set(logData.map((item) => item.app))))

const filteredLogs = computed(() => {
  const codeList = activeFilters.code
    .split(',')
    .map((code) => Number(code.trim()))
    .filter((code) => !Number.isNaN(code))
  const [startTime, endTime] = activeFilters.timeRange || []
  const apiName = activeFilters.apiName.toLowerCase()
  const ip = activeFilters.ip.toLowerCase()
  console.log(activeFilters.code, codeList);
  
  return logData.filter((log) => {
    if (apiName && !log.path.toLowerCase().includes(apiName)) return false
    if (activeFilters.app && log.app !== activeFilters.app) return false
    if (ip && !log.ip.toLowerCase().includes(ip)) return false
    if (activeFilters.status && !isStatusInRange(log.statusCode, activeFilters.status)) return false
    if (codeList.length && !codeList.includes(log.statusCode)) return false
    if (startTime && log.time < startTime) return false
    if (endTime && log.time > endTime) return false
    return true
  })
})

const pagedLogs = computed(() => {
  const start = (page.currentPage - 1) * page.pageSize
  
  return filteredLogs.value.slice(start, start + page.pageSize)
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredLogs.value.length / page.pageSize)))

watch(filteredLogs, () => {
  if (page.currentPage > totalPages.value) {
    page.currentPage = totalPages.value
  }
})

const handleSearch = () => {
  Object.assign(activeFilters, {
    ...filterForm,
    timeRange: [...(filterForm.timeRange || [])],
  })
  page.currentPage = 1
}

const handleReset = () => {
  Object.assign(filterForm, createEmptyFilters())
  Object.assign(activeFilters, createEmptyFilters())
  page.currentPage = 1
}

const handleExport = () => {
  ElMessage.success('日志导出任务已提交，预计 1-2 分钟完成，可在下载中心查看。')
}

const openDetail = (row: LogItem) => {
  detailLog.value = row
  detailVisible.value = true
}

const isStatusInRange = (code: number, range: StatusRange) => {
  if (range === '2xx') return code >= 200 && code < 300
  if (range === '3xx') return code >= 300 && code < 400
  if (range === '4xx') return code >= 400 && code < 500
  if (range === '5xx') return code >= 500 && code < 600
  return true
}

const methodTagType = (method: HttpMethod) => {
  const map: Record<HttpMethod, '' | 'success' | 'warning' | 'danger'> = {
    GET: '',
    POST: 'success',
    PUT: 'warning',
    DELETE: 'danger',
  }
  return map[method]
}

const statusTagType = (code: number) => {
  if (code >= 200 && code < 300) return 'success'
  if (code >= 300 && code < 400) return ''
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'danger'
  return 'info'
}

const tableRowClassName = ({ row }: RowClassParams) => {
  if (row.statusCode >= 500) return 'log-row-error'
  if (row.statusCode >= 400) return 'log-row-warning'
  return ''
}
</script>

<style lang="scss" scoped>
.log-page {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
  background: #f5f7fa;
}

.filter-panel,
.table-panel {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 4%);
}

.filter-panel {
  padding: 16px 16px 12px;
}

.filter-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.table-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 46px;
  padding: 0 16px;
  border-bottom: 1px solid #e8e8e8;
  color: #303133;
  font-weight: 600;
}

.title-left {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.title-mark {
  display: inline-block;
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: var(--el-color-primary);
}
.title-text{
  font-size: 16px;
}

.title-count {
  color: #909399;
  font-size: 12px;
  font-weight: 400;
}

.expand-content {
  padding: 14px 22px 18px;
  background: #f9fafb;
}

.message-title {
  margin: 10px 0 8px;
  font-size: 13px;
  font-weight: 600;

  &.request {
    color: var(--el-color-primary);
  }

  &.response {
    color: var(--el-color-success);
  }

  &.error {
    color: var(--el-color-danger);
  }
}

.code-block,
pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
}

.code-block {
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  background: #f9fafb;
  color: #606266;

  span {
    color: #909399;
  }
}

.error-stack {
  color: var(--el-color-danger);
}

.duration-danger {
  color: var(--el-color-danger);
  font-weight: 600;
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 16px;
  border-top: 1px solid #e8e8e8;
  background: #fafafa;
  color: #909399;
  font-size: 12px;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 32px;
  padding: 0 14px;
  border-radius: 4px;
  background: #001529;
  color: #c0c4cc;
  font-size: 12px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

.detail-summary {
  margin-bottom: 12px;
}

.detail-tabs {
  min-height: 320px;
}

::v-deep(.el-form-item) {
  margin-bottom: 12px;
}

::v-deep(.el-select),
::v-deep(.el-date-editor.el-input__wrapper) {
  width: 100%;
}

::v-deep(.el-table) {
  flex: 1;
}

::v-deep(.log-row-error) {
  --el-table-tr-bg-color: #fff2f0;
}

::v-deep(.log-row-warning) {
  --el-table-tr-bg-color: #fffbe6;
}

@media (max-width: 768px) {
  .filter-actions,
  .pagination-bar,
  .status-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .filter-actions {
    gap: 10px;
  }

  .status-bar {
    padding: 8px 14px;
  }
}
</style>
