import React, { useState, useEffect } from 'react';
import StudentHeader from '../../components/header/StudentHeader';
import StudentSideBar from '../../components/sidebar/StudentSideBar';
import { FiBook, FiSearch, FiPlay, FiVolume2 } from 'react-icons/fi';

interface VocabularyItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  category: string;
  example: string;
}

const VocabularyPage: React.FC = () => {
  const [vocabularies, setVocabularies] = useState<VocabularyItem[]>([]);
  const [filteredVocabularies, setFilteredVocabularies] = useState<VocabularyItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data
  useEffect(() => {
    const mockVocabularies: VocabularyItem[] = [
      {
        id: '1',
        word: 'こんにちは',
        reading: 'konnichiwa',
        meaning: 'Xin chào (chào buổi chiều)',
        level: 'N5',
        category: 'Chào hỏi',
        example: 'こんにちは、田中さん。'
      },
      {
        id: '2',
        word: 'ありがとう',
        reading: 'arigatou',
        meaning: 'Cảm ơn',
        level: 'N5',
        category: 'Lịch sự',
        example: 'ありがとうございます。'
      },
      {
        id: '3',
        word: '勉強',
        reading: 'benkyou',
        meaning: 'Học tập, nghiên cứu',
        level: 'N4',
        category: 'Học tập',
        example: '日本語を勉強しています。'
      },
      {
        id: '4',
        word: '大学',
        reading: 'daigaku',
        meaning: 'Đại học',
        level: 'N4',
        category: 'Giáo dục',
        example: '東京大学に行きます。'
      },
      {
        id: '5',
        word: '経済',
        reading: 'keizai',
        meaning: 'Kinh tế',
        level: 'N3',
        category: 'Kinh tế',
        example: '日本経済について勉強します。'
      }
    ];

    setVocabularies(mockVocabularies);
    setFilteredVocabularies(mockVocabularies);
    setIsLoading(false);
  }, []);

  // Filter vocabularies
  useEffect(() => {
    let filtered = vocabularies;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reading.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(item => item.level === selectedLevel);
    }

    setFilteredVocabularies(filtered);
  }, [searchTerm, selectedLevel, vocabularies]);

  const handlePlayAudio = (word: string) => {
    // Mock audio play
    console.log(`Playing audio for: ${word}`);
    // In real implementation, this would play the audio
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'N5': 'bg-green-100 text-green-800',
      'N4': 'bg-blue-100 text-blue-800',
      'N3': 'bg-yellow-100 text-yellow-800',
      'N2': 'bg-orange-100 text-orange-800',
      'N1': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <div className="flex">
          <StudentSideBar />
          <div className="flex-1 p-8">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      
      <div className="flex">
        <StudentSideBar />
        
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FiBook className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Học từ vựng</h1>
                <p className="text-gray-600">Trau dồi vốn từ vựng tiếng Nhật</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm từ vựng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Level Filter */}
              <div className="lg:w-48">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Tất cả cấp độ</option>
                  <option value="N5">N5</option>
                  <option value="N4">N4</option>
                  <option value="N3">N3</option>
                  <option value="N2">N2</option>
                  <option value="N1">N1</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vocabulary List */}
          <div className="grid gap-6">
            {filteredVocabularies.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{item.word}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(item.level)}`}>
                        {item.level}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{item.reading}</p>
                    <p className="text-gray-800 font-medium mb-3">{item.meaning}</p>
                    <p className="text-sm text-gray-500 mb-2">Danh mục: {item.category}</p>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Ví dụ:</span> {item.example}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handlePlayAudio(item.word)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Phát âm"
                    >
                      <FiVolume2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePlayAudio(item.word)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Nghe audio"
                    >
                      <FiPlay className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredVocabularies.length === 0 && (
            <div className="text-center py-12">
              <FiBook className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy từ vựng</h3>
              <p className="text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyPage; 