"use client";

import React from "react";
import { ChartDataConverter } from "@/lib/analytics-engine";

interface ChartData {
  label: string;
  value: number;
}

interface PieChartProps {
  data: ChartData[];
  title: string;
  colors?: string[];
}

interface BarChartProps {
  data: ChartData[];
  title: string;
  color?: string;
}

interface LineChartProps {
  data: ChartData[];
  title: string;
  color?: string;
}

interface HeatmapProps {
  data: { day: string; hour: string; value: number }[];
  title: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

/**
 * 파이 차트 컴포넌트
 */
export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"],
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * 360, 0);
              const endAngle = startAngle + (item.value / total) * 360;

              const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

              return (
                <path
                  key={index}
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-sm text-gray-600">총합</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 바 차트 컴포넌트
 */
export const BarChart: React.FC<BarChartProps> = ({
  data,
  title,
  color = "#3B82F6",
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 mr-3">{item.label}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 mr-3">
              <div
                className="h-6 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-gray-800 text-right">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 선 그래프 컴포넌트
 */
export const LineChart: React.FC<LineChartProps> = ({
  data,
  title,
  color = "#3B82F6",
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));
  const range = maxValue - minValue;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} 200`}>
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={data
              .map((item, index) => {
                const x = index * 60 + 30;
                const y = 180 - ((item.value - minValue) / range) * 160;
                return `${x},${y}`;
              })
              .join(" ")}
          />
          {data.map((item, index) => {
            const x = index * 60 + 30;
            const y = 180 - ((item.value - minValue) / range) * 160;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <div>{item.label}</div>
              <div className="font-medium">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 히트맵 컴포넌트
 */
export const Heatmap: React.FC<HeatmapProps> = ({ data, title }) => {
  const days = ["월", "화", "수", "목", "금", "토", "일"];
  const hours = [
    "09:00",
    "10:00",
    "11:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  const maxValue = Math.max(...data.map((item) => item.value));

  const getCellValue = (day: string, hour: string) => {
    const cell = data.find((item) => item.day === day && item.hour === hour);
    return cell ? cell.value : 0;
  };

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    return `rgba(59, 130, 246, ${intensity})`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-2 text-sm text-gray-600">요일/시간</th>
              {hours.map((hour) => (
                <th key={hour} className="p-2 text-sm text-gray-600">
                  {hour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="p-2 text-sm font-medium text-gray-700">{day}</td>
                {hours.map((hour) => {
                  const value = getCellValue(day, hour);
                  return (
                    <td key={hour} className="p-1">
                      <div
                        className="w-8 h-8 rounded flex items-center justify-center text-xs text-white font-medium"
                        style={{ backgroundColor: getColor(value) }}
                        title={`${day} ${hour}: ${value}명`}
                      >
                        {value > 0 ? value : ""}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * 통계 카드 컴포넌트
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {trend && (
          <div
            className={`flex items-center ${trend.isPositive ? "text-green-600" : "text-red-600"}`}
          >
            <span className="text-sm font-medium">
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <svg
              className={`w-4 h-4 ml-1 ${trend.isPositive ? "rotate-0" : "rotate-180"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 차트 데이터 변환 헬퍼
 */
export const ChartHelpers = {
  toPieChartData: ChartDataConverter.toPieChartData,
  toBarChartData: ChartDataConverter.toBarChartData,
  toLineChartData: ChartDataConverter.toLineChartData,
  toHeatmapData: ChartDataConverter.toHeatmapData,
};
