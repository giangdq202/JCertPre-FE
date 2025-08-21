import React, { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaArrowLeft, FaCog, FaChevronDown, FaChevronRight, FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { 
  getAllTestTemplateTypes, 
  createTestTemplateType, 
  updateTestTemplateType, 
  deleteTestTemplateType, 
  updateTestTemplateTypeIsActive,
  verifyTestTemplateType,
  TestTemplateTypeDto,
  CreateTestTemplateTypeDto,
  UpdateTestTemplateTypeDto,
  CourseLevel,
  TestType
} from "../../services/testTemplateTypeService";
import {
  getAllByTypeId,
  createTestTemplate,
  updateTestTemplate,
  deleteTestTemplate,
  TestTemplateDto,
  CreateTestTemplateDto,
  UpdateTestTemplateDto
} from "../../services/testTemplateService";
import {
  getAllByTemplateId,
  createTestTemplateConfig,
  updateTestTemplateConfig,
  deleteTestTemplateConfig,
  TestTemplateConfigDto,
  CreateTestTemplateConfigDto,
  UpdateTestTemplateConfigDto,
  SubContentDto
} from "../../services/testTemplateConfigService";
import { getAllSubContents } from "../../services/subContentService";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";
import Modal from "../../components/modals/Modal";

const TestTemplateTypeManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useAuth();

  // Helper function to convert CourseLevel enum to string
  const getCourseLevelString = (courseLevel: CourseLevel): string => {
    const levelMap = {
      [CourseLevel.N5]: "N5",
      [CourseLevel.N4]: "N4", 
      [CourseLevel.N3]: "N3",
      [CourseLevel.N2]: "N2",
      [CourseLevel.N1]: "N1"
    };
    return levelMap[courseLevel];
  };

  const [templateTypes, setTemplateTypes] = useState<TestTemplateTypeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TestTemplateTypeDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Expanded state for each template type
  const [expandedTemplateTypes, setExpandedTemplateTypes] = useState<Set<string>>(new Set());
  const [templatesByType, setTemplatesByType] = useState<{[key: string]: TestTemplateDto[]}>({}); 
  const [loadingTemplatesByType, setLoadingTemplatesByType] = useState<{[key: string]: boolean}>({});

  // Expanded state for each template (for configs)
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());
  const [configsByTemplate, setConfigsByTemplate] = useState<{[key: string]: TestTemplateConfigDto[]}>({}); 
  const [loadingConfigsByTemplate, setLoadingConfigsByTemplate] = useState<{[key: string]: boolean}>({});

  // Template management states
  const [selectedTemplateType, setSelectedTemplateType] = useState<TestTemplateTypeDto | null>(null);
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState(false);
  const [isEditTemplateModalOpen, setIsEditTemplateModalOpen] = useState(false);
  const [editingTemplateTemplate, setEditingTemplateTemplate] = useState<TestTemplateDto | null>(null);

  // Template config management states
  const [selectedTemplate, setSelectedTemplate] = useState<TestTemplateDto | null>(null);
  const [subContents, setSubContents] = useState<SubContentDto[]>([]);
  const [isCreateConfigModalOpen, setIsCreateConfigModalOpen] = useState(false);
  const [isEditConfigModalOpen, setIsEditConfigModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<TestTemplateConfigDto | null>(null);

  const [createForm, setCreateForm] = useState<CreateTestTemplateTypeDto>({
    userId: "",
    typeName: "",
    courseLevel: CourseLevel.N5,
    testType: TestType.JLPTAuto,
    description: "",
    totalTestScore: 100,
    totalPassPercentage: 70
  });

  const [editForm, setEditForm] = useState<UpdateTestTemplateTypeDto>({
    typeName: "",
    courseLevel: CourseLevel.N5,
    testType: TestType.JLPTAuto,
    description: "",
    isActive: false,
    totalTestScore: 100,
    totalPassPercentage: 70
  });

  // Template forms
  const [createTemplateForm, setCreateTemplateForm] = useState<CreateTestTemplateDto>({
    testTemplateTypeId: "",
    templateName: "",
    durationMinutes: 180,
    totalScore: 100,
    toPassPercentage: 70,
    sequence: 1
  });

  const [editTemplateForm, setEditTemplateForm] = useState<UpdateTestTemplateDto>({
    templateName: "",
    durationMinutes: 180,
    totalScore: 100,
    toPassPercentage: 70,
    sequence: 1
  });

  // Config forms
  const [createConfigForm, setCreateConfigForm] = useState<CreateTestTemplateConfigDto>({
    subContentId: "",
    questionCount: 1,
    pointPerQuestion: 1,
    totalPoints: 1,
    sequence: 1
  });

  const [editConfigForm, setEditConfigForm] = useState<UpdateTestTemplateConfigDto>({
    questionCount: 1,
    pointPerQuestion: 1,
    totalPoints: 1,
    sequence: 1
  });

  useEffect(() => {
    if (userInfo?.id) {
      loadTemplateTypes();
    }
  }, [userInfo]);

  // Auto clear success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadTemplateTypes = async () => {
    try {
      setLoading(true);
      const response = await getAllTestTemplateTypes({ pageSize: 100 });
      setTemplateTypes(response.items);
    } catch (error) {
      console.error("Failed to load template types:", error);
      setError("Không thể tải danh sách cấu trúc đề thi");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo?.id) return;

    setSubmitting(true);
    try {
      const formData = {
        ...createForm,
        userId: userInfo.id
      };
      await createTestTemplateType(formData);
      setIsCreateModalOpen(false);
      setCreateForm({
        userId: "",
        typeName: "",
        courseLevel: CourseLevel.N5,
        testType: TestType.JLPTAuto,
        description: "",
        totalTestScore: 100,
        totalPassPercentage: 70
      });
      await loadTemplateTypes();
    } catch (error) {
      console.error("Failed to create template type:", error);
      setError("Không thể tạo cấu trúc đề thi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setSubmitting(true);
    try {
      await updateTestTemplateType(editingTemplate.testTemplateTypeId, editForm);
      setIsEditModalOpen(false);
      setEditingTemplate(null);
      await loadTemplateTypes();
    } catch (error) {
      console.error("Failed to update template type:", error);
      setError("Không thể cập nhật cấu trúc đề thi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (templateTypeId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cấu trúc đề thi này?")) return;

    try {
      await deleteTestTemplateType(templateTypeId);
      await loadTemplateTypes();
    } catch (error) {
      console.error("Failed to delete template type:", error);
      setError("Không thể xóa cấu trúc đề thi");
    }
  };

  const handleToggleActive = async (templateTypeId: string, currentActive: boolean) => {
    try {
      await updateTestTemplateTypeIsActive(templateTypeId, !currentActive);
      await loadTemplateTypes();
    } catch (error: any) {
      console.error("Failed to toggle template type active status:", error);
      
      // Handle specific error messages
      if (error?.response?.data?.errorCode === "NOT_VERIFIED") {
        setError("Không thể kích hoạt: Cấu trúc đề thi chưa được duyệt.");
      } else if (error?.response?.data?.errorCode === "NO_TEST_TEMPLATE") {
        setError("Không thể kích hoạt: Không có phần thi nào thuộc cấu trúc này.");
      } else if (error?.response?.data?.errorCode === "NO_TEST_TEMPLATE_CONFIG") {
        setError("Không thể kích hoạt: Không có cấu hình câu hỏi nào thuộc phần thi của cấu trúc này.");
      } else {
        setError("Không thể cập nhật trạng thái cấu trúc đề thi");
      }
    }
  };

  const handleVerify = async (templateTypeId: string) => {
    if (!userInfo?.id) {
      setError("Không thể xác định thông tin người dùng");
      return;
    }

    try {
      await verifyTestTemplateType(templateTypeId, userInfo.id);
      await loadTemplateTypes();
      setSuccess("Đã duyệt cấu trúc đề thi thành công");
    } catch (error: any) {
      console.error("Failed to verify template type:", error);
      
      if (error?.response?.data?.errorCode === "SELF_VERIFY_NOT_ALLOWED") {
        setError("Không thể tự duyệt cấu trúc đề thi do chính mình tạo.");
      } else {
        setError("Không thể duyệt cấu trúc đề thi");
      }
    }
  };

  const openEditModal = (template: TestTemplateTypeDto) => {
    setEditingTemplate(template);
    setEditForm({
      typeName: template.typeName,
      courseLevel: template.courseLevel,
      testType: template.testType,
      description: template.description,
      isActive: template.isActive,
      totalTestScore: template.totalTestScore,
      totalPassPercentage: template.totalPassPercentage
    });
    setIsEditModalOpen(true);
  };

  // Template management functions
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateType) return;

    setSubmitting(true);
    try {
      const formData = {
        ...createTemplateForm,
        testTemplateTypeId: selectedTemplateType.testTemplateTypeId
      };
      await createTestTemplate(formData);
      setIsCreateTemplateModalOpen(false);
      setCreateTemplateForm({
        testTemplateTypeId: "",
        templateName: "",
        durationMinutes: 180,
        totalScore: 100,
        toPassPercentage: 70,
        sequence: 1
      });
      
      // Update dropdown templates
      if (expandedTemplateTypes.has(selectedTemplateType.testTemplateTypeId)) {
        await loadTemplatesForType(selectedTemplateType);
      }
    } catch (error: any) {
      console.error("Failed to create template:", error);
      if (error?.response?.data?.errorCode === "TYPE_ACTIVE") {
        setError("Không thể tạo phần thi khi cấu trúc đề thi đã được kích hoạt");
      } else {
        setError("Không thể tạo phần thi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplateTemplate || !selectedTemplateType) return;

    setSubmitting(true);
    try {
      await updateTestTemplate(editingTemplateTemplate.templateId, editTemplateForm);
      setIsEditTemplateModalOpen(false);
      setEditingTemplateTemplate(null);
      
      // Update dropdown templates
      if (expandedTemplateTypes.has(selectedTemplateType.testTemplateTypeId)) {
        await loadTemplatesForType(selectedTemplateType);
      }
    } catch (error) {
      console.error("Failed to update template:", error);
      setError("Không thể cập nhật phần thi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phần thi này?") || !selectedTemplateType) return;

    try {
      await deleteTestTemplate(templateId);
      
      // Update dropdown templates
      if (expandedTemplateTypes.has(selectedTemplateType.testTemplateTypeId)) {
        await loadTemplatesForType(selectedTemplateType);
      }
    } catch (error) {
      console.error("Failed to delete template:", error);
      setError("Không thể xóa phần thi");
    }
  };

  // Toggle expand/collapse for template type
  const toggleTemplateTypeExpand = async (templateType: TestTemplateTypeDto) => {
    const templateTypeId = templateType.testTemplateTypeId;
    const isCurrentlyExpanded = expandedTemplateTypes.has(templateTypeId);
    
    if (isCurrentlyExpanded) {
      // Collapse
      const newExpanded = new Set(expandedTemplateTypes);
      newExpanded.delete(templateTypeId);
      setExpandedTemplateTypes(newExpanded);
    } else {
      // Expand - load templates if not already loaded
      const newExpanded = new Set(expandedTemplateTypes);
      newExpanded.add(templateTypeId);
      setExpandedTemplateTypes(newExpanded);
      
      if (!templatesByType[templateTypeId]) {
        await loadTemplatesForType(templateType);
      }
    }
  };

  // Load templates for a specific template type
  const loadTemplatesForType = async (templateType: TestTemplateTypeDto) => {
    const templateTypeId = templateType.testTemplateTypeId;
    setLoadingTemplatesByType(prev => ({ ...prev, [templateTypeId]: true }));
    
    try {
      const templatesData = await getAllByTypeId(templateTypeId);
      setTemplatesByType(prev => ({ ...prev, [templateTypeId]: templatesData }));
    } catch (error) {
      console.error("Failed to load templates for type:", error);
      setError("Không thể tải danh sách phần thi");
    } finally {
      setLoadingTemplatesByType(prev => ({ ...prev, [templateTypeId]: false }));
    }
  };

  // Toggle expand/collapse for template (for configs)
  const toggleTemplateExpand = async (template: TestTemplateDto) => {
    const templateId = template.templateId;
    const isCurrentlyExpanded = expandedTemplates.has(templateId);
    
    if (isCurrentlyExpanded) {
      // Collapse
      const newExpanded = new Set(expandedTemplates);
      newExpanded.delete(templateId);
      setExpandedTemplates(newExpanded);
    } else {
      // Expand - load configs if not already loaded
      const newExpanded = new Set(expandedTemplates);
      newExpanded.add(templateId);
      setExpandedTemplates(newExpanded);
      
      if (!configsByTemplate[templateId]) {
        await loadConfigsForTemplate(template);
      }
    }
  };

  // Load configs for a specific template
  const loadConfigsForTemplate = async (template: TestTemplateDto) => {
    const templateId = template.templateId;
    setLoadingConfigsByTemplate(prev => ({ ...prev, [templateId]: true }));
    
    try {
      const configsData = await getAllByTemplateId(templateId);
      setConfigsByTemplate(prev => ({ ...prev, [templateId]: configsData }));
    } catch (error) {
      console.error("Failed to load configs for template:", error);
      setError("Không thể tải danh sách cấu hình câu hỏi");
    } finally {
      setLoadingConfigsByTemplate(prev => ({ ...prev, [templateId]: false }));
    }
  };

  const openEditTemplateModal = (template: TestTemplateDto) => {
    setEditingTemplateTemplate(template);
    setEditTemplateForm({
      templateName: template.templateName,
      durationMinutes: template.durationMinutes,
      totalScore: template.totalScore,
      toPassPercentage: template.toPassPercentage,
      sequence: template.sequence
    });
    setIsEditTemplateModalOpen(true);
  };

  // Template config management functions
  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) return;

    setSubmitting(true);
    try {
      const response = await createTestTemplateConfig(selectedTemplate.templateId, createConfigForm);
      
      // Update configs in the nested dropdown state
      setConfigsByTemplate(prev => ({
        ...prev,
        [selectedTemplate.templateId]: [...(prev[selectedTemplate.templateId] || []), response]
      }));
      
      setIsCreateConfigModalOpen(false);
      setCreateConfigForm({
        subContentId: "",
        questionCount: 1,
        pointPerQuestion: 1,
        totalPoints: 1,
        sequence: 1
      });
    } catch (error: any) {
      console.error("Failed to create config:", error);
      if (error?.response?.data?.errorCode === "TYPE_ACTIVE") {
        setError("Không thể tạo cấu hình câu hỏi khi cấu trúc đề thi đã được kích hoạt");
      } else {
        setError("Không thể tạo cấu hình câu hỏi");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConfig || !selectedTemplate) return;

    setSubmitting(true);
    try {
      const response = await updateTestTemplateConfig(editingConfig.configId, editConfigForm);
      
      // Update configs in the nested dropdown state
      setConfigsByTemplate(prev => ({
        ...prev,
        [selectedTemplate.templateId]: prev[selectedTemplate.templateId]?.map(config => 
          config.configId === editingConfig.configId ? response : config
        ) || []
      }));
      
      setIsEditConfigModalOpen(false);
      setEditingConfig(null);
    } catch (error) {
      console.error("Failed to update config:", error);
      setError("Không thể cập nhật cấu hình câu hỏi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cấu hình câu hỏi này?") || !selectedTemplate) return;

    try {
      await deleteTestTemplateConfig(configId);
      
      // Update configs in the nested dropdown state
      setConfigsByTemplate(prev => ({
        ...prev,
        [selectedTemplate.templateId]: prev[selectedTemplate.templateId]?.filter(config => 
          config.configId !== configId
        ) || []
      }));
    } catch (error) {
      console.error("Failed to delete config:", error);
      setError("Không thể xóa cấu hình câu hỏi");
    }
  };

  const openEditConfigModal = (config: TestTemplateConfigDto) => {
    setEditingConfig(config);
    setEditConfigForm({
      questionCount: config.questionCount,
      pointPerQuestion: config.pointPerQuestion,
      totalPoints: config.totalPoints,
      sequence: config.sequence
    });
    setIsEditConfigModalOpen(true);
  };

  const getCourseLevelLabel = (level: CourseLevel) => {
    const labels = {
      [CourseLevel.N5]: "N5",
      [CourseLevel.N4]: "N4", 
      [CourseLevel.N3]: "N3",
      [CourseLevel.N2]: "N2",
      [CourseLevel.N1]: "N1"
    };
    return labels[level] || "Không xác định";
  };

  const getTestTypeLabel = (type: TestType) => {
    const labels = {
      [TestType.JLPTAuto]: "JLPT Tự động",
      [TestType.EntryAuto]: "Đầu vào Tự động", 
      [TestType.CustomManual]: "Tùy chỉnh Thủ công",
      [TestType.CustomAuto]: "Tùy chỉnh Tự động"
    };
    return labels[type] || "Không xác định";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <button
              onClick={() => navigate(paths.staff_home)}
              className="flex items-center text-gray-600 hover:text-green-700 mb-2"
            >
              <FaArrowLeft className="mr-2" />
              Quay lại trang chủ
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý Cấu trúc đề thi</h1>
            <p className="text-gray-600 mt-2">
              Quy định các cấu trúc cho các loại đề thi khác nhau
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Quy trình thiết lập:</h3>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Tạo <strong>Cấu trúc đề thi</strong> (VD: JLPT N3)</li>
                <li>Tạo các<strong>phần thi</strong> cho đề thi đó (VD: Phần nghe, Phần Đọc hiểu,...)</li>
                <li>Cấu hình <strong>các dạng câu hỏi</strong> cho mỗi Phần thi</li>
                <li><strong>Kích hoạt</strong> Cấu trúc đề thi để hệ thống có thể sử dụng</li>
              </ol>
              <p className="text-xs text-blue-600 mt-2">
                ⚠️ <strong>Lưu ý:</strong> Sau khi kích hoạt Cấu trúc đề thi, không thể chỉnh sửa.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
          >
            <FaPlus className="text-sm" />
            Tạo Cấu trúc đề thi
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {/* Template Types List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Danh sách Cấu trúc đề thi ({templateTypes.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên Cấu trúc đề thi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cấp độ khóa học
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại đề thi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm tối đa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ đỗ (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái duyệt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {templateTypes.map((template) => (
                  <Fragment key={template.testTemplateTypeId}>
                    {/* Main template type row */}
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleTemplateTypeExpand(template)}
                            className="mr-2 text-gray-400 hover:text-gray-600"
                            title={expandedTemplateTypes.has(template.testTemplateTypeId) ? "Thu gọn" : "Mở rộng"}
                          >
                            {expandedTemplateTypes.has(template.testTemplateTypeId) ? 
                              <FaChevronDown className="text-sm" /> : 
                              <FaChevronRight className="text-sm" />
                            }
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {template.typeName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {template.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {getCourseLevelLabel(template.courseLevel)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {getTestTypeLabel(template.testType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.totalTestScore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {template.totalPassPercentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {template.verifiedUserId ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaCheck className="mr-1" />
                              Đã duyệt
                            </span>
                            {template.verifiedByUserName && (
                              <span className="text-xs text-gray-500 mt-1">
                                Bởi: {template.verifiedByUserName}
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <FaExclamationTriangle className="mr-1" />
                              Chờ duyệt
                            </span>
                            {template.createdByUserName && (
                              <span className="text-xs text-gray-500 mt-1">
                                Tạo bởi: {template.createdByUserName}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          template.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {template.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          {/* Verify button - only show if not verified and not created by current user */}
                          {!template.verifiedUserId && template.userId !== userInfo?.id && (
                            <button
                              onClick={() => handleVerify(template.testTemplateTypeId)}
                              className="text-green-600 hover:text-green-900"
                              title="Duyệt cấu trúc đề thi"
                            >
                              <FaCheck className="text-sm" />
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(template)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(template.testTemplateTypeId, template.isActive)}
                            className={`${
                              template.isActive 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={template.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            {template.isActive ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                          </button>
                          <button
                            onClick={() => handleDelete(template.testTemplateTypeId)}
                            className="text-red-600 hover:text-red-900"
                            title="Xóa"
                          >
                            <FaTrash className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded templates section */}
                    {expandedTemplateTypes.has(template.testTemplateTypeId) && (
                      <tr>
                        <td colSpan={8} className="px-6 py-0 bg-gray-50">
                          <div className="py-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-lg font-medium text-gray-900">
                                Phần thi cho {template.typeName}
                              </h4>
                              <button
                                onClick={() => {
                                  setSelectedTemplateType(template);
                                  setIsCreateTemplateModalOpen(true);
                                }}
                                disabled={template.isActive}
                                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                                  template.isActive 
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                                title={template.isActive ? 'Không thể tạo phần thi khi cấu trúc đề thi đã được kích hoạt' : ''}
                              >
                                <FaPlus className="mr-2" />
                                Tạo phần thi mới
                              </button>
                            </div>

                            {loadingTemplatesByType[template.testTemplateTypeId] ? (
                              <div className="text-center py-4">
                                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <p className="mt-2 text-sm text-gray-500">Đang tải phần thi...</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {templatesByType[template.testTemplateTypeId]?.length > 0 ? (
                                  templatesByType[template.testTemplateTypeId].map((templateItem) => (
                                    <div key={templateItem.templateId} className="space-y-2">
                                      {/* Template item with expand/collapse */}
                                      <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center flex-1">
                                            <button
                                              onClick={() => toggleTemplateExpand(templateItem)}
                                              className="mr-2 text-gray-400 hover:text-gray-600"
                                              title={expandedTemplates.has(templateItem.templateId) ? "Thu gọn" : "Mở rộng"}
                                            >
                                              {expandedTemplates.has(templateItem.templateId) ? 
                                                <FaChevronDown className="text-sm" /> : 
                                                <FaChevronRight className="text-sm" />
                                              }
                                            </button>
                                            <div className="flex-1">
                                              <h5 className="font-medium text-gray-900">{templateItem.templateName}</h5>
                                              <div className="text-sm text-gray-500 mt-1">
                                                <span className="mr-4">Thời gian: {templateItem.durationMinutes} phút</span>
                                                <span className="mr-4">Điểm: {templateItem.totalScore}</span>
                                                <span className="mr-4">Tỷ lệ đỗ: {templateItem.toPassPercentage}%</span>
                                                <span>Thứ tự: {templateItem.sequence}</span>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <button
                                              onClick={() => openEditTemplateModal(templateItem)}
                                              disabled={template.isActive}
                                              className={`text-sm ${
                                                template.isActive 
                                                  ? 'text-gray-400 cursor-not-allowed' 
                                                  : 'text-blue-600 hover:text-blue-900'
                                              }`}
                                              title={template.isActive ? 'Không thể chỉnh sửa khi cấu trúc đề thi đã được kích hoạt' : 'Chỉnh sửa'}
                                            >
                                              <FaEdit />
                                            </button>
                                            <button
                                              onClick={() => handleDeleteTemplate(templateItem.templateId)}
                                              disabled={template.isActive}
                                              className={`text-sm ${
                                                template.isActive 
                                                  ? 'text-gray-400 cursor-not-allowed' 
                                                  : 'text-red-600 hover:text-red-900'
                                              }`}
                                              title={template.isActive ? 'Không thể xóa khi cấu trúc đề thi đã được kích hoạt' : 'Xóa'}
                                            >
                                              <FaTrash />
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Expanded configs section */}
                                      {expandedTemplates.has(templateItem.templateId) && (
                                        <div className="ml-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                          <div className="flex items-center justify-between mb-3">
                                            <h6 className="font-medium text-gray-800">
                                              Cấu hình câu hỏi cho {templateItem.templateName}
                                            </h6>
                                            <button
                                              onClick={async () => {
                                                setSelectedTemplate(templateItem);
                                                
                                                // Load subContents if not already loaded
                                                if (subContents.length === 0) {
                                                  try {
                                                    const subContentList = await getAllSubContents(undefined, undefined, undefined, undefined, 1, 100);
                                                    setSubContents(subContentList.items);
                                                  } catch (error) {
                                                    console.error("Failed to load subContents:", error);
                                                  }
                                                }
                                                
                                                setIsCreateConfigModalOpen(true);
                                              }}
                                              disabled={template.isActive}
                                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                                                template.isActive 
                                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                                  : 'bg-green-600 text-white hover:bg-green-700'
                                              }`}
                                              title={template.isActive ? 'Không thể tạo cấu hình câu hỏi khi cấu trúc đề thi đã được kích hoạt' : ''}
                                            >
                                              <FaPlus className="mr-1" />
                                              Tạo cấu hình mới
                                            </button>
                                          </div>

                                          {loadingConfigsByTemplate[templateItem.templateId] ? (
                                            <div className="text-center py-2">
                                              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                              <p className="mt-1 text-xs text-gray-500">Đang tải cấu hình...</p>
                                            </div>
                                          ) : (
                                            <div className="space-y-2">
                                              {configsByTemplate[templateItem.templateId]?.length > 0 ? (
                                                configsByTemplate[templateItem.templateId].map((config) => (
                                                  <div
                                                    key={config.configId}
                                                    className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 hover:border-gray-300"
                                                  >
                                                    <div className="flex-1">
                                                      <div className="text-sm font-medium text-gray-900">
                                                        {config.subContent?.subContentNameDescription || 'N/A'}
                                                      </div>
                                                      <div className="text-xs text-gray-500 mt-1">
                                                        <span className="mr-3">Số câu: {config.questionCount}</span>
                                                        <span className="mr-3">Điểm/câu: {config.pointPerQuestion}</span>
                                                        <span className="mr-3">Tổng điểm: {config.totalPoints}</span>
                                                        <span>Thứ tự: {config.sequence}</span>
                                                      </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                      <button
                                                        onClick={() => openEditConfigModal(config)}
                                                        disabled={template.isActive}
                                                        className={`text-xs ${
                                                          template.isActive 
                                                            ? 'text-gray-400 cursor-not-allowed' 
                                                            : 'text-blue-600 hover:text-blue-900'
                                                        }`}
                                                        title={template.isActive ? 'Không thể chỉnh sửa khi cấu trúc đề thi đã được kích hoạt' : 'Chỉnh sửa'}
                                                      >
                                                        <FaEdit />
                                                      </button>
                                                      <button
                                                        onClick={() => handleDeleteConfig(config.configId)}
                                                        disabled={template.isActive}
                                                        className={`text-xs ${
                                                          template.isActive 
                                                            ? 'text-gray-400 cursor-not-allowed' 
                                                            : 'text-red-600 hover:text-red-900'
                                                        }`}
                                                        title={template.isActive ? 'Không thể xóa khi cấu trúc đề thi đã được kích hoạt' : 'Xóa'}
                                                      >
                                                        <FaTrash />
                                                      </button>
                                                    </div>
                                                  </div>
                                                ))
                                              ) : (
                                                <div className="text-center py-4 text-gray-500">
                                                  <FaCog className="mx-auto h-6 w-6 text-gray-400 mb-1" />
                                                  <p className="text-xs">Chưa có cấu hình câu hỏi nào</p>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-8 text-gray-500">
                                    <FaCog className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p>Chưa có phần thi nào</p>
                                    <p className="text-sm">Tạo phần thi đầu tiên để bắt đầu</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Cấu trúc đề thi mới"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Cấu trúc đề thi *
            </label>
            <input
              type="text"
              value={createForm.typeName}
              onChange={(e) => setCreateForm({...createForm, typeName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cấp độ khóa học *
              </label>
              <select
                value={createForm.courseLevel}
                onChange={(e) => setCreateForm({...createForm, courseLevel: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value={CourseLevel.N5}>N5</option>
                <option value={CourseLevel.N4}>N4</option>
                <option value={CourseLevel.N3}>N3</option>
                <option value={CourseLevel.N2}>N2</option>
                <option value={CourseLevel.N1}>N1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại đề thi *
              </label>
              <select
                value={createForm.testType}
                onChange={(e) => setCreateForm({...createForm, testType: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value={TestType.JLPTAuto}>JLPT Auto</option>
                <option value={TestType.EntryAuto}>Entry Auto</option>
                <option value={TestType.CustomManual}>Custom Manual</option>
                <option value={TestType.CustomAuto}>Custom Auto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tối đa *
              </label>
              <input
                type="number"
                value={createForm.totalTestScore}
                onChange={(e) => setCreateForm({...createForm, totalTestScore: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỷ lệ đỗ (%) *
              </label>
              <input
                type="number"
                value={createForm.totalPassPercentage}
                onChange={(e) => setCreateForm({...createForm, totalPassPercentage: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={0}
                max={100}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {submitting ? 'Đang tạo...' : 'Tạo Cấu trúc đề thi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa Cấu trúc đề thi"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Cấu trúc đề thi *
            </label>
            <input
              type="text"
              value={editForm.typeName}
              onChange={(e) => setEditForm({...editForm, typeName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cấp độ khóa học *
              </label>
              <select
                value={editForm.courseLevel}
                onChange={(e) => setEditForm({...editForm, courseLevel: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value={CourseLevel.N5}>N5</option>
                <option value={CourseLevel.N4}>N4</option>
                <option value={CourseLevel.N3}>N3</option>
                <option value={CourseLevel.N2}>N2</option>
                <option value={CourseLevel.N1}>N1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại đề thi *
              </label>
              <select
                value={editForm.testType}
                onChange={(e) => setEditForm({...editForm, testType: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value={TestType.JLPTAuto}>JLPT Auto</option>
                <option value={TestType.EntryAuto}>Entry Auto</option>
                <option value={TestType.CustomManual}>Custom Manual</option>
                <option value={TestType.CustomAuto}>Custom Auto</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({...editForm, description: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tối đa *
              </label>
              <input
                type="number"
                value={editForm.totalTestScore}
                onChange={(e) => setEditForm({...editForm, totalTestScore: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỷ lệ đỗ (%) *
              </label>
              <input
                type="number"
                value={editForm.totalPassPercentage}
                onChange={(e) => setEditForm({...editForm, totalPassPercentage: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={0}
                max={100}
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={editForm.isActive}
              onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
              Hoạt động
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {submitting ? 'Đang cập nhật...' : 'Cập nhật Cấu trúc đề thi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Template Modal */}
      <Modal
        isOpen={isCreateTemplateModalOpen}
        onClose={() => setIsCreateTemplateModalOpen(false)}
        title="Tạo Phần thi mới"
      >
        <form onSubmit={handleCreateTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Phần thi *
            </label>
            <input
              type="text"
              value={createTemplateForm.templateName}
              onChange={(e) => setCreateTemplateForm({...createTemplateForm, templateName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian (phút) *
              </label>
              <input
                type="number"
                value={createTemplateForm.durationMinutes}
                onChange={(e) => setCreateTemplateForm({...createTemplateForm, durationMinutes: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tối đa *
              </label>
              <input
                type="number"
                value={createTemplateForm.totalScore}
                onChange={(e) => setCreateTemplateForm({...createTemplateForm, totalScore: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỷ lệ đỗ (%) *
              </label>
              <input
                type="number"
                value={createTemplateForm.toPassPercentage}
                onChange={(e) => setCreateTemplateForm({...createTemplateForm, toPassPercentage: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={0}
                max={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự *
              </label>
              <input
                type="number"
                value={createTemplateForm.sequence}
                onChange={(e) => setCreateTemplateForm({...createTemplateForm, sequence: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateTemplateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Đang tạo...' : 'Tạo Phần thi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Template Modal */}
      <Modal
        isOpen={isEditTemplateModalOpen}
        onClose={() => setIsEditTemplateModalOpen(false)}
        title="Chỉnh sửa Phần thi"
      >
        <form onSubmit={handleEditTemplate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên Phần thi *
            </label>
            <input
              type="text"
              value={editTemplateForm.templateName}
              onChange={(e) => setEditTemplateForm({...editTemplateForm, templateName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian (phút) *
              </label>
              <input
                type="number"
                value={editTemplateForm.durationMinutes}
                onChange={(e) => setEditTemplateForm({...editTemplateForm, durationMinutes: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm tối đa *
              </label>
              <input
                type="number"
                value={editTemplateForm.totalScore}
                onChange={(e) => setEditTemplateForm({...editTemplateForm, totalScore: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỷ lệ đỗ (%) *
              </label>
              <input
                type="number"
                value={editTemplateForm.toPassPercentage}
                onChange={(e) => setEditTemplateForm({...editTemplateForm, toPassPercentage: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={0}
                max={100}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự *
              </label>
              <input
                type="number"
                value={editTemplateForm.sequence}
                onChange={(e) => setEditTemplateForm({...editTemplateForm, sequence: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditTemplateModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? 'Đang cập nhật...' : 'Cập nhật Phần thi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Config Modal */}
      <Modal
        isOpen={isCreateConfigModalOpen}
        onClose={() => setIsCreateConfigModalOpen(false)}
        title="Tạo Cấu hình câu hỏi mới"
      >
        <form onSubmit={handleCreateConfig} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nội dung con *
            </label>
            <select
              value={createConfigForm.subContentId}
              onChange={(e) => setCreateConfigForm({...createConfigForm, subContentId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            >
              <option value="">Chọn nội dung con</option>
              {subContents
                .filter((subContent) => {
                  // Filter by template type level when creating config for a specific template
                  if (selectedTemplate) {
                    // Find the template type for the selected template
                    const templateType = templateTypes.find(tt => tt.testTemplateTypeId === selectedTemplate.testTemplateTypeId);
                    if (templateType) {
                      const templateLevelString = getCourseLevelString(templateType.courseLevel);
                      return subContent.level === templateLevelString;
                    }
                  }
                  // Fallback to selectedTemplateType if available (old flow)
                  if (selectedTemplateType) {
                    const templateLevelString = getCourseLevelString(selectedTemplateType.courseLevel);
                    return subContent.level === templateLevelString;
                  }
                  return true;
                })
                .map((subContent) => (
                  <option key={subContent.subContentId} value={subContent.subContentId}>
                    {subContent.subContentNameDescription} - {subContent.contentNameDescription} ({subContent.levelDescription})
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số câu hỏi *
              </label>
              <input
                type="number"
                value={createConfigForm.questionCount}
                onChange={(e) => {
                  const questionCount = e.target.value ? parseInt(e.target.value) : 0;
                  const totalPoints = questionCount * createConfigForm.pointPerQuestion;
                  setCreateConfigForm({
                    ...createConfigForm, 
                    questionCount, 
                    totalPoints
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm/câu *
              </label>
              <input
                type="number"
                value={createConfigForm.pointPerQuestion}
                onChange={(e) => {
                  const pointPerQuestion = e.target.value ? parseInt(e.target.value) : 0;
                  const totalPoints = createConfigForm.questionCount * pointPerQuestion;
                  setCreateConfigForm({
                    ...createConfigForm, 
                    pointPerQuestion, 
                    totalPoints
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tổng điểm *
              </label>
              <input
                type="number"
                value={createConfigForm.totalPoints}
                onChange={(e) => setCreateConfigForm({...createConfigForm, totalPoints: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                min={1}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự *
              </label>
              <input
                type="number"
                value={createConfigForm.sequence}
                onChange={(e) => setCreateConfigForm({...createConfigForm, sequence: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsCreateConfigModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {submitting ? 'Đang tạo...' : 'Tạo Cấu hình câu hỏi'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Config Modal */}
      <Modal
        isOpen={isEditConfigModalOpen}
        onClose={() => setIsEditConfigModalOpen(false)}
        title="Chỉnh sửa Cấu hình câu hỏi"
      >
        <form onSubmit={handleEditConfig} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số câu hỏi *
              </label>
              <input
                type="number"
                value={editConfigForm.questionCount}
                onChange={(e) => {
                  const questionCount = e.target.value ? parseInt(e.target.value) : 0;
                  const totalPoints = questionCount * (editConfigForm.pointPerQuestion || 1);
                  setEditConfigForm({
                    ...editConfigForm, 
                    questionCount, 
                    totalPoints
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm/câu *
              </label>
              <input
                type="number"
                value={editConfigForm.pointPerQuestion}
                onChange={(e) => {
                  const pointPerQuestion = e.target.value ? parseInt(e.target.value) : 0;
                  const totalPoints = (editConfigForm.questionCount || 1) * pointPerQuestion;
                  setEditConfigForm({
                    ...editConfigForm, 
                    pointPerQuestion, 
                    totalPoints
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tổng điểm *
              </label>
              <input
                type="number"
                value={editConfigForm.totalPoints}
                onChange={(e) => setEditConfigForm({...editConfigForm, totalPoints: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-50"
                min={1}
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thứ tự *
              </label>
              <input
                type="number"
                value={editConfigForm.sequence}
                onChange={(e) => setEditConfigForm({...editConfigForm, sequence: e.target.value ? parseInt(e.target.value) : 0})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min={1}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsEditConfigModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                submitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {submitting ? 'Đang cập nhật...' : 'Cập nhật Cấu hình câu hỏi'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TestTemplateTypeManagementPage; 