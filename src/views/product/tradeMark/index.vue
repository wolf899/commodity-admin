<template>
  <div>
    <el-button type="primary" icon="el-icon-plus" class="add" @click="addBtn">添加</el-button>
    <el-table border style="width: 100%" :data="list">
      <el-table-column prop="id" label="序号" width="80px" align="center"></el-table-column>
      <el-table-column prop="tmName" label="品牌名称" width="width"></el-table-column>
      <el-table-column prop="logoUrl" label="品牌LOGO" width="width">
        <!-- <img src="../../../assets/background.jpg" style="width:100px;height:100px"> -->
        <template v-slot="row">
          <img :src="row.row.logoUrl" style="width:100px;height:100px">
        </template>
      </el-table-column>
      <el-table-column prop="date" label="操作" width="width">
        <template v-slot="row">
          <el-button type="warning" icon="el-icon-edit" size="mini" @click="updateBtn(row)">修改</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteMessageBox(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器 -->
    <el-pagination
      style="margin-top: 30px;text-align:center"
      :current-page="page"
      :page-sizes="[3, 5, 10]"
      :page-size="limit"
      :page-count="7"
      layout=" prev, pager, next, jumper,->, total, sizes"
      :total="total"
      @current-change="changeCurrentPage"
      @size-change="changeSize"
    >
    </el-pagination>
    <!-- 添加品牌信息 -->
    <el-dialog title="添加品牌" :visible.sync="dialogFormVisible">
      <el-form ref="ruleForm" style="width: 80%" :model="tmFrom" :rules="rules">
        <el-form-item label="品牌名称" label-width="100px" prop="tmName">
          <el-input v-model="tmFrom.tmName" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="品牌LOGO" label-width="100px" prop="logoUrl">
          <el-upload
            class="avatar-uploader"
            action="/dev-api/admin/product/fileUpload"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="tmFrom.logoUrl" :src="tmFrom.logoUrl" class="avatar">
            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            <div slot="tip" class="el-upload__tip">只能上传jpg文件，且不超过2M</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrUpdateTradeMark()">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'TradeMark',
  data(){
    return{
      page:1, // 当前页码
      limit:3, // 每页显示几条
      total:0, // 总条数
      list:[],
      dialogFormVisible: false, // 弹窗是否可见
      // 品牌信息
      tmFrom:{
        // id: '',
        tmName: '',
        logoUrl: ''
      },
      // 验证
      rules:{
        tmName: [
          { required: true, message: '请输入品牌名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
        ],
        logoUrl: [
          { required: true, message: '请选择品牌图片' }
        ]
      }
    }
  },
  mounted(){
    this.getPageList()
  },
  methods:{
    async getPageList(){
      // 解构出参数
      const { page, limit } = this
      const result = await this.$API.tradeMark.reqTradeMark(page, limit)
      if(result.code == 200){
        this.total = result.data.total
        this.list = result.data.records
      }
    },
    // 修改当前页码
    changeCurrentPage(page){
      this.page = page
      this.getPageList()
    },
    // 修改每页显示的数据
    changeSize(limit){
      this.limit = limit
      this.getPageList()
    },
    // 显示添加品牌弹窗
    addBtn(){
      this.dialogFormVisible = true
      // 清空数据
      this.tmFrom = { tmName:'', logoUrl:'' }
    },
    // 显示修改品牌弹窗
    updateBtn(row){
      this.dialogFormVisible = true
      this.tmFrom = { ...row.row }
    },
    // 上传成功
    handleAvatarSuccess(res) {
      this.tmFrom.logoUrl = res.data
    },
    // 上传之前
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isJPG) {
        this.$message.error('上传图片只能是JPG格式!')
      }
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过2MB!')
      }
      return isJPG && isLt2M
    },
    // 确定上传
    addOrUpdateTradeMark(){
      this.$refs.ruleForm.validate(async(success) => {
        if(success){
          this.dialogFormVisible = false
          // 发请求
          const result = await this.$API.tradeMark.reqAddOrUpdateTradeMark(this.tmFrom)
          if(result.code === 200){
            this.$message.success(this.tmFrom.id ? '修改品牌成功' : '添加品牌成功')
            this.getPageList()
          }
        }else{
          return false
        }
      })
    },
    // 删除弹框
    deleteMessageBox(row) {
      this.$confirm(`您确定删除${row.row.tmName}?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async() => {
        // 点击确定
        const result = await this.$API.tradeMark.reqDeleteTradeMark(row.row.id)
        if(result.code === 200){
          this.$message({
            type: 'success',
            message: '删除成功!'
          })
          this.getPageList()
        }
      }).catch(() => {
        // 点击取消
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    }
  }
}
</script>

<style scoped>
  .add{
    margin: 10px 0;
  }

  /** 上传style */
  ::v-deep .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  ::v-deep .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 178px;
    height: 178px;
    line-height: 178px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
