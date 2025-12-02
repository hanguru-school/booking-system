"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Target, Award, Download } from "lucide-react";

// Mock data for learning reports
const mockReports = [
  {
    id: 1,
    childName: "김민수",
    subject: "수학",
    period: "2024년 1월",
    overallGrade: "A",
    score: 92,
    previousScore: 88,
    improvement: "+4",
    attendance: 95,
    homeworkCompletion: 100,
    classParticipation: 90,
    teacherComment:
      "민수는 수학에 대한 이해도가 높아지고 있습니다. 특히 분수 개념을 잘 이해하고 있어요. 계속해서 꾸준한 학습을 유지해주세요.",
    strengths: ["개념 이해력", "문제 해결 능력", "집중력"],
    areasForImprovement: ["계산 속도", "응용 문제"],
    nextGoals: ["분수의 덧셈과 뺄셈 완벽 숙지", "응용 문제 풀이 능력 향상"],
  },
  {
    id: 2,
    childName: "김민수",
    subject: "영어",
    period: "2024년 1월",
    overallGrade: "B+",
    score: 85,
    previousScore: 82,
    improvement: "+3",
    attendance: 100,
    homeworkCompletion: 95,
    classParticipation: 85,
    teacherComment:
      "영어 발음이 많이 좋아졌습니다. 하지만 문법 부분에서 아직 부족한 점이 있어요. 더 많은 연습이 필요합니다.",
    strengths: ["발음", "듣기 능력", "수업 참여도"],
    areasForImprovement: ["문법", "어휘력"],
    nextGoals: ["기본 문법 규칙 완벽 숙지", "어휘량 확장"],
  },
  {
    id: 3,
    childName: "김민수",
    subject: "과학",
    period: "2024년 1월",
    overallGrade: "A-",
    score: 89,
    previousScore: 85,
    improvement: "+4",
    attendance: 90,
    homeworkCompletion: 100,
    classParticipation: 95,
    teacherComment:
      "과학 실험에 대한 관심이 높고, 호기심이 많아서 좋습니다. 관찰력이 뛰어나고 기록도 잘 하고 있어요.",
    strengths: ["실험 관찰력", "호기심", "기록 능력"],
    areasForImprovement: ["이론 정리", "결론 도출"],
    nextGoals: ["실험 결과 분석 능력 향상", "과학 용어 정확한 사용"],
  },
];

const subjects = ["전체", "수학", "영어", "과학", "국어", "음악"];
const periods = ["2024년 1월", "2023년 12월", "2023년 11월"];

export default function LearningReportsPage() {
  const [selectedSubject, setSelectedSubject] = useState("전체");
  const [selectedPeriod, setSelectedPeriod] = useState("2024년 1월");
  const [selectedChild, setSelectedChild] = useState("김민수");

  const filteredReports = mockReports.filter((report) => {
    const matchesSubject =
      selectedSubject === "전체" || report.subject === selectedSubject;
    const matchesPeriod = report.period === selectedPeriod;
    const matchesChild = report.childName === selectedChild;

    return matchesSubject && matchesPeriod && matchesChild;
  });

  const averageScore =
    filteredReports.length > 0
      ? filteredReports.reduce((acc, report) => acc + report.score, 0) /
        filteredReports.length
      : 0;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A":
        return "text-green-600";
      case "A-":
        return "text-green-500";
      case "B+":
        return "text-blue-600";
      case "B":
        return "text-blue-500";
      case "C+":
        return "text-yellow-600";
      case "C":
        return "text-yellow-500";
      default:
        return "text-gray-600";
    }
  };

  const getImprovementColor = (improvement: string) => {
    return improvement.startsWith("+") ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">학습 리포트</h1>
        <p className="text-gray-600">아이들의 학습 성과와 진도를 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 점수</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageScore.toFixed(1)}점
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">평균 향상도</p>
              <p className="text-2xl font-bold text-gray-900">+3.7점</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Target className="w-8 h-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">출석률</p>
              <p className="text-2xl font-bold text-gray-900">95%</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">최고 과목</p>
              <p className="text-2xl font-bold text-gray-900">수학</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="김민수">김민수</option>
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {periods.map((period) => (
              <option key={period} value={period}>
                {period}
              </option>
            ))}
          </select>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            리포트 다운로드
          </button>
        </div>
      </div>

      {/* 리포트 목록 */}
      <div className="space-y-6">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {report.subject}
                </h3>
                <p className="text-sm text-gray-600">
                  {report.period} • {report.childName}
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`text-3xl font-bold ${getGradeColor(report.overallGrade)}`}
                >
                  {report.overallGrade}
                </div>
                <div className="text-sm text-gray-500">{report.score}점</div>
              </div>
            </div>

            {/* 성과 지표 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    이전 점수
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {report.previousScore}점
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    향상도
                  </span>
                  <span
                    className={`text-lg font-semibold ${getImprovementColor(report.improvement)}`}
                  >
                    {report.improvement}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    출석률
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {report.attendance}%
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    과제 완성도
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {report.homeworkCompletion}%
                  </span>
                </div>
              </div>
            </div>

            {/* 선생님 코멘트 */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                선생님 코멘트
              </h4>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700">{report.teacherComment}</p>
              </div>
            </div>

            {/* 강점 및 개선점 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  강점
                </h4>
                <div className="space-y-2">
                  {report.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  개선이 필요한 부분
                </h4>
                <div className="space-y-2">
                  {report.areasForImprovement.map((area, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 다음 목표 */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                다음 목표
              </h4>
              <div className="space-y-2">
                {report.nextGoals.map((goal, index) => (
                  <div key={index} className="flex items-center">
                    <Target className="w-4 h-4 text-blue-500 mr-3" />
                    <span className="text-gray-700">{goal}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">선택한 조건에 맞는 리포트가 없습니다.</p>
        </div>
      )}
    </div>
  );
}
