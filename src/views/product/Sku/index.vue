<template>
  <div>
    <!-- 表格 -->
    <el-table style="width: 100%" border :data="records">
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column prop="skuName" label="名称" width="width">
      </el-table-column>
      <el-table-column prop="skuDesc" label="描述" width="width">
      </el-table-column>
      <el-table-column label="默认图片" width="110">
        <template slot-scope="row">
          <img :src="row.row.skuDefaultImg" alt="" style="width: 80px; height: 80px">
        </template>
      </el-table-column>
      <el-table-column prop="weight" label="重量" width="80"></el-table-column>
      <el-table-column prop="price" label="价格" width="80"></el-table-column>
      <el-table-column prop="prop" label="操作" width="width">
        <template slot-scope="row">
          <el-button v-if="row.row.isSale == 0" type="info" icon="el-icon-bottom" size="mini" title="上架" @click="sale(row.row)">
          </el-button>
          <el-button v-else type="success" icon="el-icon-top" size="mini" title="下架" @click="cancel(row.row)">
          </el-button>
          <el-button type="primary" icon="el-icon-edit" size="mini" title="修改" @click="edit">
          </el-button>
          <el-button type="info" icon="el-icon-info" size="mini" title="展示" @click="getSkuInfo(row.row)">
          </el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" title="删除">
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页  -->
    <el-pagination
      style="text-align: center"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      layout="prev, pager, next, jumper,->,sizes,total"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="getSkuList"
    >
    </el-pagination>
    <!-- 抽屉效果 -->
    <el-drawer :visible.sync="show" :show-close="false" size="50%">
      <el-row>
        <el-col :span="5">名称</el-col>
        <el-col :span="16">{{ skuInfo.skuName }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">描述</el-col>
        <el-col :span="16">{{ skuInfo.skuDesc }}</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">价格</el-col>
        <el-col :span="16">{{ skuInfo.price }}元</el-col>
      </el-row>
      <el-row>
        <el-col :span="5">平台属性</el-col>
        <el-col :span="16">
          <el-tag v-for="attr in skuInfo.skuAttrValueList" :key="attr.id" type="success" style="margin-right:10px;margin-bottom:10px">{{ attr.attrId }}-{{ attr.valueId }}</el-tag>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="5">商品图片</el-col>
        <el-col :span="16">
          <el-carousel height="450px">
            <el-carousel-item v-for="item in skuInfo.skuImageList" :key="item.id">
              <img :src="item.imgUrl" style="width:100%;height:100%">
            </el-carousel-item>
          </el-carousel>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
export default {
  name: 'Sku',
  data() {
    return {
      page: 1, // 代表当前第几页
      limit: 10, // 代表当前页面有几条数据
      records: [], // 存储SKU列表的数据
      total: 0, // 存储分页器一共展示的数据
      skuInfo:{}, // 存储SKU信息
      show:false
    }
  },
  mounted() {
    this.getSkuList()
  },
  methods: {
    // 获取sku列表
    async getSkuList(pages = 1) {
      this.page = pages
      // 解构出默认的参数
      const { page, limit } = this
      const result = await this.$API.sku.reqSkuList(page, limit)
      if (result.code === 200) {
        this.total = result.data.total
        this.records = result.data.records
      }
    },
    // 每页条数改变
    handleSizeChange(limit) {
      this.limit = limit
      this.getSkuList()
    },
    // 上架
    async sale(row) {
      const result = await this.$API.sku.reqSale(row.id)
      if (result.code == 200) {
        row.isSale = 1
        this.$message({ type: 'success', message: '上架成功' })
      }
    },
    // 下架
    async cancel(row) {
      const result = await this.$API.sku.reqCancel(row.id)
      if (result.code == 200) {
        row.isSale = 0
        this.$message({ type: 'success', message: '下架成功' })
      }
    },
    // 编辑(没有写)
    edit() {
      this.$message('正在开发中')
    },
    // 获取SKU详情的方法
    async getSkuInfo(sku){
      // 展示抽屉
      this.show = true
      // 获取SKU数据
      const result = await this.$API.sku.reqSkuById(sku.id)
      if(result.code === 200){
        this.skuInfo = result.data
      }
    }
  }
}
</script>

<style>
  .el-carousel__item h3 {
    color: #475669;
    font-size: 14px;
    opacity: 0.75;
    line-height: 150px;
    margin: 0;
  }

  .el-carousel__item:nth-child(2n) {
    background-color: #99a9bf;
  }

  .el-carousel__item:nth-child(2n+1) {
    background-color: #d3dce6;
  }
</style>

<style scoped>
  .el-row .el-col-5{
    font-size:18px;
    text-align:right;
  }
  .el-col{
    margin:10px 10px;
  }
  ::v-deep .el-carousel__button{
    width:10px;
    height:10px;
    background:red;
    border-radius:50%;
  }
</style>
