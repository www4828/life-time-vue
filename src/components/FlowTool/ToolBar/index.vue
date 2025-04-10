<template>

  <div class="toolbar">
    <el-tooltip 
      v-for="(item, index) in toolList" 
      :key="index" 
      effect="dark" 
      :content="item.desc" 
      placement="bottom" 
      popper-class="logic-tooltip-pop"
    >
      <span 
        class="tool-item"
        :class="[currentTool===item.name && 'selected']" 
        @click.stop="handleClick(item, $event)" 
        >
        <!-- :class="[currentTool===item.name && 'selected', item.disabled && 'disabled']"  -->
        <img :src="item.icon">
      </span>
    </el-tooltip>
  </div>
</template>

<script>
import { toolMap } from '@/utils/typeMap'
const EDITOR_EVENT = {
  ONLOAD: 'onload',
  ERROR: 'error',
  RESET: 'reset',
  PREVIEW: 'preview',
  CANVAS_MODEL_ACTIVATED: 'canvas:model-activated',
  CANVAS_MODEL_DELETED: 'canvas:model-deleted',
  CANVAS_MODEL_HOVERED: 'canvas:model-hovered',
  CANVAS_MODEL_CLICKED: 'canvas:model-clicked',
  LOGIC_NODE_ADD: 'logic:node-add',
  LOGIC_NODE_HOVER: 'logic:node-hover',
  LOGIC_NODE_DYN_DATA: 'logic:node-dyn-data',
  LOGIC_HISTORY_CHANGE: 'logic:history-change'
}
export default {
  props: {
    lf: Object,
    graph: Object,
    mode: {
      type: String,
      default: 'edit'
    }
  },
  data () {
    return {
      text: '根据需求配置执行流程图',
      currentTool: '',
      undoAble: false,
      redoAble: false
    }
  },
  computed: {
    toolList () {
      return Object.values(toolMap).map(tool => {
        switch(tool.name) {
          case 'undo':
            tool.disabled = !this.undoAble
            break
          case 'redo':
            tool.disabled = !this.redoAble
            break
          case 'beautify':
            tool.disabled = false
            break
          case 'selection':
            tool.disabled = this.mode === 'preview'
            break
          case 'navigation':
            tool.disabled = this.mode === 'preview'
            break
          default:
            tool.disabled = false
            break
        }
        return tool
      })
    }
  },
  mounted () {
    document.addEventListener('click', (e) => {
      if (e.target.className === 'lf-mini-map-close') {
        this.currentTool = ''
      }
    }, true)
  },
  watch: {
    lf() {
      this.lf && this.lf.on('selection:selected', () => {
        this.currentTool = ''
        this.lf.extension.selectionSelect.closeSelectionSelect()
      })
    },
    graph() {
      this.graph && this.graph.context.eventCenter.on(EDITOR_EVENT.LOGIC_HISTORY_CHANGE, ({canUndo, canRedo}) => {
        this.undoAble = canUndo
        this.redoAble = canRedo
      })
    }
  },
  methods: {
    handleClick (item, e) {
      console.log(item)
      this.currentTool = ''
      // if (item.disabled) return
      const type = item.name
      switch (type) {
        case 'beautify':
          this.lf.extension.dagre && this.lf.extension.dagre.layout({
            nodesep: 2,
            ranksep: 20,
            begin: [100, 100],
          });
          break;
        case 'redo':
          // this.graph && this.graph.redo()
          this.lf.redo()
          break;
          case 'undo':
            // this.graph &&this.graph.undo()
            this.lf.undo()
          break;
        case 'zoomIn':
          this.lf.zoom(true);
          break;
        case 'zoomOut':
          this.lf.zoom(false);
          break;
        case 'fitView':
          this.lf.fitView(100, 100);
          break; 
        case 'selection':
          this.currentTool = type
          this.lf.extension.selectionSelect.openSelectionSelect()
          break
        case 'navigation':
          this.currentTool = type
          const position = this.lf.getPointByClient(e.x, e.y)
          this.lf.extension.miniMap.show(position.domOverlayPosition.x - 120, 40)
          break;  
        case 'reset':
          this.lf.resetZoom();
          this.lf.resetTranslate();
          break;  
        case 'clear':
          this.lf.clearData();
          break;    
      }
    }
  }
}
</script>

<style lang="scss" scoped>
 .toolbar-wrap {
    position: absolute;
    right: 10px;
    top: 10px;
    width: auto;
    height: 36px;
    background: #FFFFFF;
    border: 1px solid #e4e7ed;
    font-family: PingFangSC-Medium;
    font-size: 12px;
    color: #C1C3C8;
    font-weight: 500;
  }
  .toolbar {
    position: absolute;
    right: 0px;
    top: 0px;
    width: 100%;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
  }
  .tool-item {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    margin: 0 8px;
    border-radius: 4px;
    overflow: hidden;
    cursor: pointer;
    user-select: none;
    img {
      width: 20px;
      height: 20px;
      filter: drop-shadow(#303A51 100px 0);
      transform: translateX(-100px);
    }
    &:hover, &.selected {
      background: #2961ef;
      img {
        filter: drop-shadow(#fff 100px 0);
        transform: translateX(-100px);
      }
    }
    &.disabled {
      background: #fff;
      img {
        filter: drop-shadow(#C1C3C8 100px 0);
        transform: translateX(-100px);
      }
    }
  }
</style>