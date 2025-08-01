// src/components/forms/ThumbnailUploader.tsx
import React, { useState, useEffect } from 'react';
import { Form, Upload, Button, message, Image, Input } from 'antd'; // Ant Design imports
import { UploadOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';

interface ThumbnailUploaderProps {
  form: FormInstance; // Nhận form instance để cập nhật field
  initialImageUrl?: string | null; // URL ảnh ban đầu để hiển thị
  onFileChange?: (file: File | null) => void; // Callback để trả về file cho component cha
}

const ThumbnailUploader: React.FC<ThumbnailUploaderProps> = ({ 
  form, 
  initialImageUrl, 
  onFileChange 
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Cập nhật ảnh preview nếu initialImageUrl thay đổi
  useEffect(() => {
    setImageUrl(initialImageUrl || null);
  }, [initialImageUrl]);

  const handleUpload = async (options: any) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    try {
      // Tạo URL preview cho file
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      setCurrentFile(file);
      
      // Gọi callback để trả về file cho component cha
      if (onFileChange) {
        onFileChange(file);
      }

      message.success(`${file.name} selected successfully!`);
      onSuccess(null, file); // Báo cho AntD Upload biết là đã thành công
    } catch (error) {
      console.error('File selection failed:', error);
      message.error(`${file.name} selection failed.`);
      onError(error); // Báo cho AntD Upload biết là đã thất bại
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setCurrentFile(null);
    
    // Gọi callback để thông báo file đã bị xóa
    if (onFileChange) {
      onFileChange(null);
    }
    
    form.setFieldsValue({ thumbnailUrl: null }); // Clear the thumbnail URL in the parent form
    message.info("Thumbnail removed.");
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg bg-gray-50">
      {/* Hiển thị ảnh preview nếu có */}
      {imageUrl && (
        <div className="relative w-48 h-32 rounded-lg overflow-hidden mb-4 shadow-md">
          <Image width="100%" src={imageUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs hover:bg-red-600 transition-colors"
            title="Remove thumbnail"
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Nút Upload */}
      <Upload
        customRequest={handleUpload}
        showUploadList={false} // Không hiển thị danh sách file mặc định của AntD
        accept="image/png, image/jpeg, image/webp"
        // Ant Design Upload component will not directly update the Form.Item's value
        // because we are using customRequest. The form.setFieldsValue handles it.
      >
        <Button icon={<UploadOutlined />} loading={uploading}>
          {imageUrl ? 'Change Thumbnail' : 'Upload Thumbnail'}
        </Button>
      </Upload>
    </div>
  );
};

export default ThumbnailUploader;
