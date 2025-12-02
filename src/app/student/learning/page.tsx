"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  Mic,
  MicOff,
  Download,
  BookOpen,
  Edit,
  CheckCircle,
  Clock,
  Target,
  Star,
  BarChart3,
  Headphones,
  FileText,
  Award,
} from "lucide-react";

interface LearningContent {
  id: string;
  type: "listening" | "speaking" | "writing" | "exam";
  title: string;
  description: string;
  level: string;
  duration: number;
  audioUrl?: string;
  text?: string;
  completed: boolean;
}

interface StudentRecording {
  id: string;
  title: string;
  recordedAt: string;
  duration: number;
  url: string;
}

interface WritingTest {
  id: string;
  title: string;
  content: string;
  score?: number;
  feedback?: string;
  submittedAt: string;
}

export default function StudentLearningPage() {
  const [activeTab, setActiveTab] = useState<
    "practice" | "writing" | "exam" | "recordings"
  >("practice");
  const [learningContents, setLearningContents] = useState<LearningContent[]>(
    [],
  );
  const [recordings, setRecordings] = useState<StudentRecording[]>([]);
  const [writingTests, setWritingTests] = useState<WritingTest[]>([]);
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showWritingModal, setShowWritingModal] = useState(false);
  const [selectedContent, setSelectedContent] =
    useState<LearningContent | null>(null);

  // 더미 데이터 로드
  useEffect(() => {
    const mockContents: LearningContent[] = [
      {
        id: "1",
        type: "listening",
        title: "기본 인사말 듣기",
        description:
          "안녕하세요, 만나서 반갑습니다 등의 기본 인사말을 듣고 따라해보세요.",
        level: "초급 A",
        duration: 120,
        audioUrl: "/audio/greetings.mp3",
        text: "안녕하세요, 만나서 반갑습니다.",
        completed: false,
      },
      {
        id: "2",
        type: "speaking",
        title: "자기소개 연습",
        description:
          "저는 [이름]입니다. 한국어를 배우고 있어요. 등의 자기소개를 연습해보세요.",
        level: "초급 A",
        duration: 180,
        audioUrl: "/audio/selfintro.mp3",
        text: "저는 [이름]입니다. 한국어를 배우고 있어요.",
        completed: true,
      },
      {
        id: "3",
        type: "listening",
        title: "숫자와 시간 표현",
        description: "1부터 10까지의 숫자와 시간 표현을 듣고 따라해보세요.",
        level: "초급 A",
        duration: 150,
        audioUrl: "/audio/numbers.mp3",
        text: "지금 3시입니다. 내일 9시에 만나요.",
        completed: false,
      },
    ];

    const mockRecordings: StudentRecording[] = [
      {
        id: "1",
        title: "자기소개 연습 녹음",
        recordedAt: "2024-01-15T10:30:00Z",
        duration: 45,
        url: "/recordings/selfintro-student.mp3",
      },
      {
        id: "2",
        title: "인사말 연습 녹음",
        recordedAt: "2024-01-14T15:20:00Z",
        duration: 30,
        url: "/recordings/greetings-student.mp3",
      },
    ];

    const mockWritingTests: WritingTest[] = [
      {
        id: "1",
        title: "자기소개 작문",
        content:
          "안녕하세요. 저는 김학생입니다. 한국어를 배우고 있어요. 만나서 반갑습니다.",
        score: 85,
        feedback: "매우 좋은 작문입니다. 문법이 정확하고 자연스럽습니다.",
        submittedAt: "2024-01-15T11:00:00Z",
      },
    ];

    setLearningContents(mockContents);
    setRecordings(mockRecordings);
    setWritingTests(mockWritingTests);
  }, []);

  const handlePlayAudio = (audioUrl: string) => {
    setCurrentAudio(audioUrl);
    setIsPlaying(true);
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    // 실제 녹음 로직
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // 녹음 저장 로직
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderPracticeTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">학습 콘텐츠</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Target className="w-4 h-4" />
          <span>초급 A 레벨</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningContents.map((content) => (
          <div
            key={content.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {content.type === "listening" && (
                    <Headphones className="w-5 h-5 text-blue-600" />
                  )}
                  {content.type === "speaking" && (
                    <Mic className="w-5 h-5 text-green-600" />
                  )}
                  {content.type === "writing" && (
                    <FileText className="w-5 h-5 text-purple-600" />
                  )}
                  {content.type === "exam" && (
                    <Award className="w-5 h-5 text-orange-600" />
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      content.type === "listening"
                        ? "bg-blue-100 text-blue-800"
                        : content.type === "speaking"
                          ? "bg-green-100 text-green-800"
                          : content.type === "writing"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-orange-100 text-orange-800"
                    }`}
                  >
                    {content.type === "listening"
                      ? "듣기"
                      : content.type === "speaking"
                        ? "말하기"
                        : content.type === "writing"
                          ? "작문"
                          : "시험"}
                  </span>
                </div>
                {content.completed && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">
                {content.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {content.description}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(content.duration)}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {content.level}
                </span>
              </div>

              {content.audioUrl && (
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      듣기 텍스트:
                    </p>
                    <p className="text-sm text-gray-600">{content.text}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePlayAudio(content.audioUrl!)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4" />
                      듣기
                    </button>

                    {content.type === "speaking" && (
                      <button
                        onClick={
                          isRecording
                            ? handleStopRecording
                            : handleStartRecording
                        }
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                          isRecording
                            ? "bg-red-600 text-white hover:bg-red-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {isRecording ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                        {isRecording ? "녹음 중지" : "녹음 시작"}
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setSelectedContent(content);
                  setShowWritingModal(true);
                }}
                className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                상세보기
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderWritingTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">작문 테스트</h2>
        <button
          onClick={() => setShowWritingModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Edit className="w-4 h-4" />새 작문
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {writingTests.map((test) => (
          <div key={test.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">{test.title}</h3>
              {test.score && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {test.score}점
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  작문 내용:
                </p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded p-3">
                  {test.content}
                </p>
              </div>

              {test.feedback && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    피드백:
                  </p>
                  <p className="text-sm text-gray-600 bg-green-50 rounded p-3">
                    {test.feedback}
                  </p>
                </div>
              )}

              <div className="text-xs text-gray-500">
                제출일: {new Date(test.submittedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderExamTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">시험 준비</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">진행률</h3>
            <p className="text-2xl font-bold text-blue-600">75%</p>
          </div>

          <div className="text-center p-6 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">완료된 단원</h3>
            <p className="text-2xl font-bold text-green-600">12/16</p>
          </div>

          <div className="text-center p-6 bg-orange-50 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="font-semibold text-gray-900 mb-1">예상 완료일</h3>
            <p className="text-lg font-medium text-orange-600">2주 후</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold text-gray-900 mb-3">추천 학습 순서</h3>
          <div className="space-y-2">
            {[
              "기본 인사말",
              "자기소개",
              "숫자와 시간",
              "음식 주문",
              "교통수단",
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </span>
                <span className="flex-1">{item}</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecordingsTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">내 녹음 파일</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recordings.map((recording) => (
          <div key={recording.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mic className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {recording.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {new Date(recording.recordedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>길이: {formatDuration(recording.duration)}</span>
                <span>파일 크기: 2.3MB</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePlayAudio(recording.url)}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Play className="w-4 h-4" />
                  재생
                </button>

                <button className="flex items-center gap-2 px-3 py-2 text-gray-600 border rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  다운로드
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">학습</h1>
          <p className="text-lg text-gray-600">
            듣기, 말하기, 작문 연습을 통해 한국어 실력을 향상시키세요
          </p>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex border-b">
            {[
              { id: "practice", label: "연습", icon: BookOpen },
              { id: "writing", label: "작문", icon: Edit },
              { id: "exam", label: "시험 준비", icon: Award },
              { id: "recordings", label: "내 녹음", icon: Mic },
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id as "practice" | "writing" | "exam" | "recordings",
                    )
                  }
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <IconComponent className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 탭 컨텐츠 */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === "practice" && renderPracticeTab()}
          {activeTab === "writing" && renderWritingTab()}
          {activeTab === "exam" && renderExamTab()}
          {activeTab === "recordings" && renderRecordingsTab()}
        </div>

        {/* 작문 모달 */}
        {showWritingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {selectedContent ? selectedContent.title : "새 작문"}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="작문 제목을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내용
                  </label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="작문 내용을 입력하세요..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowWritingModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  취소
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  제출
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
