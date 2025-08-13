import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import AdminLayout from "../../layouts/AdminLayout";
import {
  createUser,
  getAllRoles,
  getAllUsers,
  deleteUser,
  UserDto,
  CreateUserDto,
  RoleDto,
  UserStatus,
  UserQueryParameters,
  PaginatedUserResponse,
} from "../../services/userService";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNotification } from "../../components/notifications";
import { adminPaths } from "../../routes/path";

const AdminUserManagementPage: React.FC = () => {
  const { userInfo } = useAuth();
  const { success, error } = useNotification();
  
  // State for users and pagination
  const [users, setUsers] = useState<UserDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // State for create user modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // State for available roles
  const [availableRoles, setAvailableRoles] = useState<RoleDto[]>([]);
  
  // Create user form state
  const [createForm, setCreateForm] = useState<CreateUserDto>({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    roleName: "",
    status: UserStatus.Active,
    credit: 0,
  });

  // Fetch users on component mount and when filters change
  useEffect(() => {
    // Only fetch users if availableRoles has been loaded
    if (availableRoles.length > 0) {
      fetchUsers();
    }
  }, [currentPage, pageSize, searchQuery, statusFilter, roleFilter, availableRoles]);

  // Fetch available roles on component mount
  useEffect(() => {
    fetchAvailableRoles();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const baseParameters: Omit<UserQueryParameters, 'roleId'> = {
        pageNumber: currentPage,
        pageSize: pageSize,
        searchQuery: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        sortBy: "createdAt",
        sortDescending: true,
      };

      if (roleFilter === "all") {
        // When "Tất cả vai trò" is selected, fetch users with ACADEMIC_MANAGER and INSTRUCTOR roles separately
        const academicManagerRole = availableRoles.find(role => role.roleName === "ACADEMIC_MANAGER");
        const instructorRole = availableRoles.find(role => role.roleName === "INSTRUCTOR");
        
        if (academicManagerRole && instructorRole) {
          // Fetch users for each role separately using getAllUsers with roleId
          // Use larger pageSize to ensure we have enough data for pagination
          const fetchPageSize = Math.max(pageSize * 2, 20);
          const [academicManagerResponse, instructorResponse] = await Promise.all([
            getAllUsers({ ...baseParameters, pageSize: fetchPageSize, roleId: academicManagerRole.roleId }),
            getAllUsers({ ...baseParameters, pageSize: fetchPageSize, roleId: instructorRole.roleId })
          ]);
          
          // Combine users from both roles
          const combinedUsers = [...academicManagerResponse.items, ...instructorResponse.items];
          const totalCombinedCount = academicManagerResponse.totalCount + instructorResponse.totalCount;
          
          // Sort combined users by createdAt (newest first)
          const sortedUsers = combinedUsers.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          // Apply pagination manually
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
          
          setUsers(paginatedUsers);
          setTotalCount(totalCombinedCount);
          
          // If we don't have enough users for current page, adjust the page
          if (paginatedUsers.length === 0 && totalCombinedCount > 0) {
            const maxPage = Math.ceil(totalCombinedCount / pageSize);
            if (currentPage > maxPage) {
              setCurrentPage(maxPage);
            }
          }
        } else {
          // If roles are not loaded yet, return empty response and wait for roles to load
          setUsers([]);
          setTotalCount(0);
        }
      } else {
        // When a specific role is selected, fetch users by that role using getAllUsers
        const response = await getAllUsers({ ...baseParameters, roleId: roleFilter });
        setUsers(response.items);
        setTotalCount(response.totalCount);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      error("Lỗi khi tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const roles = await getAllRoles();
      // Filter only ACADEMIC_MANAGER and INSTRUCTOR roles
      const filteredRoles = roles.filter((role: RoleDto) => 
        role.roleName === "ACADEMIC_MANAGER" || role.roleName === "INSTRUCTOR"
      );
      setAvailableRoles(filteredRoles);
    } catch (err) {
      console.error("Error fetching roles:", err);
      error("Lỗi khi tải danh sách vai trò");
    }
  };

  const handleCreateUser = async () => {
    if (!createForm.email || !createForm.password || !createForm.fullName || !createForm.roleName) {
      error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsCreating(true);
    try {
      await createUser(createForm);
      success("Tạo tài khoản thành công");
      setShowCreateModal(false);
      resetCreateForm();
      fetchUsers(); // Refresh the user list
    } catch (err: any) {
      console.error("Error creating user:", err);
      const errorMessage = err.response?.data?.message || "Lỗi khi tạo tài khoản";
      error(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${userName}"?`)) {
      return;
    }

    try {
      await deleteUser(userId);
      success("Vô hiệu hóa tài khoản thành công");
      fetchUsers(); // Refresh the user list
    } catch (err: any) {
      console.error("Error deleting user:", err);
      const errorMessage = err.response?.data?.message || "Lỗi khi vô hiệu hóa tài khoản";
      error(errorMessage);
    }
  };

  const resetCreateForm = () => {
    setCreateForm({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      roleName: "",
      status: UserStatus.Active,
      credit: 0,
    });
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case UserStatus.Active:
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Hoạt động</span>;
      case UserStatus.Inactive:
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Vô hiệu hóa</span>;
      case UserStatus.Suspended:
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Tạm khóa</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Không xác định</span>;
    }
  };

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case "ACADEMIC_MANAGER":
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Quản lý học vụ</span>;
      case "INSTRUCTOR":
        return <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">Giảng viên</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{roleName}</span>;
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600">
            Quản lý tài khoản giảng viên và quản lý học vụ
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent w-64"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as UserStatus | "all")}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value={UserStatus.Active}>Hoạt động</option>
                <option value={UserStatus.Inactive}>Vô hiệu hóa</option>
                <option value={UserStatus.Suspended}>Tạm khóa</option>
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">Tất cả vai trò</option>
                {availableRoles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName === "ACADEMIC_MANAGER" ? "Quản lý học vụ" : "Giảng viên"}
                  </option>
                ))}
              </select>
            </div>

            {/* Create User Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <FaPlus />
              Tạo tài khoản mới
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-orange-500 border-opacity-25"></div>
              <p className="ml-4 text-gray-600">Đang tải danh sách người dùng...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {user.avatarUrl ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={user.avatarUrl}
                                  alt={user.fullName}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                  <span className="text-orange-600 font-medium text-sm">
                                    {user.fullName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              {user.phone && (
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.roleName || "")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDeleteUser(user.id, user.fullName)}
                              disabled={user.status === UserStatus.Inactive}
                              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                                user.status === UserStatus.Inactive
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-red-100 text-red-800 hover:bg-red-200"
                              }`}
                              title={user.status === UserStatus.Inactive ? "Tài khoản đã bị vô hiệu hóa" : "Vô hiệu hóa tài khoản"}
                            >
                              <FaTrash className="inline mr-1" />
                              Vô hiệu hóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-6 py-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Hiển thị {((currentPage - 1) * pageSize) + 1} đến {Math.min(currentPage * pageSize, totalCount)} trong tổng số {totalCount} kết quả
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === 1
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        }`}
                      >
                        Trước
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-700">
                        Trang {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md text-sm font-medium ${
                          currentPage === totalPages
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                        }`}
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Tạo tài khoản mới</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Mật khẩu"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Họ và tên"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="+84-xxx-xxx-xxx"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vai trò <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.roleName}
                    onChange={(e) => setCreateForm({ ...createForm, roleName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Chọn vai trò</option>
                    {availableRoles.map((role) => (
                      <option key={role.roleId} value={role.roleName}>
                        {role.roleName === "ACADEMIC_MANAGER" ? "Quản lý học vụ" : "Giảng viên"}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value={UserStatus.Active}>Hoạt động</option>
                    <option value={UserStatus.Inactive}>Vô hiệu hóa</option>
                    <option value={UserStatus.Suspended}>Tạm khóa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số dư ban đầu
                  </label>
                  <input
                    type="number"
                    value={createForm.credit}
                    onChange={(e) => setCreateForm({ ...createForm, credit: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateUser}
                  disabled={isCreating}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? "Đang tạo..." : "Tạo tài khoản"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUserManagementPage;
