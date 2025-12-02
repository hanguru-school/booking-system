"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Palette,
  Star,
  Clock,
  Maximize,
  Minimize,
  BookOpen,
} from "lucide-react";

interface LessonNote {
  id: string;
  studentName: string;
  date: string;
  content: string;
  todayLesson: string;
  nextLesson: string;
  homework: {
    hasHomework: boolean;
    teacherHomework: string;
    studentHomework: string;
  };
  evaluation: {
    participation: number;
    understanding: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
    comments: string;
    participationComment: string;
    understandingComment: string;
    pronunciationComment: string;
    grammarComment: string;
    vocabularyComment: string;
    speakingComment: string;
    listeningComment: string;
    readingComment: string;
    writingComment: string;
  };
}

interface ClassInfo {
  studentName: string;
  time: string;
  subject: string;
  date: string;
}

export default function TeacherLessonEditorPage() {
  const [lessonNote, setLessonNote] = useState<LessonNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [showClassSelector, setShowClassSelector] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [currentEvaluationField, setCurrentEvaluationField] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [availableClasses, setAvailableClasses] = useState<ClassInfo[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);

  // Mock data for class selection - 실제로는 API에서 날짜별로 가져옴
  const getClassesByDate = (date: string): ClassInfo[] => {
    const allClasses: { [key: string]: ClassInfo[] } = {
      "2024-01-16": [
        {
          studentName: "김학생",
          time: "09:00",
          subject: "문법",
          date: "2024-01-16",
        },
        {
          studentName: "이학생",
          time: "11:00",
          subject: "회화",
          date: "2024-01-16",
        },
        {
          studentName: "박학생",
          time: "14:00",
          subject: "독해",
          date: "2024-01-16",
        },
        {
          studentName: "최학생",
          time: "16:00",
          subject: "듣기",
          date: "2024-01-16",
        },
      ],
      "2024-01-17": [
        {
          studentName: "정학생",
          time: "10:00",
          subject: "문법",
          date: "2024-01-17",
        },
        {
          studentName: "한학생",
          time: "15:00",
          subject: "회화",
          date: "2024-01-17",
        },
      ],
      "2024-01-18": [], // 수업이 없는 날
    };
    return allClasses[date] || [];
  };

  useEffect(() => {
    // URL 파라미터에서 수업 정보 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const studentName = urlParams.get("student");
    const time = urlParams.get("time");
    const subject = urlParams.get("subject");
    const noteId = urlParams.get("noteId");
    const date = urlParams.get("date");

    if (date) {
      setSelectedDate(date);
    }

    if (studentName && time && subject) {
      setSelectedClass({
        studentName,
        time,
        subject,
        date: date || new Date().toISOString().split("T")[0],
      });
    }

    // 선택된 날짜의 수업 목록 가져오기
    const classes = getClassesByDate(selectedDate);
    setAvailableClasses(classes);

    // 실제 API 호출로 대체
    setTimeout(() => {
      setLessonNote({
        id: noteId || "lesson-001",
        studentName: studentName || "김학생",
        date: date || new Date().toISOString().split("T")[0],
        content:
          "<h2>오늘의 수업 내용</h2><p>안녕하세요! 오늘은 한국어 기초 문법을 배워보겠습니다.</p><h3>1. 인사말</h3><ul><li>안녕하세요 - Hello</li><li>안녕히 가세요 - Goodbye</li><li>감사합니다 - Thank you</li></ul><h3>2. 자기소개</h3><p>저는 [이름]입니다. 만나서 반갑습니다.</p>",
        todayLesson: "기초 문법 - 인사말과 자기소개",
        nextLesson: "기초 문법 - 숫자와 시간 표현",
        homework: {
          hasHomework: false,
          teacherHomework: "",
          studentHomework: "",
        },
        evaluation: {
          participation: 4,
          understanding: 4,
          pronunciation: 3,
          grammar: 4,
          vocabulary: 3,
          speaking: 4,
          listening: 3,
          reading: 4,
          writing: 3,
          comments:
            "전반적으로 좋은 수업이었습니다. 발음 부분에서 더 연습이 필요합니다.",
          participationComment: "",
          understandingComment: "",
          pronunciationComment: "",
          grammarComment: "",
          vocabularyComment: "",
          speakingComment: "",
          listeningComment: "",
          readingComment: "",
          writingComment: "",
        },
      });
      setLoading(false);
    }, 1000);
  }, [selectedDate]);

  // 날짜 변경 시 수업 목록 업데이트
  useEffect(() => {
    const classes = getClassesByDate(selectedDate);
    setAvailableClasses(classes);
    setSelectedClass(null); // 날짜가 변경되면 선택된 수업 초기화
  }, [selectedDate]);

  // 키보드 단축키 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault();
            formatText("bold");
            break;
          case "v":
            e.preventDefault();
            formatText("paste");
            break;
          case "c":
            e.preventDefault();
            formatText("copy");
            break;
        }
      }

      if (e.ctrlKey && e.shiftKey) {
        switch (e.key) {
          case "J":
          case "j":
            e.preventDefault();
            insertText("←");
            break;
          case "L":
          case "l":
            e.preventDefault();
            insertText("→");
            break;
          case "I":
          case "i":
            e.preventDefault();
            insertText("↑");
            break;
          case "K":
          case "k":
            e.preventDefault();
            insertText("↓");
            break;
          case "C":
          case "c":
            e.preventDefault();
            setShowColorPicker(!showColorPicker);
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showColorPicker]);

  const insertText = (text: string) => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        editorRef.current.focus();
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 실제 API 호출로 대체
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 학생 노트에 반영
      if (lessonNote && selectedClass) {
        // 여기서 실제 API를 호출하여 학생 노트를 업데이트
        console.log("학생 노트 업데이트:", {
          studentName: selectedClass.studentName,
          date: selectedDate,
          content: lessonNote.content,
          todayLesson: lessonNote.todayLesson,
          nextLesson: lessonNote.nextLesson,
          homework: lessonNote.homework,
          evaluation: lessonNote.evaluation,
        });
      }

      alert("수업 노트가 저장되었습니다. 학생 노트에도 반영되었습니다.");
    } catch (error) {
      alert("저장에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    setShowPrintPreview(true);
    setTimeout(() => {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>수업 노트</title>
            <style>
              @media print {
                @page {
                  margin: 1cm;
                  size: A4 landscape;
                }
                body {
                  font-family: Arial, sans-serif;
                  font-size: 14px;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #333;
                  padding-bottom: 10px;
                }
                .content {
                  margin-top: 20px;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>수업 노트</h1>
              <p>${new Date().toLocaleDateString("ko-KR")}</p>
            </div>
            <div class="content">
              ${lessonNote?.content || ""}
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
      setShowPrintPreview(false);
    }, 100);
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const updateEvaluation = (field: string, value: number | string) => {
    if (!lessonNote) return;
    setLessonNote({
      ...lessonNote,
      evaluation: {
        ...lessonNote.evaluation,
        [field]: value,
      },
    });
  };

  const toggleHomework = () => {
    if (!lessonNote) return;
    setLessonNote({
      ...lessonNote,
      homework: {
        ...lessonNote.homework,
        hasHomework: !lessonNote.homework.hasHomework,
      },
    });
  };

  const updateHomework = (field: string, value: string) => {
    if (!lessonNote) return;
    setLessonNote({
      ...lessonNote,
      homework: {
        ...lessonNote.homework,
        [field]: value,
      },
    });
  };

  const openCommentModal = (field: string) => {
    setCurrentEvaluationField(field);
    setShowCommentModal(true);
  };

  const saveComment = () => {
    if (!lessonNote || !currentEvaluationField) return;
    const comment =
      (document.getElementById("commentInput") as HTMLTextAreaElement)?.value ||
      "";
    updateEvaluation(currentEvaluationField + "Comment", comment);
    setShowCommentModal(false);
  };

  const colorOptions = [
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
    "#008000",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        {/* Fullscreen Header */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={() => setIsFullscreen(false)}
            className="p-1 bg-gray-800 text-white rounded hover:bg-gray-700 text-xs"
            title="전체화면 해제"
          >
            <Minimize className="w-3 h-3" />
          </button>
        </div>

        {/* Fullscreen Editor */}
        <div className="h-full p-8">
          <div
            ref={editorRef}
            contentEditable
            className="h-full w-full outline-none text-2xl leading-relaxed p-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            style={{ fontSize: "18px", lineHeight: "1.8" }}
            dangerouslySetInnerHTML={{ __html: lessonNote?.content || "" }}
            onInput={(e) => {
              if (lessonNote) {
                setLessonNote({
                  ...lessonNote,
                  content: e.currentTarget.innerHTML,
                });
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/home"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로가기</span>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">수업 노트 편집</h1>
            <p className="text-gray-600">
              {selectedClass
                ? `${selectedClass.studentName} - ${selectedClass.time} (${selectedClass.subject})`
                : "수업 선택 필요"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            title="전체화면 모드"
          >
            <Maximize className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "수업 종료 및 저장"}
          </button>
        </div>
      </div>

      {/* 날짜 선택 */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">
            날짜 선택:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => setShowClassSelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            수업 선택
          </button>
        </div>
      </div>

      {/* 수업 선택 모달 */}
      {showClassSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {selectedDate} 수업 선택
            </h3>
            {availableClasses.length > 0 ? (
              <div className="space-y-3">
                {availableClasses.map((classItem) => (
                  <button
                    key={classItem.time}
                    onClick={() => {
                      setSelectedClass(classItem);
                      setShowClassSelector(false);
                    }}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="font-medium text-gray-900">
                      {classItem.studentName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {classItem.time} - {classItem.subject}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">해당 날짜에 수업이 없습니다</p>
              </div>
            )}
            <button
              onClick={() => setShowClassSelector(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 수업이 없는 경우 */}
      {!selectedClass && availableClasses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            해당 날짜에 수업이 없습니다
          </h3>
          <p className="text-gray-600 mb-4">
            선택한 날짜에 예정된 수업이 없어 노트를 작성할 수 없습니다.
          </p>
          <Link
            href="/teacher/home"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            돌아가기
          </Link>
        </div>
      )}

      {/* 수업이 있지만 선택되지 않은 경우 */}
      {!selectedClass && availableClasses.length > 0 && (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            수업을 선택해주세요
          </h3>
          <p className="text-gray-600 mb-4">
            해당 날짜에 {availableClasses.length}개의 수업이 있습니다.
          </p>
          <button
            onClick={() => setShowClassSelector(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            수업 선택하기
          </button>
        </div>
      )}

      {selectedClass && lessonNote && (
        <>
          {/* 이전 수업 내용 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              오늘 해야 할 수업 내용
            </h3>
            <p className="text-blue-800">{lessonNote.nextLesson}</p>
            {lessonNote.homework.hasHomework && (
              <div className="mt-2">
                <h4 className="font-medium text-blue-900">숙제</h4>
                <p className="text-blue-800">
                  {lessonNote.homework.studentHomework}
                </p>
              </div>
            )}
          </div>

          {/* 이전 수업 메모 표시 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">
              이전 수업 메모
            </h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-yellow-800">
                  다음 수업 내용:
                </span>
                <p className="text-yellow-800">
                  {lessonNote.nextLesson || "메모가 없습니다."}
                </p>
              </div>
              {lessonNote.homework.hasHomework && (
                <div>
                  <span className="text-sm font-medium text-yellow-800">
                    이전 숙제:
                  </span>
                  <p className="text-yellow-800">
                    {lessonNote.homework.studentHomework}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 편집 도구 */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => formatText("bold")}
                className="p-2 hover:bg-gray-100 rounded"
                title="굵게 (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText("italic")}
                className="p-2 hover:bg-gray-100 rounded"
                title="기울임"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText("underline")}
                className="p-2 hover:bg-gray-100 rounded"
                title="밑줄"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={() => formatText("justifyLeft")}
                className="p-2 hover:bg-gray-100 rounded"
                title="왼쪽 정렬"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText("justifyCenter")}
                className="p-2 hover:bg-gray-100 rounded"
                title="가운데 정렬"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText("justifyRight")}
                className="p-2 hover:bg-gray-100 rounded"
                title="오른쪽 정렬"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={() => formatText("insertUnorderedList")}
                className="p-2 hover:bg-gray-100 rounded"
                title="글머리 기호"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => formatText("insertOrderedList")}
                className="p-2 hover:bg-gray-100 rounded"
                title="번호 매기기"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-300"></div>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="p-2 hover:bg-gray-100 rounded"
                title="글자 색 (Ctrl+Shift+C)"
              >
                <Palette className="w-4 h-4" />
              </button>
              <div className="text-xs text-gray-500">
                화살표: Ctrl+Shift+J(←) L(→) I(↑) K(↓)
              </div>
            </div>

            {showColorPicker && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <div className="flex gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        formatText("foreColor", color);
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 노트 편집기 */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div
              ref={editorRef}
              contentEditable
              className="min-h-[400px] p-4 outline-none text-base leading-relaxed"
              dangerouslySetInnerHTML={{ __html: lessonNote.content }}
              onInput={(e) => {
                setLessonNote({
                  ...lessonNote,
                  content: e.currentTarget.innerHTML,
                });
              }}
            />
          </div>

          {/* 오늘 낸 레슨 & 다음 레슨 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-2">오늘 낸 레슨</h3>
              <textarea
                value={lessonNote.todayLesson}
                onChange={(e) =>
                  setLessonNote({
                    ...lessonNote,
                    todayLesson: e.target.value,
                  })
                }
                className="w-full h-24 p-2 border border-gray-300 rounded resize-none"
                placeholder="오늘 진행한 레슨 내용을 간단히 요약해주세요"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="font-semibold text-gray-900 mb-2">다음 레슨</h3>
              <textarea
                value={lessonNote.nextLesson}
                onChange={(e) =>
                  setLessonNote({
                    ...lessonNote,
                    nextLesson: e.target.value,
                  })
                }
                className="w-full h-24 p-2 border border-gray-300 rounded resize-none"
                placeholder="다음 레슨에서 진행할 내용을 간단히 적어주세요"
              />
            </div>
          </div>

          {/* 숙제 */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">숙제</h3>
              <div className="flex gap-2">
                <button
                  onClick={toggleHomework}
                  className={`px-3 py-1 rounded text-sm ${
                    lessonNote.homework.hasHomework
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {lessonNote.homework.hasHomework ? "있음" : "없음"}
                </button>
              </div>
            </div>

            {lessonNote.homework.hasHomework && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    선생님 숙제
                  </label>
                  <textarea
                    value={lessonNote.homework.teacherHomework}
                    onChange={(e) =>
                      updateHomework("teacherHomework", e.target.value)
                    }
                    className="w-full h-20 p-2 border border-gray-300 rounded resize-none"
                    placeholder="선생님이 준비해야 할 숙제 내용"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    학생 숙제
                  </label>
                  <textarea
                    value={lessonNote.homework.studentHomework}
                    onChange={(e) =>
                      updateHomework("studentHomework", e.target.value)
                    }
                    className="w-full h-20 p-2 border border-gray-300 rounded resize-none"
                    placeholder="학생이 해야 할 숙제 내용"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 수업 평가 */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold text-gray-900 mb-4">수업 평가</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: "participation", label: "참여도" },
                { key: "understanding", label: "이해도" },
                { key: "pronunciation", label: "발음" },
                { key: "grammar", label: "문법" },
                { key: "vocabulary", label: "어휘" },
                { key: "speaking", label: "회화" },
                { key: "listening", label: "듣기" },
                { key: "reading", label: "읽기" },
                { key: "writing", label: "쓰기" },
              ].map((item) => (
                <div key={item.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {item.label}
                    </span>
                    <button
                      onClick={() => openCommentModal(item.key)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      코멘트
                    </button>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => updateEvaluation(item.key, star)}
                        className={`p-1 ${
                          (lessonNote.evaluation[
                            item.key as keyof typeof lessonNote.evaluation
                          ] as number) >= star
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                전체 평가 코멘트
              </label>
              <textarea
                value={lessonNote.evaluation.comments}
                onChange={(e) => updateEvaluation("comments", e.target.value)}
                className="w-full h-20 p-2 border border-gray-300 rounded resize-none"
                placeholder="전체적인 수업 평가를 작성해주세요"
              />
            </div>
          </div>
        </>
      )}

      {/* 코멘트 모달 */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentEvaluationField} 코멘트
            </h3>
            <textarea
              id="commentInput"
              defaultValue={
                lessonNote?.evaluation[
                  (currentEvaluationField +
                    "Comment") as keyof typeof lessonNote.evaluation
                ] as string
              }
              className="w-full h-32 p-2 border border-gray-300 rounded resize-none"
              placeholder="상세한 코멘트를 작성해주세요"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={saveComment}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                저장
              </button>
              <button
                onClick={() => setShowCommentModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 인쇄 미리보기 */}
      {showPrintPreview && (
        <div className="fixed inset-0 bg-white z-50 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">수업 노트</h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString("ko-KR")}
              </p>
            </div>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: lessonNote?.content || "" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
