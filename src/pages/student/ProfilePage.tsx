import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../auth/AuthContext";
import { updateUserAvatar, updateUser } from "../../services/userService";
import { toast } from "react-toastify";
import background from "../../assets/background_benefit.jpg";
import BackButton from "../../components/BackButton";

const ProfilePage: React.FC = () => {
  // Giả định useAuth cung cấp cả hàm để cập nhật userInfo trong context
  const { userInfo, setUserInfo } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // State cho trạng thái upload
  const [editFullName, setEditFullName] = useState(userInfo?.fullName || "");
  const [editPhone, setEditPhone] = useState(userInfo?.phone || "");

  const [isSaving, setIsSaving] = useState(false);

  // Ref để tham chiếu đến input file ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditFullName(userInfo?.fullName || "");
    setEditPhone(userInfo?.phone || "");
  }, [userInfo]);

  // 2. Hàm xử lý khi người dùng click vào khu vực avatar
  const handleAvatarClick = () => {
    // Kích hoạt click của input file ẩn
    fileInputRef.current?.click();
  };

  // 3. Hàm xử lý khi người dùng đã chọn file avatar mới
  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !userInfo?.id) return;

    setIsUploading(true);
    try {
      // Gọi API updateUserAvatar từ userService
      const updatedUser = await updateUserAvatar(userInfo.id, file);
      const newAvatarUrl = updatedUser.avatarUrl;

      // Cập nhật thông tin user trong AuthContext để UI thay đổi ngay lập tức
      const updatedUserInfo = { ...userInfo, avatarUrl: newAvatarUrl };
      setUserInfo(updatedUserInfo);

      console.log("Cập nhật avatar thành công!");
      toast.success("Cập nhật avatar thành công!");
    } catch (error) {
      console.error("Lỗi khi upload avatar:", error);
      toast.error("Upload avatar thất bại. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!userInfo?.id) return;

    console.log("ProfilePage: Saving profile changes:", {
      fullName: editFullName,
      phone: editPhone,
    });

    setIsSaving(true);
    try {
      // Gọi API updateUser để cập nhật thông tin profile
      const updatedUser = await updateUser(userInfo.id, {
        fullName: editFullName,
        phone: editPhone,
      });

      // Cập nhật lại AuthContext
      const updatedUserInfo = {
        ...userInfo,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone || null,
      };
      setUserInfo(updatedUserInfo);

      console.log("Thông tin đã được lưu thành công!");
      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      toast.error("Cập nhật thông tin thất bại. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="max-w-4xl mx-auto p-6 min-h-screen flex flex-col items-center font-inter">
        <div className="w-full flex justify-start mb-6">
          <BackButton text="Quay lại" />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Thông tin cá nhân
        </h2>
        <div className="w-full max-w-lg bg-white shadow-lg rounded-xl overflow-hidden">
          {/* KHU VỰC AVATAR */}
          <div className="flex justify-center pt-8 pb-4 bg-red-50">
            <div
              className="relative w-32 h-32 group cursor-pointer"
              onClick={handleAvatarClick} // Thêm sự kiện click
            >
              {userInfo?.avatarUrl ? (
                <img
                  src={userInfo.avatarUrl}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-red-200 shadow-md"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-red-200 flex items-center justify-center text-white text-6xl font-bold border-4 border-red-300 shadow-md">
                  {userInfo?.fullName
                    ? userInfo.fullName.charAt(0).toUpperCase()
                    : "U"}
                </div>
              )}

              {/* Lớp phủ hiển thị khi hover hoặc đang upload */}
              <div
                className={`absolute inset-0 w-full h-full bg-black rounded-full flex items-center justify-center transition-opacity duration-300 
              ${
                isUploading ? "opacity-70" : "opacity-0 group-hover:opacity-50"
              }`}
              >
                {isUploading ? (
                  // Spinner/Loading animation
                  <svg
                    className="animate-spin h-8 w-8 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  <span className="text-white text-sm font-semibold">
                    Thay đổi
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Input file ẩn */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            className="hidden"
            accept="image/png, image/jpeg, image/webp"
          />

          <div className="text-center py-6 px-4">
            <p className="font-bold text-xl text-gray-800 mb-1">
              {userInfo?.fullName || "N/A"}
            </p>
            <p className="text-gray-600 text-sm">{userInfo?.email || "N/A"}</p>
          </div>

          <div className="px-6 pb-6">
            {/* Phần form giữ nguyên */}
            {isEditing ? (
              <form onSubmit={handleFinish} className="space-y-5">
                {/* ... form inputs for fullName and phone ... */}
                <div>
                  {" "}
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Họ và tên
                  </label>{" "}
                  <input
                    type="text"
                    id="fullName"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />{" "}
                </div>{" "}
                <div>
                  {" "}
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Số điện thoại
                  </label>{" "}
                  <input
                    type="text"
                    id="phone"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    pattern="^\d{10,11}$"
                    title="Số điện thoại phải có 10 hoặc 11 chữ số"
                  />{" "}
                </div>{" "}
                <div className="flex gap-4 pt-2">
                  {" "}
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors duration-200 shadow-md font-semibold ${
                      isSaving 
                        ? 'bg-red-400 cursor-not-allowed text-white' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>{" "}
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 shadow-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Hủy{" "}
                  </button>{" "}
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-gray-700">
                {" "}
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  {" "}
                  <span className="font-semibold">Họ và tên:</span>{" "}
                  <span>{userInfo?.fullName || "N/A"}</span>{" "}
                </div>{" "}
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <span className="font-semibold">Email:</span>
                  <span>{userInfo?.email || "N/A"}</span>{" "}
                </div>{" "}
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  {" "}
                  <span className="font-semibold">Số điện thoại:</span>
                  <span>{userInfo?.phone || "N/A"}</span>{" "}
                </div>{" "}
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Vai trò:</span>
                  <span>{userInfo?.roleName || "N/A"}</span>{" "}
                </div>{" "}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-6 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md font-semibold"
                >
                  Chỉnh sửa{" "}
                </button>{" "}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
