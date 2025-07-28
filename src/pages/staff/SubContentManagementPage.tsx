// src/pages/admin/SubContentManagementPage.tsx
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify"; // For notifications
import AdminSideBar from "../../components/sidebar/StaffSidebar"; // Assuming you have an AdminSideBar
import AdminHeader from "../../components/header/StaffHeader"; // Assuming you have an AdminHeader
import Pagination from "../../components/pagination/Pagination"; // Reusing your Pagination component
import ConfirmationModal from "../../components/modals/ConfirmationModal"; // A generic confirmation modal

import {
  getAllSubContents,
  createSubContent,
  updateSubContent,
  deleteSubContentById,
  getSubContentNameEnumValues,
  getCourseLevelEnumValues,
  getContentNameEnumValues,
  SubContentDto,
  CreateSubContentDto,
  UpdateSubContentDto,
  CourseLevel, // Giờ là numeric enum
  ContentName, // Giờ là numeric enum
  SubContentName, // Giờ là numeric enum
  EnumValueDto,
} from "../../services/subContentService"; // Import the service you just created

const SubContentManagementPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<CourseLevel | null>(null); // Sẽ lưu giá trị số của enum
  const [subContents, setSubContents] = useState<SubContentDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [pageIndex, setPageIndex] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);

  // Form states
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [editingSubContent, setEditingSubContent] =
    useState<SubContentDto | null>(null);
  // formData sẽ lưu trực tiếp giá trị số của enum
  const [formData, setFormData] = useState<CreateSubContentDto>({
    subContentName: SubContentName.Mondai1, // Giá trị số mặc định
    level: CourseLevel.N5, // Giá trị số mặc định
    contentName: ContentName.Kanji, // Giá trị số mặc định
  });

  // Delete confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [subContentToDeleteId, setSubContentToDeleteId] = useState<
    string | null
  >(null);

  // Enum options for dropdowns in form (vẫn cần để hiển thị tên đẹp)
  const [subContentNameOptions, setSubContentNameOptions] = useState<
    EnumValueDto[]
  >([]);
  const [courseLevelOptions, setCourseLevelOptions] = useState<
    EnumValueDto[]
  >([]);
  const [contentNameOptions, setContentNameOptions] = useState<
    EnumValueDto[]
  >([]);

  // Exam structure image state (now an array of strings)
  const [examStructureImages, setExamStructureImages] = useState<string[]>([]);

  // Fetch enum values on component mount
  useEffect(() => {
    const fetchEnumOptions = async () => {
      try {
        const [subContentNames, levels, contentNames] = await Promise.all([
          getSubContentNameEnumValues(),
          getCourseLevelEnumValues(),
          getContentNameEnumValues(),
        ]);
        setSubContentNameOptions(subContentNames);
        setCourseLevelOptions(levels);
        setContentNameOptions(contentNames);
      } catch (err) {
        console.error("Failed to fetch enum options:", err);
        toast.error("Không thể tải các tùy chọn danh mục.");
      }
    };
    fetchEnumOptions();
  }, []);

  // Update formData level when selectedLevel changes and load exam structure images
  useEffect(() => {
    if (selectedLevel !== null) { // Kiểm tra null rõ ràng
      setFormData((prev) => ({ ...prev, level: selectedLevel }));
      // Load exam structure images
      const loadImages = async () => {
        // Sử dụng SubContentName[selectedLevel] để lấy tên chuỗi cho URL ảnh
        const levelName = CourseLevel[selectedLevel];
        if (levelName === "N1") {
          try {
            const image1 = await import(
              `../../assets/Cautruc${levelName}_1.png`
            );
            const image2 = await import(
              `../../assets/Cautruc${levelName}_2.png`
            );
            setExamStructureImages([image1.default, image2.default]);
          } catch (error) {
            console.error(`Failed to load N1 exam structure images:`, error);
            setExamStructureImages([]);
          }
        } else {
          try {
            const image = await import(
              `../../assets/Cautruc${levelName}.png`
            );
            setExamStructureImages([image.default]);
          } catch (error) {
            console.error(
              `Failed to load exam structure image for ${levelName}:`,
              error
            );
            setExamStructureImages([]);
          }
        }
      };
      loadImages();
    } else {
      // If no level selected, default to N5 or clear form level if desired
      setFormData((prev) => ({ ...prev, level: CourseLevel.N5 })); // Mặc định về N5 (giá trị số 0)
      setExamStructureImages([]);
    }
    setIsAdding(false); // Hide form when level changes
    setEditingSubContent(null); // Clear editing state
    setPageIndex(1); // Reset page
  }, [selectedLevel]);

  // Fetch subcontents based on selected level and pagination
  const fetchSubContents = useCallback(async () => {
    if (selectedLevel === null) { // Kiểm tra null
      setSubContents([]);
      setTotalItems(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Gửi giá trị số của enum cho bộ lọc 'level'
      const result = await getAllSubContents(
        undefined,
        selectedLevel,
        undefined,
        undefined,
        pageIndex,
        pageSize
      );
      setSubContents(result.items);
      setTotalItems(result.totalItemsCount);
    } catch (err) {
      console.error("Failed to fetch Dạng câu hỏi:", err);
      setError("Không thể tải Dạng câu hỏi. Vui lòng thử lại.");
      toast.error("Không thể tải Dạng câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [selectedLevel, pageIndex, pageSize]);

  useEffect(() => {
    fetchSubContents();
  }, [fetchSubContents]);

  const handleLevelButtonClick = (levelValue: CourseLevel) => { // Nhận giá trị số
    setSelectedLevel(levelValue);
  };

  const handleAddClick = () => {
    setIsAdding(true);
    setEditingSubContent(null);
    setFormData({
      subContentName: subContentNameOptions?.[0]?.value as SubContentName, // Lấy giá trị số mặc định
      level: selectedLevel !== null ? selectedLevel : CourseLevel.N5, // Sử dụng selectedLevel hoặc mặc định N5 (số)
      contentName: contentNameOptions?.[0]?.value as ContentName, // Lấy giá trị số mặc định
    });
  };

  const handleEditClick = (subContent: SubContentDto) => {
    setIsAdding(true);
    setEditingSubContent(subContent);
    // Khi chỉnh sửa, cần chuyển đổi tên chuỗi từ SubContentDto thành giá trị số để điền vào form
    const currentSubContentNameValue = subContentNameOptions.find(opt => opt.name === subContent.subContentName)?.value;
    const currentContentNameValue = contentNameOptions.find(opt => opt.name === subContent.contentName)?.value;
    const currentLevelValue = courseLevelOptions.find(opt => opt.name === subContent.level)?.value;


    setFormData({
      subContentName: currentSubContentNameValue as SubContentName,
      level: currentLevelValue as CourseLevel,
      contentName: currentContentNameValue as ContentName,
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    // Chuyển đổi giá trị string từ select (luôn là string) sang number
    setFormData((prev) => ({ ...prev, [name]: parseInt(value, 10) as any }));
  };

  const handleSaveSubContent = async (e: React.FormEvent) => {
    e.preventDefault();

    // Payload đã sẵn sàng với giá trị số nguyên vì formData đã lưu số
    const payload: CreateSubContentDto = {
      subContentName: formData.subContentName,
      level: formData.level,
      contentName: formData.contentName,
    };

    try {
      if (editingSubContent) {
        await updateSubContent(
          editingSubContent.subContentId,
          payload as UpdateSubContentDto // Sử dụng payload trực tiếp
        );
        toast.success("Cập nhật Dạng câu hỏi thành công!");
      } else {
        await createSubContent(
          payload // Sử dụng payload trực tiếp
        );
        toast.success("Thêm Dạng câu hỏi mới thành công!");
      }
      fetchSubContents();
      setIsAdding(false);
      setEditingSubContent(null);
    } catch (err) {
      console.error("Failed to save Dạng câu hỏi:", err);
      toast.error("Lưu Dạng câu hỏi thất bại. Vui lòng thử lại.");
    }
  };

  const handleDeleteClick = (subContentId: string) => {
    setSubContentToDeleteId(subContentId);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (subContentToDeleteId) {
      try {
        await deleteSubContentById(subContentToDeleteId);
        toast.success("Xóa Dạng câu hỏi thành công!");
        fetchSubContents();
      } catch (err) {
        console.error("Failed to delete Dạng câu hỏi:", err);
        toast.error("Xóa Dạng câu hỏi thất bại. Vui lòng thử lại.");
      } finally {
        setIsConfirmModalOpen(false);
        setSubContentToDeleteId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setSubContentToDeleteId(null);
  };

  const handlePageChange = (page: number) => {
    setPageIndex(Math.max(1, page));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPageIndex(1);
  };

  // Helper function to get description from value for display
  const getLevelDescription = (levelValue: CourseLevel | null): string => {
    if (levelValue === null) return "";
    const option = courseLevelOptions.find(opt => opt.value === levelValue);
    return option ? option.description : levelValue.toString();
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <AdminSideBar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Quản lý Dạng câu hỏi
          </h1>

          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            {courseLevelOptions.map((levelOption) => (
              <button
                key={levelOption.value}
                onClick={() =>
                  handleLevelButtonClick(levelOption.value as CourseLevel) // Gửi giá trị số
                }
                className={`px-6 py-3 rounded-lg text-lg font-semibold transition-all duration-200 ease-in-out shadow-md
                                ${
                                  selectedLevel === levelOption.value // So sánh với giá trị số
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                                }`}
              >
                {levelOption.description}
              </button>
            ))}
          </div>

          {selectedLevel !== null && ( // Kiểm tra null
            <div className="grid grid-cols-2 gap-6">
              {/* Left Side: CRUD Operations */}
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    Dạng câu hỏi Cấp độ {getLevelDescription(selectedLevel)}
                  </h2>
                  <button
                    onClick={handleAddClick}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Thêm mới
                  </button>
                </div>

                {/* Add/Edit Form */}
                {isAdding && (
                  <form onSubmit={handleSaveSubContent} className="mb-4 p-4 border rounded">
                    <div className="mb-2">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        Tên Dạng câu hỏi:
                      </label>
                      <select
                        name="subContentName"
                        value={formData.subContentName} // Giá trị số
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        {subContentNameOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="block text-gray-700 text-sm font-bold mb-1">
                        Tên Nội dung:
                      </label>
                      <select
                        name="contentName"
                        value={formData.contentName} // Giá trị số
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        {contentNameOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        {editingSubContent ? "Lưu Thay Đổi" : "Thêm"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdding(false);
                          setEditingSubContent(null);
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ml-2"
                      >
                        Hủy
                      </button>
                    </div>
                  </form>
                )}

                {loading ? (
                  <div className="text-center py-8 text-gray-600">
                    Đang tải Dạng câu hỏi...
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">{error}</div>
                ) : subContents.length === 0 && !isAdding ? (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có Dạng câu hỏi nào cho cấp độ{" "}
                    {getLevelDescription(selectedLevel)}.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                      <thead className="bg-gray-100">
                        <tr>
                          
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">
                            Tên Dạng câu hỏi
                          </th>
                          <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700 border-b">
                            Tên Nội dung
                          </th>
                          <th className="py-3 px-4 text-center text-sm font-semibold text-gray-700 border-b">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {subContents.map((sub) => (
                          <tr
                            key={sub.subContentId}
                            className="hover:bg-gray-50 transition-colors duration-150"
                          >
                            {/* <td className="py-3 px-4 text-sm text-gray-800 border-b">
                              {sub.subContentId.substring(0, 8)}...
                            </td> */}
                            <td className="py-3 px-4 text-sm text-gray-800 border-b">
                              {sub.subContentNameDescription}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-800 border-b">
                              {sub.contentNameDescription}
                            </td>
                            <td className="py-3 px-4 text-center text-sm border-b">
                              <button
                                onClick={() => handleEditClick(sub)}
                                className="text-blue-600 hover:text-blue-800 mr-3"
                                title="Sửa"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 inline"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-7.536 7.536l-2.828 2.828.793.793 2.828-2.828-.793-.793z" />
                                  <path
                                    fillRule="evenodd"
                                    d="M14.586 4.586a2 2 0 00-2.828 0L7 9.172V12h2.828l5.758-5.758a2 2 0 000-2.828zM3 13.172V17h3.828L13 10.828 9.172 7 3 13.172z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(sub.subContentId)}
                                className="text-red-600 hover:text-red-800"
                                title="Xóa"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 inline"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {subContents.length > 0 && (
                  <Pagination
                    page={pageIndex}
                    pageSize={pageSize}
                    total={totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                  />
                )}
              </div>

              {/* Right Side: Exam Structure Image(s) */}
              {selectedLevel !== null && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">
                    Cấu trúc đề thi {getLevelDescription(selectedLevel)}
                  </h2>
                  {examStructureImages.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      {" "}
                      {/* Added a div to stack images */}
                      {examStructureImages.map((src, index) => (
                        <img
                          key={index}
                          src={src}
                          alt={`Cấu trúc đề thi ${getLevelDescription(selectedLevel)} - Phần ${
                            index + 1
                          }`}
                          className="max-w-full h-auto border border-gray-200 rounded" // Added some styling for clarity
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      Không có hình ảnh cấu trúc đề thi cho cấp độ này.
                    </p>
                  )}
                  {/* You can add an upload button here if needed for staff to update the image */}
                </div>
              )}
            </div>
          )}

          {selectedLevel === null && (
            <div className="text-center py-10 text-gray-600 text-lg">
              Vui lòng chọn một cấp độ để quản lý Dạng câu hỏi và xem cấu trúc đề
              thi.
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa Dạng câu hỏi"
        message="Bạn có chắc chắn muốn xóa Dạng câu hỏi này không? Hành động này không thể hoàn tác."
      />
    </div>
  );
};

export default SubContentManagementPage;

// Hàm trợ giúp để lấy mô tả cho cấp độ (dùng để hiển thị, không phải gửi API)
// Hàm này không còn là 'selectedLevelDescription' nữa, mà là 'getLevelDescription'
// và đã được chuyển vào trong component để có quyền truy cập 'courseLevelOptions'
// (hoặc bạn có thể truyền 'courseLevelOptions' vào làm tham số nếu muốn giữ nó bên ngoài)
// Tuy nhiên, tôi đã chuyển nó thành một hàm bên trong component để đơn giản.