import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useNavigate and useLocation

// Sidebar Component
const StudentSideBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define the menu items with their names, icons (SVG paths), and corresponding paths
  const menuItems = [
    { name: 'Bảng điều khiển', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/student/dashboard' },
    { name: 'Khóa học', icon: 'M12 6.253v13.5M12 6.253c-3.118 0-6.236.002-9.354 0-.17 0-.339.01-.508.03-.314.037-.582.16-.763.364-.18.204-.27.46-.27.747v9.766c0 .287.09.543.27.747.18.204.449.327.763.364.169.02.338.03.508.03 3.118 0 6.236 0 9.354 0zm0 0c3.118 0 6.236.002 9.354 0 .17 0 .339-.01.508-.03.314-.037.582-.16.763-.364.18-.204.27-.46.27-.747V6.253z', path: '/student/courses' },
    { name: 'Mô phỏng kỳ thi', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', path: '/student/exam-simulations' },
    { name: 'Kế hoạch học tập', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', path: '/student/study-plan' },
    { name: 'Theo dõi tiến độ', icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 012-2h2a2 2 0 012 2v1m-4 0h4', path: '/student/progress' },
    { name: 'Tin nhắn', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', path: '/student/messages' },
    { name: 'Lịch trình', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', path: '/student/schedule' },
    { name: 'Cài đặt', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', path: '/student/settings' }
  ];

  return (
    <aside className="w-64 bg-white p-6 shadow-lg flex-shrink-0 rounded-r-xl">
      <div className="flex items-center mb-8">
        <img src="https://placehold.co/40x40/22c55e/ffffff?text=J" alt="Logo" className="rounded-full mr-3" />
        <h1 className="text-xl font-bold text-gray-800">JCertPre</h1>
      </div>
      <nav>
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-4">
              <div
                onClick={() => navigate(item.path)}
                className={`flex items-center p-2 rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors duration-200 cursor-pointer
                  ${location.pathname === item.path ? 'bg-green-50 text-green-700 font-semibold' : ''}`}
              >
                <svg className="h-5 w-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
                </svg>
                {item.name}
              </div>
            </li>
          ))}
        </ul>
      </nav>
      {/* <div className="mt-8">
        <button className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md">
          Nhận quyền truy cập Premium
        </button>
      </div> */}
    </aside>
  );
};

export default StudentSideBar;