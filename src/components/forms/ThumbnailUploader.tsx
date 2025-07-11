// src/components/forms/ThumbnailUploader.tsx
import React, { useState, useEffect } from 'react';
import { Form, Upload, Button, message, Image, Input } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { uploadImage } from '../../services/cloudSerivce'; // Import service upload
import type { FormInstance } from 'antd/es/form';

interface ThumbnailUploaderProps {
  form: FormInstance; // Nhận form instance để cập nhật field
  initialImageUrl?: string | null; // URL ảnh ban đầu để hiển thị
}

const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({ form, initialImageUrl }) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);

  // Cập nhật ảnh preview nếu initialImageUrl thay đổi
  useEffect(() => {
    setImageUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      const response = await uploadImage(file);
      const newUrl = response.imageUrl;
      
      // Cập nhật state nội bộ để hiển thị preview
      setImageUrl(newUrl);
      // Cập nhật giá trị trong Ant Design Form
      form.setFieldsValue({ thumbnailUrl: newUrl });

      message.success(`${file.name} uploaded successfully!`);
      onSuccess(null, file); // Báo cho AntD Upload biết là đã thành công
    } catch (error) {
      console.error('Upload failed:', error);
      message.error(`${file.name} upload failed.`);
      onError(error); // Báo cho AntD Upload biết là đã thất bại
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Trường Form.Item này chứa URL, nhưng Input sẽ bị ẩn đi */}
      <Form.Item
        name="thumbnailUrl"
        label="Course Thumbnail"
        rules={[{ type: 'url', message: 'Please upload an image to generate a valid URL!' }]}
      >
        <Input style={{ display: 'none' }} /> 
      </Form.Item>

      {/* Hiển thị ảnh preview nếu có */}
      {imageUrl && (
        <div style={{ marginBottom: 16, border: '1px solid #d9d9d9', padding: 8, borderRadius: 2 }}>
          <Image width="100%" src={imageUrl} alt="Thumbnail Preview" />
        </div>
      )}
      
      {/* Nút Upload */}
      <Upload
        customRequest={handleUpload}
        showUploadList={false} // Không hiển thị danh sách file mặc định của AntD
        accept="image/png, image/jpeg, image/webp"
      >
        <Button icon={<UploadOutlined />} loading={uploading}>
          {imageUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
        </Button>
      </Upload>
    </div>
  );
};

export default ThumbnailUploader;