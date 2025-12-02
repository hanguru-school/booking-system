"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Search,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface SalesData {
  id: string;
  date: string;
  revenue: number;
  courses: number;
  students: number;
  averageTicket: number;
  growthRate: number;
  category: string;
}

interface SalesMetric {
  label: string;
  value: number;
  change: number;
  trend: "up" | "down";
  icon: React.ReactNode;
}

const SalesAnalysisPage = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [filteredData, setFilteredData] = useState<SalesData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock sales data
  useEffect(() => {
    const mockData: SalesData[] = [
      {
        id: "1",
        date: "2024-01-15",
        revenue: 1250000,
        courses: 45,
        students: 120,
        averageTicket: 10417,
        growthRate: 12.5,
        category: "수학",
      },
      {
        id: "2",
        date: "2024-01-14",
        revenue: 1180000,
        courses: 42,
        students: 115,
        averageTicket: 10261,
        growthRate: 8.3,
        category: "영어",
      },
      {
        id: "3",
        date: "2024-01-13",
        revenue: 1320000,
        courses: 48,
        students: 125,
        averageTicket: 10560,
        growthRate: 15.2,
        category: "과학",
      },
      {
        id: "4",
        date: "2024-01-12",
        revenue: 1100000,
        courses: 40,
        students: 110,
        averageTicket: 10000,
        growthRate: 5.8,
        category: "국어",
      },
      {
        id: "5",
        date: "2024-01-11",
        revenue: 1280000,
        courses: 46,
        students: 122,
        averageTicket: 10492,
        growthRate: 11.4,
        category: "수학",
      },
    ];
    setSalesData(mockData);
    setFilteredData(mockData);
  }, []);

  // Filter data
  useEffect(() => {
    let filtered = salesData;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.date.includes(searchTerm),
      );
    }

    setFilteredData(filtered);
  }, [salesData, selectedPeriod, selectedCategory, searchTerm]);

  const metrics: SalesMetric[] = [
    {
      label: "총 매출",
      value: 6130000,
      change: 12.5,
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      label: "총 수강생",
      value: 592,
      change: 8.3,
      trend: "up",
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: "총 강의",
      value: 221,
      change: 15.2,
      trend: "up",
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      label: "평균 티켓",
      value: 10352,
      change: -2.1,
      trend: "down",
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  const categories = ["all", "수학", "영어", "과학", "국어"];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("ko-KR").format(num);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">매출 분석</h1>
          <p className="text-gray-600">매출 현황과 분석 데이터를 확인하세요</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4" />
            리포트 다운로드
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {metric.label}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {metric.label === "총 매출"
                    ? formatCurrency(metric.value)
                    : formatNumber(metric.value)}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">{metric.icon}</div>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {metric.trend === "up" ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  metric.trend === "up" ? "text-green-600" : "text-red-600"
                }`}
              >
                {metric.change > 0 ? "+" : ""}
                {metric.change}%
              </span>
              <span className="text-sm text-gray-500">전월 대비</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              기간
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="week">이번 주</option>
              <option value="month">이번 달</option>
              <option value="quarter">이번 분기</option>
              <option value="year">올해</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "전체" : category}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="카테고리 또는 날짜 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">매출 추이</h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <LineChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">매출 추이 차트</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              카테고리별 분포
            </h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">카테고리 분포 차트</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Data Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            매출 상세 데이터
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  날짜
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  매출
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  강의 수
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수강생
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  평균 티켓
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  성장률
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(item.revenue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.courses}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.students}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.averageTicket)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      {item.growthRate > 0 ? (
                        <ArrowUpRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-600" />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          item.growthRate > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {item.growthRate > 0 ? "+" : ""}
                        {item.growthRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalysisPage;
