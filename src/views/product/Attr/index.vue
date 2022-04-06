<template>
  <div>
    <el-card style="margin: 20px 0">
      <CategorySelect :show="!isShowTable" @getCategoryId="getCategoryId"></CategorySelect>
    </el-card>
    <el-card>
      <!-- 展示平台属性列表 -->
      <div v-show="isShowTable">
        <el-button type="primary" icon="el-icon-plus" :disabled="!category3Id" style="margin-bottom:15px" @click="addAttr">添加属性</el-button>
        <el-table style="width: 100%" border :data="attrList">
          <el-table-column prop="id" label="序号" width="80" align="center"></el-table-column>
          <el-table-column prop="attrName" label="属性名称" width="150"></el-table-column>
          <el-table-column label="属性值列表" width="width">
            <template v-slot="row">
              <el-tag v-for="attrValue in row.row.attrValueList" :key="attrValue.id" type="success" style="margin:10px">
                {{ attrValue.valueName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template v-slot="row">
              <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateBtn(row)"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttrName(row)"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 添加或修改界面 -->
      <div v-show="!isShowTable">
        <el-form ref="form" :inline="true" label-width="80px" :model="attrInfo">
          <el-form-item label="属性名">
            <el-input v-model="attrInfo.attrName" placeholder="请输入属性名"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="el-icon-plus" :disabled="!attrInfo.attrName" @click="addAttrValue">添加属性值</el-button>
        <el-button @click="isShowTable=true">取消</el-button>
        <el-table style="width:100%;margin:20px 0" border :data="attrInfo.attrValueList">
          <el-table-column type="index" align="center" label="序号" width="80"></el-table-column>
          <el-table-column label="属性值名称" width="width">
            <template v-slot="row">
              <!-- 编辑模式还是查看模式 -->
              <el-input
                v-if="row.row.isRedact"
                :ref="row.$index"
                v-model="row.row.valueName"
                placeholder="请输入属性值名称"
                size="mini"
                @blur="changeRedact(row)"
                @keyup.native.enter="changeRedact(row)"
              ></el-input>
              <span v-else style="display:block" @click="changeWatch(row,row.$index)">{{ row.row.valueName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="width">
            <template v-slot="row">
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteAttrValueName(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" :disabled="attrInfo.attrValueList.length < 1" @click="sumbitAttr">保存</el-button>
        <el-button @click="isShowTable=true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 引入lodash的深拷贝
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'Attr',
  data(){
    return{
      category1Id: '',
      category2Id: '',
      category3Id: '',
      attrList:[],
      // 显示列表
      isShowTable: true,
      // 能否编辑属性
      isRedact: true,
      // 属性具体信息
      attrInfo:{
        attrName: '',
        attrValueList: [],
        categoryId: 0,
        categoryLevel: 3
      }
    }
  },
  mounted(){

  },
  methods:{
    // 自定义事件回调
    getCategoryId({ categoryId, level }){
      if(level == 1){
        this.category1Id = categoryId
        this.category2Id = ''
        this.category3Id = ''
      }else if(level == 2){
        this.category2Id = categoryId
        this.category3Id = ''
      }else{
        this.category3Id = categoryId
        this.getAttrList()
      }
    },
    // 获取平台属性
    async getAttrList(){
      const { category1Id, category2Id, category3Id } = this
      const result = await this.$API.attr.reqAttrList(category1Id, category2Id, category3Id)
      if(result.code === 200){
        this.attrList = result.data
      }
    },
    // 添加属性按钮
    addAttr(){
      this.isShowTable = false
      // 清除数据
      this.attrInfo = {
        attrName: '',
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3
      }
    },
    // 修改属性按钮
    updateBtn(row){
      this.isShowTable = false
      // 数据结构是对象里有数组，数组里还有对象，所以需要深拷贝
      this.attrInfo = cloneDeep(row.row)
      this.attrInfo.attrValueList.forEach(item => {
        // Vue 无法探测普通的新增 property 要用$set
        this.$set(item, 'isRedact', false)
      })
    },
    // 添加属性值
    addAttrValue(){
      this.attrInfo.attrValueList.push({
        attrId: this.attrInfo.categoryId,
        valueName: '',
        isRedact: true
      })
      this.$nextTick(() => {
        // 因为新增的时候，input肯定是最后一个
        this.$refs[this.attrInfo.attrValueList.length - 1].focus()
      })
    },
    // 把input修改得 不让编辑
    changeRedact(row){
      if(row.row.valueName.trim() == ''){
        this.$message('请您先输入属性值')
        return
      }
      const res = this.attrInfo.attrValueList.some(item => {
        if(row.row !== item){
          return row.row.valueName == item.valueName
        }
      })
      if(res) return
      row.row.isRedact = false
    },
    // 把span修改得 可以编辑
    changeWatch(row, index){
      row.row.isRedact = true
      // 点击span的时候，切换为input时。因为v-if是页面重绘，
      // 浏览器需要时间解析，不能一点击就立马拿到input元素，
      // 所以要用$nextTick
      this.$nextTick(() => {
        // 自动获取input焦点
        this.$refs[index].focus()
      })
    },
    // 删除整个属性名
    deleteAttrName(row){
      this.$confirm(`您确定删除${row.row.attrName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        // 点击确定
        const result = await this.$API.attr.reqDeleteAttr(row.row.id)
        if(result.code === 200){
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getAttrList()
        }
      }).catch(() => {
        // 点击取消
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 删除一条属性
    deleteAttrValueName(row){
      this.$message('暂时不能删除单条属性')
      // this.$confirm(`您确定删除${row.row.valueName}?`, '提示', {
      //   confirmButtonText: '确定',
      //   cancelButtonText: '取消',
      //   type: 'warning'
      // }).then(async() => {
      //   // 点击确定
      //   const result = await this.$API.attr.reqDeleteAttr(row.row.id)
      //   if(result.code === 200){
      //     this.$message({
      //       type: 'success',
      //       message: '删除成功!'
      //     })
      //     this.getAttrList()
      //   }
      // }).catch(() => {
      //   // 点击取消
      //   this.$message({
      //     type: 'info',
      //     message: '已取消删除'
      //   })
      // })
    },
    // 保存按钮
    async sumbitAttr(){
      this.attrInfo.attrValueList = this.attrInfo.attrValueList.filter(item => {
        if(item.valueName != ''){
          delete item.isRedact
          return true
        }
      })
      const res = await this.$API.attr.reqAddAttr(this.attrInfo)
      if(res.code === 200){
        this.$message.success('保存成功')
        this.getAttrList()
        this.isShowTable = true
      }else{
        this.$message('保存失败', res.data)
      }
    }
  }
}
</script>

<style>

</style>
