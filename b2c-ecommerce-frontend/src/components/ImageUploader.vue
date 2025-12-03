<template>
  <div class="image-uploader">
    <div class="upload-container">
      <div v-for="(url, index) in imageList" :key="index" class="image-item">
        <el-image
          :src="url"
          :preview-src-list="imageList"
          fit="cover"
          class="image-preview"
        >
          <template #error>
            <div class="image-error">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="image-actions">
          <el-button type="primary" size="small" @click="previewImage(index)">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button type="danger" size="small" @click="removeImage(index)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <!-- 上传按钮 -->
      <div v-if="imageList.length < limit" class="upload-button" @click="triggerUpload">
        <el-icon size="24"><Plus /></el-icon>
        <span>上传图片</span>
        <span class="upload-tip">{{ `支持 ${accept} 格式，最大 ${maxSize}MB` }}</span>
      </div>
    </div>

    <input
      ref="fileInput"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileChange"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, ZoomIn, Delete, Picture } from '@element-plus/icons-vue'

// Props
interface Props {
  modelValue: string | string[]
  limit?: number
  maxSize?: number // MB
  accept?: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  limit: 1,
  maxSize: 5,
  accept: 'image/*',
  multiple: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

// 响应式数据
const fileInput = ref<HTMLInputElement>()

// 计算属性
const imageList = computed({
  get: () => {
    if (Array.isArray(props.modelValue)) {
      return props.modelValue
    }
    return props.modelValue ? [props.modelValue] : []
  },
  set: (value: string[]) => {
    if (Array.isArray(props.modelValue)) {
      emit('update:modelValue', value)
    } else {
      emit('update:modelValue', value[0] || '')
    }
  }
})

// 方法
const triggerUpload = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  const filesArray = Array.from(files)

  // 检查数量限制
  if (imageList.value.length + filesArray.length > props.limit) {
    ElMessage.warning(`最多只能上传 ${props.limit} 张图片`)
    return
  }

  // 处理每个文件
  filesArray.forEach(file => {
    if (!validateFile(file)) return

    // 创建临时预览URL
    const tempUrl = URL.createObjectURL(file)

    // 这里应该调用上传API
    uploadFile(file, tempUrl)
  })

  // 重置input
  event.target.value = ''
}

const validateFile = (file: File): boolean => {
  // 检查文件类型
  if (!props.accept.includes('*') && !file.type.match(props.accept.replace('*', '.*'))) {
    ElMessage.error(`文件类型不支持，仅支持 ${props.accept} 格式`)
    return false
  }

  // 检查文件大小
  if (file.size > props.maxSize * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }

  return true
}

const uploadFile = async (file: File, tempUrl: string) => {
  try {
    // 这里应该调用实际的上传API
    // const response = await uploadApi.uploadFile(file)
    // const finalUrl = response.url

    // 模拟上传过程
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 模拟返回URL（实际中应该从API获取）
    const finalUrl = tempUrl

    // 添加到图片列表
    if (Array.isArray(props.modelValue)) {
      imageList.value = [...imageList.value, finalUrl]
    } else {
      imageList.value = [finalUrl]
    }

    ElMessage.success('上传成功')
  } catch (error) {
    ElMessage.error('上传失败')
    URL.revokeObjectURL(tempUrl)
  }
}

const removeImage = (index: number) => {
  const newImages = [...imageList.value]
  newImages.splice(index, 1)
  imageList.value = newImages
}

const previewImage = (index: number) => {
  // Element Plus的图片预览会自动处理
}
</script>

<style scoped>
.image-uploader {
  width: 100%;
}

.upload-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.image-preview {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
}

.image-actions {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item:hover .image-actions {
  opacity: 1;
}

.upload-button {
  width: 120px;
  height: 120px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #fafafa;
}

.upload-button:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.upload-button span {
  font-size: 14px;
  color: #606266;
}

.upload-tip {
  font-size: 12px !important;
  color: #909399 !important;
  text-align: center;
  line-height: 1.2;
  padding: 0 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .image-item,
  .upload-button {
    width: 100px;
    height: 100px;
  }
}

@media (max-width: 480px) {
  .image-item,
  .upload-button {
    width: 80px;
    height: 80px;
  }

  .upload-button span:first-child {
    font-size: 12px;
  }

  .upload-tip {
    font-size: 10px !important;
  }
}
</style>