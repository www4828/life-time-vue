<template>
  <div class="setting-theme-container">
    <PageLayout>
      <template #button class>
        <div class="setting-theme-button-box">
          <div class="sh3h-search-box">
            <el-row>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式名称:</span>
                <el-input class="sh3h-search-input" placeholder v-model="searchModel[0].value" />
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式类型:</span>
                <el-select class="sh3h-search-input" v-model="searchModel[1].value">
                  <el-option label="颜色" value="color" />
                  <el-option label="像素" value="number" />
                  <el-option label="字体" value="string" />
                </el-select>
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式值:</span>
                <el-input class="sh3h-search-input" placeholder v-model="searchModel[2].value" />
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">样式用途:</span>
                <el-input class="sh3h-search-input" placeholder v-model="searchModel[3].value" />
              </el-col>
              <el-col :span="4">
                <span class="sh3h-search-lable div-flex-right">状态:</span>
                <el-select class="sh3h-search-input" v-model="searchModel[4].value">
                  <el-option label="启用" :value="1" />
                  <el-option label="停用" :value="0" />
                </el-select>
              </el-col>
              <el-col :span="4" class="div-flex-right">
                <el-button type="primary" :icon="Search" @click="loadPageData">查找</el-button>
                <el-button type="primary" :icon="Plus" @click="addHandle">增加</el-button>
              </el-col>
            </el-row>
          </div>
        </div>
      </template>
      <template #table>
        <Scrollbar>
          <el-table :data="data.tableData">
            <el-table-column prop="themeKey" align="center" label="样式名称" min-width="150px" />
            <el-table-column prop="themeType" align="center" label="样式类型">
              <template #default="scope">
                <span v-if="scope.row.themeType == 'color'">
                  <el-tag :key="scope.row.themeValue" class="mx-1" effect="plain">颜色</el-tag>
                </span>
                <span v-else-if="scope.row.themeType == 'number'">
                  <el-tag :key="scope.row.themeValue" type="success" class="mx-1" effect="plain">像素</el-tag>
                </span>
                <span v-else="scope.row.themeType=='font'">
                  <el-tag :key="scope.row.themeValue" type="danger" class="mx-1" effect="plain">字体</el-tag>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="themeValue" align="center" label="样式值">
              <template #default="scope">
                <span v-if="scope.row.themeType == 'color'" class="sh3h-tag-box">
                  <pick-colors v-model:value="scope.row.themeValue"/>
                  <!-- <span class="sh3h-tag-left">
                    <el-tag class="mx-1" effect="plain"  :color="scope.row.themeValue"/>
                  </span> -->
                  <span class="sh3h-tag-right">{{ scope.row.themeValue }}</span>
                </span>
                <span v-else>{{ scope.row.themeValue }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="themeOpacity" align="center" label="是否渐变">
              <template #default="scope">
                <span v-if="scope.row.type == 'color'">
                  <el-switch v-model="scope.row.themeOpacity" disabled active-value="1" inactive-value="0" />
                </span>
                <span v-else></span>
              </template>
            </el-table-column>
            <el-table-column prop="themeDes" align="center" label="样式用途" />
            <el-table-column prop="status" align="center" label="是否开启">
              <template #default="scope">
                <el-switch v-model="scope.row.status" class="ml-2" disabled :active-value="1" :inactive-value="0"/>
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
          :currentPage="searchParamsModel.pageParams.pageIndex"
          :pageSize="searchParamsModel.pageParams.pageSize"
          :total="searchParamsModel.pageParams.total"
          :callBack="paginationChange"
        ></Pagination>
      </template>
    </PageLayout>
    <Dialog
      :showFlag="data.showFlag"
      :formData="data.formData"
      :dialogStatus="data.dialogStatus"
      @closeDialog="closeDialog"
      @update="updateHandle"
      @save="saveHandle"
    />
  </div>
</template>
<script lang="ts" setup>
import { reactive, computed, ref } from "vue";
import Scrollbar from "@/components/scrollbar/index.vue";
import PageLayout from "@/businessComponent/pageLayout/index.vue"
import Pagination from "@/components/pagination/index.vue"
import { Delete, Edit, Plus, Search } from '@element-plus/icons-vue';
import { ClientModel } from "@/api/model/clientModel";
import { useStore } from "@/store";
import { ThemeStyleModel } from "@/api/model/themeModel";
import { SearchModel } from "@/api/model/baseModel";
import { Response, SearchParamsModel } from "@/api/interface";
import { ThemeService } from "@/api/service/System/ThemeService";
import { cloneDeep } from "lodash-es";
import Dialog from "../components/dialog.vue";
import PickColors from 'vue-pick-colors'
import { ElMessage } from "element-plus";

const themeService = new ThemeService()
const searchParamsModel = reactive(new SearchParamsModel<ThemeStyleModel>());
const store = useStore();
const themeColorList = computed(() => {
  return store.state.themeConfig.colorList;
});
const searchModel = ref<SearchModel<ThemeStyleModel>[]>([
  {
    key: "themeKey",
    value: '',
    match: "like",
  },
  {
    key: "themeType",
    value: '',
    match: "eq",
  },
  {
    key: "themeValue",
    value: '',
    match: "like",
  },
  {
    key: "themeDes",
    value: '',
    match: "like",
  },
  {
    key: "status",
    value: '',
    match: "eq",
  },
  {
    key: "sort",
    value: 'sort',
    match: "orderByDesc",
  },
]);
const data = reactive({
  tableData: [],
  showFlag: false,
  dialogVisible: false,
  dialogStatus: '修改',
  formData: { } as ThemeStyleModel
})
//加载数据
const loadPageData = () => {
  searchParamsModel.searchParams = searchModel.value;
  themeService.list(searchParamsModel).then(res=>{
    searchParamsModel.pageParams.total = res.data.data.pageInfo.total;
    data.tableData = res.data.data.results;
  })
}

//分页处理
const paginationChange = (msg: any) => {
  searchParamsModel.pageParams.pageIndex = msg.currentPage;
  searchParamsModel.pageParams.pageSize = msg.pageSize;
  loadPageData();
}
//增加处理
const addHandle = () => {
  //TODO:addComponent 
  data.formData = {status: 1} as ThemeStyleModel
  data.dialogStatus = '增加';
  data.showFlag = true
}
//修改处理
const editHandle = (row: any) => {
  //TODO:editComponent 
  data.formData = cloneDeep(row)
  data.dialogStatus = '修改';
  data.showFlag = true
}
const updateHandle = (formData: ThemeStyleModel) => {
  themeService.updateThemeStyle(formData.id!, formData).then(res=>{
    ElMessage({
      message: res.message,
      type: res.code == 200 ? "success" : "error",
    });
    store.state.themeConfig.colorList.forEach(item=>{
      if(item.name === formData.themeKey ){
        item.value = formData.themeValue
        item.description = formData.themeDes
        item.type = formData.themeType
        item.opacity = Boolean(formData.themeOpacity)
        item.status = Boolean(formData.status)
      }
    })
    
    closeDialog()
    loadPageData()
  })
}
const saveHandle = () => {
  
}
//删除处理
const deleteHandle = (row: any) => {
   //TODO:operate local data toggle,just test
  // data.filterData.forEach((element: any) => {
  //   if (element.name === row.name) {
  //     element.status = !element.status;
  //   }
  // });
}
const closeDialog = ()=>{
  data.formData = {} as ThemeStyleModel
  data.dialogStatus = '';
  data.showFlag = false
}
loadPageData();
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