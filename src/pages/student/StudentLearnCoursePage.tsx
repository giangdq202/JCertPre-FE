import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonsByCourseId, LessonDto } from "../../services/lessonService";
import { getDocumentsByLessonId, DocumentDto } from "../../services/documentService";
import { getCourseById, CourseDto } from "../../services/courseService";
import StudentHeader from "../../components/header/StudentHeader";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import { FaChevronRight, FaFilePdf, FaDownload, FaVideo } from "react-icons/fa";

const StudentLearnCoursePage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<CourseDto | null>(null);
  const [lessons, setLessons] = useState<LessonDto[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [videoDoc, setVideoDoc] = useState<DocumentDto | null>(null);
  const [pdfDoc, setPdfDoc] = useState<DocumentDto | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!courseId) return;
    setLoadingLessons(true);
    getCourseById(courseId)
      .then(setCourse)
      .catch(() => setCourse(null));
    getLessonsByCourseId(courseId)
      .then((res) => {
        setLessons(res.items);
        if (res.items.length > 0) setSelectedLessonId(res.items[0].lessonId);
      })
      .finally(() => setLoadingLessons(false));
  }, [courseId]);

  useEffect(() => {
    if (!selectedLessonId) return;
    setLoadingDocs(true);
    getDocumentsByLessonId(selectedLessonId)
      .then((docs) => {
        setDocuments(docs);
        // Ưu tiên video đầu tiên nếu có
        const video = docs.find((d) => d.fileUrl.endsWith(".mp4"));
        setVideoDoc(video || null);
        // Ưu tiên pdf đầu tiên nếu có
        const pdf = docs.find((d) => d.fileUrl.endsWith(".pdf"));
        setPdfDoc(pdf || null);
      })
      .finally(() => setLoadingDocs(false));
  }, [selectedLessonId]);

  const handleLessonClick = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  const handleDocClick = (doc: DocumentDto) => {
    if (doc.fileUrl.endsWith(".pdf")) {
      setPdfDoc(doc);
    } else {
      window.open(doc.fileUrl, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 font-inter flex flex-col lg:flex-row">
      <StudentSideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <StudentHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-500 mb-4 flex items-center gap-2">
            <span className="hover:underline cursor-pointer" onClick={() => navigate(-1)}>Khóa học</span>
            <FaChevronRight className="inline mx-1" />
            <span className="font-semibold text-green-700">{course?.title || "..."}</span>
          </nav>
          <div className="flex flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedLessonId && lessons.find(l => l.lessonId === selectedLessonId)?.title}</h2>
              
              {/* Video player - ưu tiên hiển thị ở màn hình chính */}
              {videoDoc ? (
                <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Video bài học</h3>
                    <span className="text-sm text-gray-500">{videoDoc.documentName}</span>
                  </div>
                  <div className="relative w-full bg-black rounded-xl overflow-hidden">
                    <video
                      src={videoDoc.fileUrl}
                      controls
                      className="w-full h-auto"
                      style={{ minHeight: 400, maxHeight: '70vh' }}
                      autoPlay={false}
                      preload="metadata"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-xl p-8 text-center text-gray-500 mb-6">
                  <FaVideo className="mx-auto text-4xl text-gray-300 mb-4" />
                  <p>Không có video cho bài học này</p>
                </div>
              )}
            </div>
            {/* Sidebar lesson */}
            <aside className="w-80 min-w-[260px] bg-white rounded-2xl shadow-xl p-4 flex flex-col gap-2 h-fit sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Danh sách bài học</h3>
              {loadingLessons ? (
                <div className="text-center text-gray-500">Đang tải...</div>
              ) : (
                <ul className="flex flex-col gap-1">
                  {lessons.map((lesson) => (
                    <li key={lesson.lessonId}>
                      <button
                        className={`w-full text-left px-4 py-2 rounded-lg transition font-medium ${selectedLessonId === lesson.lessonId ? "bg-green-100 text-green-700" : "hover:bg-gray-100 text-gray-800"}`}
                        onClick={() => handleLessonClick(lesson.lessonId)}
                      >
                        {lesson.title}
                      </button>
                      {/* Dropdown tài liệu (ngoại trừ video chính) */}
                      {selectedLessonId === lesson.lessonId && documents.length > 0 && (
                        <ul className="ml-4 mt-2 flex flex-col gap-1">
                          {documents.filter(d => !d.fileUrl.endsWith(".mp4")).map((doc) => (
                            <li key={doc.documentId} className="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-2 flex-1">
                                {doc.fileUrl.endsWith(".pdf") ? <FaFilePdf className="text-red-500" /> : <FaDownload className="text-gray-500" />}
                                <span className="text-sm text-gray-700 truncate">
                                  {doc.documentName.startsWith("documents/") ? doc.documentName.replace("documents/", "") : doc.documentName}
                                </span>
                              </div>
                              <button
                                onClick={() => window.open(doc.fileUrl, '_blank')}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              >
                                <FaDownload className="text-xs" />
                                Tải
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLearnCoursePage; 