import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { Card, Avatar, Typography, Form, Input, Button, message } from "antd";
import { FaUserCircle } from "react-icons/fa";

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const { userInfo } = useAuth();
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);

  const handleFinish = (values: { fullName: string; phone: string }) => {
    console.log("ProfilePage: Saving profile changes:", values);
    message.success("Thông tin đã được lưu (giả lập)!");
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col items-center">
      <Title level={2} className="text-gray-800 mb-6">
        Thông tin cá nhân
      </Title>
      <Card
        className="w-full max-w-lg shadow-lg"
        cover={
          <div className="flex justify-center pt-6">
            <Avatar
              size={120}
              src={userInfo?.avatarUrl || undefined}
              icon={!userInfo?.avatarUrl && <FaUserCircle />}
              className="border border-gray-200"
            />
          </div>
        }
      >
        <div className="text-center mb-6">
          <Text strong className="text-lg text-gray-800">
            {userInfo?.fullName || "N/A"}
          </Text>
          <br />
          <Text type="secondary">{userInfo?.email || "N/A"}</Text>
        </div>

        {isEditing ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              fullName: userInfo?.fullName || "",
              phone: userInfo?.phone || "",
            }}
            onFinish={handleFinish}
            className="space-y-4"
          >
            <Form.Item
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { pattern: /^\d{10,11}$/, message: "Số điện thoại không hợp lệ" },
              ]}
            >
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <div className="flex gap-4">
              <Button
                type="primary"
                htmlType="submit"
                className="bg-blue-500 hover:bg-blue-600"
              >
                Lưu thay đổi
              </Button>
              <Button onClick={() => setIsEditing(false)}>Hủy</Button>
            </div>
          </Form>
        ) : (
          <div className="space-y-4">
            <div>
              <Text strong>Họ và tên: </Text>
              <Text>{userInfo?.fullName || "N/A"}</Text>
            </div>
            <div>
              <Text strong>Email: </Text>
              <Text>{userInfo?.email || "N/A"}</Text>
            </div>
            <div>
              <Text strong>Số điện thoại: </Text>
              <Text>{userInfo?.phone || "N/A"}</Text>
            </div>
            <div>
              <Text strong>Vai trò: </Text>
              <Text>{userInfo?.role || "N/A"}</Text>
            </div>
            <Button
              type="primary"
              onClick={() => setIsEditing(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600"
            >
              Chỉnh sửa
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;