import React, { useState } from "react";
import StudentSideBar from "../../components/sidebar/StudentSideBar";
import StudentHeader from "../../components/header/StudentHeader";
import { Calendar, Badge, Modal, Button } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import { FaBookOpen, FaClock } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import paths from "../../routes/path";

// Data mẫu cho lịch học
interface ScheduleEvent {
  id: number;
  title: string;
  time: string;
  type: string;
  color: string;
}

interface ScheduleData {
  [key: string]: ScheduleEvent[]; // Index signature cho phép dùng string key
}

const scheduleData: ScheduleData = {
  "2025-07-18": [
    {
      id: 1,
      title: "Luyện thi JLPT N3 - Ngữ pháp",
      time: "09:00 - 10:30",
      type: "class",
      color: "green",
    },
    {
      id: 2,
      title: "Thi thử JLPT N3",
      time: "14:00 - 16:00",
      type: "exam",
      color: "red",
    },
  ],
  "2025-07-19": [
    {
      id: 3,
      title: "Ôn tập từ vựng N3",
      time: "08:00 - 09:30",
      type: "review",
      color: "blue",
    },
  ],
};

const StudentSchedulePage: React.FC = () => {
  const { userInfo, handleLogout } = useAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProfileClick = () =>
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const handleLogoutClick = () => {
    handleLogout();
    setIsProfileDropdownOpen(false);
  };

  const onSelectDate = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    if (scheduleData[dateKey]) {
      setSelectedEvents(scheduleData[dateKey]);
      setIsModalOpen(true);
    } else {
      setSelectedEvents([]);
      setIsModalOpen(false);
    }
  };

  const dateCellRender = (value: Dayjs) => {
    const dateKey = value.format("YYYY-MM-DD");
    const events = scheduleData[dateKey] || [];
    return (
      <ul className="space-y-1">
        {events.map((item) => (
          <li key={item.id} className="text-xs">
            <Badge color={item.color} text={item.title} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <StudentSideBar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <StudentHeader />

        {/* Content */}
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Lịch học của tôi
          </h1>

          {/* Calendar */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <Calendar
              fullscreen={true}
              dateCellRender={dateCellRender}
              onSelect={onSelectDate}
            />
          </div>

          {/* Modal chi tiết buổi học */}
          <Modal
            title="Chi tiết buổi học"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={[
              <Button key="cancel" onClick={() => setIsModalOpen(false)}>
                Đóng
              </Button>,
            ]}
          >
            {selectedEvents.length > 0 ? (
              <div className="space-y-4">
                {selectedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-gray-50 rounded-lg shadow flex items-start gap-4"
                  >
                    <div
                      className={`w-2 h-12 rounded-full`}
                      style={{ backgroundColor: event.color }}
                    ></div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        {event.title}
                      </h4>
                      <p className="text-gray-600 flex items-center gap-2">
                        <FaClock /> {event.time}
                      </p>
                      <Button
                        type="primary"
                        className="mt-2 bg-green-600 hover:bg-green-700"
                      >
                        Vào học ngay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                Không có sự kiện nào trong ngày này.
              </p>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default StudentSchedulePage;
