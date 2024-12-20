<template>
  <div class="setting-theme-container">
    <PageLayout>
      <template #button class>
        <div class="setting-theme-button-box">
          <div class="sh3h-search-box">
            <el-row>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式名称:</span>
                <el-input class="sh3h-search-input" placeholder v-model="searchModel.name" />
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式类型:</span>
                <el-select class="sh3h-search-input" v-model="searchModel.type">
                  <el-option label="颜色" value="color" />
                  <el-option label="像素" value="number" />
                  <el-option label="字体" value="string" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式值:</span>
                <el-input class="sh3h-search-input" placeholder v-model="searchModel.value" />
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式用途:</span>
                <el-input class="sh3h-search-input" placeholder v-model="searchModel.description" />
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">状态:</span>
                <el-select class="sh3h-search-input" v-model="searchModel.status">
                  <el-option label="启用" value="true" />
                  <el-option label="停用" value="false" />
                </el-select>
              </el-col>
              <el-col :span="4" class="div-flex-right">
                <el-button type="primary" :icon="Search" @click="searchHandle">查找</el-button>
                <el-button type="primary" :icon="Plus" @click="addHandle">增加</el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </template>
      <template #table>
        <Scrollbar>
          <el-table :data="data.pageData">
            <el-table-column prop="name" align="center" label="样式名称" min-width="150px" />
            <el-table-column prop="type" align="center" label="样式类型">
              <template #default="scope">
                <span v-if="scope.row.type == 'color'">
                  <el-tag :key="scope.row.name" class="mx-1" effect="plain">颜色</el-tag>
                </span>
                <span v-else-if="scope.row.type == 'number'">
                  <el-tag :key="scope.row.name" type="success" class="mx-1" effect="plain">像素</el-tag>
                </span>
                <span v-else="scope.row.type=='font'">
                  <el-tag :key="scope.row.name" type="danger" class="mx-1" effect="plain">字体</el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="value" align="center" label="样式值">
              <template #default="scope">
                <span v-if="scope.row.type == 'color'" class="sh3h-tag-box">
                  <pick-colors v-model:value="scope.row.value"/>
                  <!-- <span class="sh3h-tag-left">
                    <el-tag class="mx-1" effect="plain"  :color="scope.row.value">                      
                    </el-tag>
                  </span>
                  <span class="sh3h-tag-right">{{ scope.row.value }}</span> -->
                </span>
                <span v-else>{{ scope.row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="opacity" align="center" label="是否渐变">
              <template #default="scope">
                <span v-if="scope.row.type == 'color'">
                  <el-switch v-model="scope.row.opacity" disabled />
                </span>
                <span v-else></span>
              </template>
            </el-table-column>
            <el-table-column prop="description" align="center" label="样式用途" />
            <el-table-column prop="status" align="center" label="是否开启">
              <template #default="scope">
                <el-switch v-model="scope.row.status" class="ml-2" disabled />
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template #default="scope">
                <el-button type="primary" @click="editHandle(scope.row)" plain>修改</el-button>
                <el-button
                  :type="scope.row.status ? 'danger' : 'success'"
                  @click="deleteHandle(scope.row)"
                  plain
                >{{ scope.row.status ? '停用' : '开启' }}</el-button>
              </template>
            </el-table-column>
          </el-table>
        </Scrollbar>
      </template>
      <template #pagination>
        <Pagination
          :currentPage="page.currentPage"
          :pageSize="page.pageSize"
          :total="page.total"
          :callBack="paginationChange"
        ></Pagination>
      </template>
    </PageLayout>
  </div>
</template>
<script lang="ts" setup>
import Scrollbar from "@/components/scrollbar/index.vue";
import PageLayout from "@/businessComponent/pageLayout/index.vue"
import Pagination from "@/components/pagination/index.vue"
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue';
import { reactive, computed } from "vue";
import { ClientModel } from "@/api/model/clientModel";
import { useStore } from "@/store";
import PickColors from 'vue-pick-colors'
const store = useStore();
const getThemeConfig = computed(() => {
  return store.state.themeConfig.themeConfig;
});
const searchModel = reactive({
  name: "",
  type: "",
  value: "",
  description: "",
  status: ""
}) as any;
const data = reactive({
  tableData: getThemeConfig.value.colorList,
  filterData: [] as any,
  pageData: [] as any,
  showFlag: false,
  dialogVisible: false,
  dialogStatus: '修改',
  formData: { } as ClientModel
})

const page = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

//加载数据
const loadPageData = () => {
  page.total = data.filterData.length;
  data.pageData = []
  for (let i = (page.currentPage - 1) * page.pageSize; i < page.currentPage * page.pageSize; i++) {
    data.filterData[i] && data.pageData.push(data.filterData[i])
  }
}

//分页处理
const paginationChange = (msg: any) => {
  page.currentPage = msg.currentPage
  page.pageSize = msg.pageSize
  searchHandle();
}

//查询处理
const searchHandle = () => {
  data.filterData = data.tableData;
  Object.keys(searchModel).forEach(key => {
    if (searchModel[key] != '') {
      data.filterData = data.filterData.filter((item: any) => {
        console.log(item[key]);
        return item[key].toString().includes(searchModel[key])
      });
      console.log(data.filterData);
    }
  });
  loadPageData();
}
//增加处理
const addHandle = () => {
  //TODO:addComponent 
}
//修改处理
const editHandle = (Object: any) => {
  //TODO:editComponent 
}
//删除处理
const deleteHandle = (row: any) => {
   //TODO:operate local data toggle,just test
  data.filterData.forEach((element: any) => {
    if (element.name === row.name) {
      element.status = !element.status;
    }
  });
}
searchHandle();
</script>
<style scoped lang="scss">
.setting-theme {
  &-container {
    width: calc(100%);
    height: calc(100%);
    background-color: #fff;
  }
  &-button-box {
    width: 100%;
    height: 100%;
    float: left;
  }
}
.sh3h-tag-box {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  .sh3h-tag-left {
    width: 30px;
    height: 100%;
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .sh3h-tag-right {
    width: 80px;
    height: 100%;
    float: left;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>