import React, { useState, useEffect } from 'react';
import { FaTimes, FaUser, FaGraduationCap, FaEdit, FaSave, FaTimes as FaCancel } from 'react-icons/fa';
import { useAuth } from '../../auth/AuthContext';
import { useNotification } from '../notifications';
import { 
  getStudentProfile, 
  updateStudentProfile, 
  StudentProfileDto,
  UpdateStudentProfileParams
} from '../../services/studentProfileService';
import { CourseLevel } from '../../services/testService';

interface ProfileManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  currentLevel: CourseLevel;
  learningGoals: CourseLevel;
}

const ProfileManagementModal: React.FC<ProfileManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { userInfo } = useAuth();
  const { success, error } = useNotification();
  
  const [profile, setProfile] = useState<StudentProfileDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState<ProfileData>({
    currentLevel: CourseLevel.N5,
    learningGoals: CourseLevel.N4
  });

  // Load profile data
  const loadProfile = async () => {
    if (!userInfo?.id) return;
    
    setLoading(true);
    try {
      const profileData = await getStudentProfile(userInfo.id);
      setProfile(profileData);
      
      if (profileData) {
        setEditData({
          currentLevel: (profileData.currentLevel as unknown as CourseLevel) || CourseLevel.N5,
          learningGoals: (profileData.learningGoals as unknown as CourseLevel) || CourseLevel.N4
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      error('Lỗi tải profile', 'Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  // Handle save profile
  const handleSave = async () => {
    if (!userInfo?.id || !profile) return;
    
    setSaving(true);
    try {
      const updateData = {
        currentLevel: editData.currentLevel.toString(),
        learningGoals: editData.learningGoals.toString()
      };
      
      const updateParams: UpdateStudentProfileParams = {
        userId: userInfo.id,
        ...updateData
      };
      
      await updateStudentProfile(updateParams);
      
      // Reload profile to get updated data
      await loadProfile();
      
      setEditing(false);
      success('Cập nhật thành công', 'Profile của bạn đã được cập nhật');
    } catch (err) {
      console.error('Failed to update profile:', err);
      error('Lỗi cập nhật', 'Không thể cập nhật profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    if (profile) {
      setEditData({
        currentLevel: (profile.currentLevel as unknown as CourseLevel) || CourseLevel.N5,
        learningGoals: (profile.learningGoals as unknown as CourseLevel) || CourseLevel.N4
      });
    }
    setEditing(false);
  };

  // Get level display name
  const getLevelDisplayName = (level: CourseLevel): string => {
    const names = {
      [CourseLevel.N5]: 'N5 - Sơ cấp',
      [CourseLevel.N4]: 'N4 - Sơ trung cấp', 
      [CourseLevel.N3]: 'N3 - Trung cấp',
      [CourseLevel.N2]: 'N2 - Trung cao cấp',
      [CourseLevel.N1]: 'N1 - Cao cấp'
    };
    return names[level] || level.toString();
  };

  // Get level color
  const getLevelColor = (level: CourseLevel): string => {
    const colors = {
      [CourseLevel.N5]: 'text-green-600 bg-green-50 border-green-200',
      [CourseLevel.N4]: 'text-blue-600 bg-blue-50 border-blue-200',
      [CourseLevel.N3]: 'text-purple-600 bg-purple-50 border-purple-200',
      [CourseLevel.N2]: 'text-orange-600 bg-orange-50 border-orange-200',
      [CourseLevel.N1]: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[level] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  // Load profile on mount
  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen, userInfo?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUser className="text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Thông tin học tập</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải thông tin...</p>
            </div>
          ) : profile ? (
            <div className="space-y-6">
              {/* Current Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cấp độ hiện tại
                </label>
                {editing ? (
                  <select
                    value={editData.currentLevel}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      currentLevel: e.target.value as unknown as CourseLevel
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(CourseLevel).map(level => (
                      <option key={level} value={level}>
                        {getLevelDisplayName(level as CourseLevel)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg border font-medium ${getLevelColor(profile.currentLevel as unknown as CourseLevel)}`}>
                    <FaGraduationCap className="mr-2" />
                    {getLevelDisplayName(profile.currentLevel as unknown as CourseLevel)}
                  </div>
                )}
              </div>

              {/* Learning Goal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mục tiêu học tập
                </label>
                {editing ? (
                  <select
                    value={editData.learningGoals}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      learningGoals: e.target.value as unknown as CourseLevel
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.values(CourseLevel).map(level => (
                      <option key={level} value={level}>
                        {getLevelDisplayName(level as CourseLevel)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={`inline-flex items-center px-3 py-2 rounded-lg border font-medium ${getLevelColor(profile.learningGoals as unknown as CourseLevel)}`}>
                    <FaGraduationCap className="mr-2" />
                    {getLevelDisplayName(profile.learningGoals as unknown as CourseLevel)}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUser className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-600">Chưa có thông tin profile</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {profile && (
          <div className="flex items-center justify-end gap-3 p-6 border-t">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:text-gray-400"
                >
                  <FaCancel className="inline mr-2" />
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                  <FaSave className="inline mr-2" />
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaEdit className="inline mr-2" />
                Chỉnh sửa
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManagementModal;
