<template>
  <div>
    <el-card style="margin: 20px 0px">
      <!-- 三级联动已经是全局组件了 -->
      <CategorySelect :show="scene != 0" @getCategoryId="getCategoryId"></CategorySelect>
    </el-card>
    <el-card>
      <div v-show="scene == 0">
        <!-- 展示SPU列表的结构 -->
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" @click="addSpu">添加SPU</el-button>
        <el-table style="width: 100%" border :data="records">
          <el-table-column type="index" label="序号" width="80" align="center">
          </el-table-column>
          <el-table-column prop="spuName" label="SPU名称" width="width">
          </el-table-column>
          <el-table-column prop="description" label="SPU描述" width="width">
          </el-table-column>
          <el-table-column prop="prop" label="操作" width="width">
            <template slot-scope="row">
              <!-- 这里按钮将来用hintButton替换 -->
              <hint-button
                type="success"
                icon="el-icon-plus"
                size="mini"
                title="添加sku"
                @click="addSku(row.row)"
              ></hint-button>
              <hint-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                title="修改spu"
                @click="updateSpu(row.row)"
              ></hint-button>
              <hint-button
                type="info"
                icon="el-icon-info"
                size="mini"
                title="查看当前spu全部sku列表"
                @click="handler(row.row)"
              ></hint-button>
              <el-popconfirm
                :title="`确定删除${row.row.spuName}吗？`"
                @onConfirm="deleteSpu(row.row)"
              >
                <hint-button
                  slot="reference"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  title="删除spu"
                ></hint-button>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          style="text-align: center"
          :current-page="page"
          :page-sizes="[3, 5, 10]"
          :page-size="limit"
          layout="prev, pager, next, jumper,->, sizes,total"
          :total="total"
          @current-change="getSpuList"
          @size-change="handleSizeChange"
        >
        </el-pagination>
      </div>
      <SpuForm v-show="scene == 1" ref="spu" @changeScene="changeScene"></SpuForm>
      <SkuForm v-show="scene == 2" ref="sku" @changeScenes="changeScenes"></SkuForm>
    </el-card>
    <el-dialog
      :title="`${spu.spuName}的sku列表`"
      :visible.sync="dialogTableVisible"
      :before-close="close"
    >
      <!-- table展示sku列表-->
      <el-table v-loading="loading" :data="skuList" style="width: 100%" border>
        <el-table-column prop="skuName" label="名称" width="width">
        </el-table-column>
        <el-table-column prop="price" label="价格" width="width">
        </el-table-column>
        <el-table-column prop="weight" label="重量" width="width">
        </el-table-column>
        <el-table-column label="默认图片" width="width">
          <template slot-scope="row">
            <img :src="row.row.skuDefaultImg" alt="" style="width:100px;height:100px;">
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
// 引入子组件
import SpuForm from './SpuForm'
import SkuForm from './SkuForm'
export default {
  name: 'Spu',
  components: {
    SpuForm,
    SkuForm
  },
  data() {
    return {
      // 分类的id
      category1Id: '',
      category2Id: '',
      category3Id: '',
      page: 1, // 分页器当前第几页
      limit: 3, // 每一页需要展示多少条数据
      records: [], // spu列表的数据
      total: 0, // 分页器一共需要展示数据的条数
      scene: 0, // 0代表展示SPU列表数据   1 添加SPU|修改SPU   2 添加SKU
      // 控制对话框的显示与隐藏
      dialogTableVisible: false,
      spu: {},
      skuList: [], // 存储的是SKU列表的数据
      loading:true
    }
  },
  methods: {
    // 三级联动的自定义事件，可以把子组件的相应的id传递给父组件
    getCategoryId({ categoryId, level }) {
      // categoryId:获取到一、二、三级分类的id
      if (level == 1) {
        this.category1Id = categoryId
        this.category2Id = ''
        this.category3Id = ''
      } else if (level == 2) {
        this.category2Id = categoryId
        this.category3Id = ''
      } else {
        this.category3Id = categoryId
        // 获取SPU列表数据进行展示
        this.getSpuList()
      }
    },
    // 获取SPU列表数据的方法
    async getSpuList(pages = 1) {
      this.page = pages
      const { page, limit, category3Id } = this
      const result = await this.$API.spu.reqSpuList(page, limit, category3Id)
      if (result.code == 200) {
        this.total = result.data.total
        this.records = result.data.records
      }
    },
    // 当分页器的某一个展示数据条数发生变化的回调
    handleSizeChange(limit) {
      this.limit = limit
      this.getSpuList()
    },
    // 添加SPU按钮的回调
    addSpu() {
      this.scene = 1
      this.$refs.spu.addSpuData(this.category3Id)
    },
    // 修改某一个SPU
    updateSpu(row) {
      this.scene = 1
      this.$refs.spu.initSpuData(row)
    },
    // 自定义事件回调（SpuForm）
    changeScene({ scene, flag }) {
      this.scene = scene
      if (flag == '修改') {
        this.getSpuList(this.page)
      } else {
        this.getSpuList()
      }
    },
    // 删除SPU的回调
    async deleteSpu(row) {
      const result = await this.$API.spu.reqDeleteSpu(row.id)
      if (result.code == 200) {
        this.$message({ type: 'success', message: '删除成功' })
        // 代表SPU个数大于1删除的时候停留在当前页，如果SPU个数小于1 回到上一页
        this.getSpuList(this.records.length > 1 ? this.page : this.page - 1)
      }
    },
    // 添加SKU按钮
    addSku(row) {
      this.scene = 2
      this.$refs.sku.getData(this.category1Id, this.category2Id, row)
    },
    // skuform通知父组件修改场景
    changeScenes(scene) {
      this.scene = scene
    },
    // 查看SKU的按钮
    async handler(spu) {
      // 点击这个按钮的时候，对话框可见的
      this.dialogTableVisible = true
      // 保存spu信息
      this.spu = spu
      // 获取sku列表的数据进行展示
      const result = await this.$API.spu.reqSkuList(spu.id)
      if (result.code == 200) {
        this.skuList = result.data
        this.loading = false
      }
    },
    // 关闭对话框
    close(done){
      this.loading = true
      this.skuList = []
      done()
    }
  }
}
</script>

<style scoped>
</style>
