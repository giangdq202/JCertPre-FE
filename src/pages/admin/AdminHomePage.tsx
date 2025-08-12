import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getTotalRevenue,
  getTotalEnrollments,
  getEnrollmentsByMonth,
  getRevenueByMonth,
  getCurrentMonthEnrollments,
  getCurrentMonthRevenue,
  TotalRevenueDto,
  TotalEnrollmentsDto,
  EnrollmentsByMonthDto,
  RevenueByMonthDto,
  CurrentMonthEnrollmentsDto,
  CurrentMonthRevenueDto,
} from "../../services/adminDashboardService";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { FaMoneyBillWave, FaUserGraduate, FaChartLine } from "react-icons/fa";
import dayjs from "dayjs";

const AdminHomePage: React.FC = () => {
  const { userInfo } = useAuth();
  
  // State for dashboard data
  const [totalRevenue, setTotalRevenue] = useState<TotalRevenueDto | null>(null);
  const [totalEnrollments, setTotalEnrollments] = useState<TotalEnrollmentsDto | null>(null);
  const [enrollmentsByMonth, setEnrollmentsByMonth] = useState<EnrollmentsByMonthDto | null>(null);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueByMonthDto | null>(null);
  const [currentMonthEnrollments, setCurrentMonthEnrollments] = useState<CurrentMonthEnrollmentsDto | null>(null);
  const [currentMonthRevenue, setCurrentMonthRevenue] = useState<CurrentMonthRevenueDto | null>(null);
  
  // Loading states
  const [isLoadingRevenue, setIsLoadingRevenue] = useState(true);
  const [isLoadingEnrollments, setIsLoadingEnrollments] = useState(true);
  const [isLoadingCharts, setIsLoadingCharts] = useState(true);
  const [isLoadingCurrentMonth, setIsLoadingCurrentMonth] = useState(true);

  // Fetch total revenue
  const fetchTotalRevenue = async () => {
    setIsLoadingRevenue(true);
    try {
      const data = await getTotalRevenue();
      setTotalRevenue(data);
    } catch (error) {
      console.error("Error fetching total revenue:", error);
    } finally {
      setIsLoadingRevenue(false);
    }
  };

  useEffect(() => {
    fetchTotalRevenue();
  }, []);

  // Fetch total enrollments
  const fetchTotalEnrollments = async () => {
    setIsLoadingEnrollments(true);
    try {
      const data = await getTotalEnrollments();
      setTotalEnrollments(data);
    } catch (error) {
      console.error("Error fetching total enrollments:", error);
    } finally {
      setIsLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchTotalEnrollments();
  }, []);

  // Fetch chart data
  const fetchChartData = async () => {
    setIsLoadingCharts(true);
    try {
      const [enrollmentsData, revenueData] = await Promise.all([
        getEnrollmentsByMonth(),
        getRevenueByMonth(),
      ]);
      setEnrollmentsByMonth(enrollmentsData);
      setRevenueByMonth(revenueData);
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setIsLoadingCharts(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, []);

  // Fetch current month data
  const fetchCurrentMonthData = async () => {
    setIsLoadingCurrentMonth(true);
    try {
      const [enrollmentsData, revenueData] = await Promise.all([
        getCurrentMonthEnrollments(),
        getCurrentMonthRevenue(),
      ]);
      setCurrentMonthEnrollments(enrollmentsData);
      setCurrentMonthRevenue(revenueData);
    } catch (error) {
      console.error("Error fetching current month data:", error);
    } finally {
      setIsLoadingCurrentMonth(false);
    }
  };

  useEffect(() => {
    fetchCurrentMonthData();
  }, []);

  // Transform data for charts
  const transformDataForChart = (data: Record<string, number>) => {
    return Object.entries(data)
      .map(([monthYear, value]) => ({
        month: monthYear,
        value: value,
      }))
      .sort((a, b) => {
        const dateA = dayjs(a.month, "MM/YYYY");
        const dateB = dayjs(b.month, "MM/YYYY");
        return dateA.isBefore(dateB) ? -1 : 1;
      });
  };

  const enrollmentChartData = enrollmentsByMonth 
    ? transformDataForChart(enrollmentsByMonth.data)
    : [];

  const revenueChartData = revenueByMonth 
    ? transformDataForChart(revenueByMonth.data)
    : [];

  // Format currency
  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  // Calculate growth percentage
  const calculateGrowthPercentage = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Get previous month data from chart data
  const getPreviousMonthData = (chartData: any[], currentMonth: string) => {
    const currentIndex = chartData.findIndex(item => item.month === currentMonth);
    if (currentIndex > 0) {
      return chartData[currentIndex - 1];
    }
    return null;
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
        {/* Welcome Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Chào mừng trở lại, <span className="text-orange-600">{userInfo?.fullName || "Admin"}</span>!
            </h1>
            <p className="text-gray-600">
              Theo dõi tổng quan hoạt động hệ thống và doanh thu
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Cập nhật lần cuối</p>
            <p className="text-sm font-bold text-gray-800">
              {dayjs().format("DD/MM/YYYY HH:mm")}
            </p>
            <button 
              onClick={() => {
                fetchTotalRevenue();
                fetchTotalEnrollments();
                fetchChartData();
                fetchCurrentMonthData();
              }}
              className="mt-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
            >
              Tải lại dữ liệu
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaMoneyBillWave className="text-2xl text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Tổng doanh thu</p>
                {isLoadingRevenue ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-gray-800">
                    {totalRevenue ? formatCurrency(totalRevenue.totalAmount, totalRevenue.currency) : "0 VND"}
                  </h3>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-green-600 font-medium">
                {totalRevenue ? `${formatNumber(totalRevenue.totalTransactions)} giao dịch` : "0 giao dịch"}
              </span>
            </div>
          </div>

          {/* Total Enrollments Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaUserGraduate className="text-2xl text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Tổng lượt đăng ký</p>
                {isLoadingEnrollments ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-24 rounded"></div>
                ) : (
                  <h3 className="text-2xl font-bold text-gray-800">
                    {totalEnrollments ? formatNumber(totalEnrollments.totalCount) : "0"}
                  </h3>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-blue-600 font-medium">Tổng số khóa học đã đăng ký</span>
            </div>
          </div>

          {/* Current Month Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <FaChartLine className="text-2xl text-orange-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Tháng này</p>
                {isLoadingCurrentMonth ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                ) : (
                  <h3 className="text-lg font-bold text-gray-800">
                    {currentMonthEnrollments ? formatNumber(currentMonthEnrollments.count) : "0"} lượt đăng ký
                  </h3>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm">
              {isLoadingCurrentMonth ? (
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
              ) : (
                <span className="text-orange-600 font-medium">
                  {(() => {
                    if (!currentMonthEnrollments || !enrollmentChartData.length) return "Không có dữ liệu so sánh";
                    
                    const currentMonth = currentMonthEnrollments.month;
                    const previousMonthData = getPreviousMonthData(enrollmentChartData, currentMonth);
                    
                    if (!previousMonthData) return "Tháng đầu tiên";
                    
                    const growth = calculateGrowthPercentage(currentMonthEnrollments.count, previousMonthData.value);
                    const isPositive = growth >= 0;
                    
                    return (
                      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}% so với tháng trước
                      </span>
                    );
                  })()}
                </span>
              )}
            </div>
          </div>

          {/* Current Month Revenue */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaMoneyBillWave className="text-2xl text-green-600" />
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Doanh thu tháng</p>
                {isLoadingCurrentMonth ? (
                  <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                ) : (
                  <h3 className="text-lg font-bold text-gray-800">
                    {currentMonthRevenue ? formatCurrency(currentMonthRevenue.totalAmount, currentMonthRevenue.currency) : "0 VND"}
                  </h3>
                )}
              </div>
            </div>
            <div className="flex items-center text-sm">
              {isLoadingCurrentMonth ? (
                <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
              ) : (
                <span className="text-green-600 font-medium">
                  {(() => {
                    if (!currentMonthRevenue || !revenueChartData.length) return "Không có dữ liệu so sánh";
                    
                    const currentMonth = currentMonthRevenue.month;
                    const previousMonthData = getPreviousMonthData(revenueChartData, currentMonth);
                    
                    if (!previousMonthData) return "Tháng đầu tiên";
                    
                    const growth = calculateGrowthPercentage(currentMonthRevenue.totalAmount, previousMonthData.value);
                    const isPositive = growth >= 0;
                    
                    return (
                      <span className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '↗' : '↘'} {Math.abs(growth).toFixed(1)}% so với tháng trước
                      </span>
                    );
                  })()}
                </span>
              )}
            </div>
          </div>


        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Enrollments Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Số lượt đăng ký theo tháng
              </h3>
              <p className="text-gray-600 text-sm">
                Thống kê số lượt đăng ký khóa học trong 12 tháng gần nhất
              </p>
            </div>
            
            {isLoadingCharts ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-orange-500 border-opacity-25"></div>
                <p className="ml-4 text-gray-600">Đang tải biểu đồ...</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={enrollmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#666"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis stroke="#666" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [formatNumber(Number(value)), "Số lượt đăng ký"]}
                      labelFormatter={(label) => `Tháng: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="#ea580c"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Doanh thu theo tháng
              </h3>
              <p className="text-gray-600 text-sm">
                Thống kê doanh thu từ nạp tiền trong 12 tháng gần nhất
              </p>
            </div>
            
            {isLoadingCharts ? (
              <div className="flex items-center justify-center h-80">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-4 border-orange-500 border-opacity-25"></div>
                <p className="ml-4 text-gray-600">Đang tải biểu đồ...</p>
              </div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#666"
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke="#666" 
                      fontSize={12}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(Number(value)), "Doanh thu"]}
                      labelFormatter={(label) => `Tháng: ${label}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#ea580c"
                      strokeWidth={3}
                      dot={{ fill: "#ea580c", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: "#ea580c" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-orange-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Thông tin chi tiết
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {totalRevenue ? formatNumber(totalRevenue.totalTransactions) : "0"}
              </div>
              <p className="text-gray-600">Tổng số giao dịch</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {totalEnrollments ? formatNumber(totalEnrollments.totalCount) : "0"}
              </div>
              <p className="text-gray-600">Tổng số đăng ký</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {revenueByMonth ? Object.keys(revenueByMonth.data).length : "0"}
              </div>
              <p className="text-gray-600">Tháng có dữ liệu</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
    );
  };

export default AdminHomePage;
