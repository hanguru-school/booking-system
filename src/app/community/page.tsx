"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Heart,
  BookOpen,
  Calendar,
  Search,
  Filter,
  Plus,
  Flag,
  User,
  Bell,
  ChevronRight,
  Send,
  Share,
  Eye,
  X,
  HelpCircle,
} from "lucide-react";

interface Post {
  id: string;
  category:
    | "introduction"
    | "daily-phrase"
    | "question"
    | "study-share"
    | "class-notice";
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: "student" | "teacher" | "admin";
    badge: string;
    level: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt?: string;
  likes: number;
  comments: Comment[];
  isPinned: boolean;
  isHighlighted: boolean;
  tags: string[];
  attachments?: {
    type: "image" | "audio" | "video";
    url: string;
    name: string;
  }[];
  viewCount: number;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: "student" | "teacher" | "admin";
    badge: string;
  };
  createdAt: string;
  likes: number;
  isTeacherComment: boolean;
}

interface User {
  id: string;
  name: string;
  role: "student" | "teacher" | "admin";
  badge: string;
  level: string;
  points: number;
  rank: number;
  avatar?: string;
  joinDate: string;
  postCount: number;
  commentCount: number;
  likeCount: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requiredPoints: number;
  color: string;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<
    | "all"
    | "introduction"
    | "daily-phrase"
    | "question"
    | "study-share"
    | "class-notice"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "ranking" | "badges">(
    "posts",
  );

  const categories = [
    { id: "all", name: "전체", icon: <MessageSquare className="w-4 h-4" /> },
    {
      id: "introduction",
      name: "자기소개",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "daily-phrase",
      name: "오늘의 한마디",
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: "question",
      name: "질문 게시판",
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: "study-share",
      name: "학습 공유",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: "class-notice",
      name: "수업 공지",
      icon: <Bell className="w-4 h-4" />,
    },
  ];

  const badges: Badge[] = [
    {
      id: "beginner",
      name: "초보자",
      icon: "🔰",
      description: "처음 시작한 학생",
      requiredPoints: 0,
      color: "bg-gray-100 text-gray-800",
    },
    {
      id: "learner",
      name: "학습자",
      icon: "📘",
      description: "꾸준히 학습하는 학생",
      requiredPoints: 50,
      color: "bg-blue-100 text-blue-800",
    },
    {
      id: "challenger",
      name: "도전자",
      icon: "💪",
      description: "적극적으로 도전하는 학생",
      requiredPoints: 100,
      color: "bg-green-100 text-green-800",
    },
    {
      id: "top-class",
      name: "탑클래스",
      icon: "🏅",
      description: "최고 수준의 학생",
      requiredPoints: 200,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      id: "master",
      name: "마스터",
      icon: "🎓",
      description: "완벽한 마스터",
      requiredPoints: 500,
      color: "bg-purple-100 text-purple-800",
    },
  ];

  // Mock data initialization
  useEffect(() => {
    const initializeData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockUsers: User[] = [
        {
          id: "USER001",
          name: "김학생",
          role: "student",
          badge: "challenger",
          level: "A-2",
          points: 150,
          rank: 1,
          joinDate: "2024-01-01",
          postCount: 15,
          commentCount: 45,
          likeCount: 120,
        },
        {
          id: "USER002",
          name: "이선생님",
          role: "teacher",
          badge: "master",
          level: "C-3",
          points: 800,
          rank: 2,
          joinDate: "2023-06-01",
          postCount: 25,
          commentCount: 150,
          likeCount: 300,
        },
        {
          id: "USER003",
          name: "박학생",
          role: "student",
          badge: "learner",
          level: "B-1",
          points: 80,
          rank: 3,
          joinDate: "2024-02-01",
          postCount: 8,
          commentCount: 20,
          likeCount: 60,
        },
      ];

      const mockPosts: Post[] = [
        {
          id: "POST001",
          category: "introduction",
          title: "안녕하세요! 처음 뵙겠습니다",
          content:
            "한국어를 배우기 시작한 지 3개월이 되었습니다. 여러분과 함께 즐겁게 공부하고 싶어요!",
          author: mockUsers[0],
          createdAt: "2024-01-15T10:00:00Z",
          likes: 12,
          comments: [
            {
              id: "COMMENT001",
              content: "환영합니다! 함께 열심히 공부해요 😊",
              author: mockUsers[1],
              createdAt: "2024-01-15T10:30:00Z",
              likes: 5,
              isTeacherComment: true,
            },
          ],
          isPinned: false,
          isHighlighted: false,
          tags: ["자기소개", "초보자"],
          viewCount: 45,
        },
        {
          id: "POST002",
          category: "daily-phrase",
          title: '오늘 배운 표현: "정말 맛있어요!"',
          content:
            '오늘 수업에서 음식에 대한 표현을 배웠어요. "정말 맛있어요!"라는 표현을 연습해보세요!',
          author: mockUsers[1],
          createdAt: "2024-01-15T09:00:00Z",
          likes: 25,
          comments: [
            {
              id: "COMMENT002",
              content: "정말 맛있어요! 연습해보겠습니다!",
              author: mockUsers[0],
              createdAt: "2024-01-15T09:15:00Z",
              likes: 3,
              isTeacherComment: false,
            },
          ],
          isPinned: true,
          isHighlighted: true,
          tags: ["일상표현", "음식"],
          viewCount: 120,
        },
        {
          id: "POST003",
          category: "question",
          title: "~습니다와 ~어요의 차이점이 궁금해요",
          content:
            "~습니다와 ~어요의 사용법 차이점을 잘 모르겠어요. 언제 어떤 것을 사용해야 하나요?",
          author: mockUsers[2],
          createdAt: "2024-01-14T15:00:00Z",
          likes: 8,
          comments: [
            {
              id: "COMMENT003",
              content:
                "~습니다는 더 정중한 표현이고, ~어요는 친근한 표현입니다. 상황에 따라 선택하시면 됩니다!",
              author: mockUsers[1],
              createdAt: "2024-01-14T15:30:00Z",
              likes: 12,
              isTeacherComment: true,
            },
          ],
          isPinned: false,
          isHighlighted: false,
          tags: ["문법", "질문"],
          viewCount: 67,
        },
      ];

      setUsers(mockUsers);
      setPosts(mockPosts);
      setCurrentUser(mockUsers[0]);
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const handlePostClick = (post: Post) => {
    setSelectedPost(post);
    setShowPostModal(true);
  };

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post,
      ),
    );
  };

  const handleCommentLike = (postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map((comment) =>
                comment.id === commentId
                  ? { ...comment, likes: comment.likes + 1 }
                  : comment,
              ),
            }
          : post,
      ),
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedPost || !currentUser) return;

    const newCommentObj: Comment = {
      id: `COMMENT${Date.now()}`,
      content: newComment,
      author: currentUser,
      createdAt: new Date().toISOString(),
      likes: 0,
      isTeacherComment: currentUser.role === "teacher",
    };

    setPosts((prev) =>
      prev.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              comments: [...post.comments, newCommentObj],
            }
          : post,
      ),
    );

    setNewComment("");
  };

  const getFilteredPosts = () => {
    let filtered = posts;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase()),
          ),
      );
    }

    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  const getCategoryName = (category: string) => {
    const cat = categories.find((c) => c.id === category);
    return cat ? cat.name : category;
  };

  const getBadgeInfo = (badgeId: string) => {
    return badges.find((badge) => badge.id === badgeId) || badges[0];
  };

  const getTopUsers = () => {
    return users.sort((a, b) => b.points - a.points).slice(0, 10);
  };

  const filteredPosts = getFilteredPosts();
  const topUsers = getTopUsers();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">커뮤니티를 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
              <p className="mt-2 text-gray-600">함께 배우고 성장하는 공간</p>
            </div>
            <div className="flex items-center space-x-4">
              {currentUser && (
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">
                    {currentUser.name}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeInfo(currentUser.badge).color}`}
                  >
                    {getBadgeInfo(currentUser.badge).icon}{" "}
                    {getBadgeInfo(currentUser.badge).name}
                  </span>
                  <span className="text-sm text-blue-700">
                    {currentUser.points}P
                  </span>
                </div>
              )}
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                글쓰기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Navigation Tabs */}
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
                </div>
                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab("posts")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "posts"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    게시판
                  </button>
                  <button
                    onClick={() => setActiveTab("ranking")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "ranking"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    랭킹
                  </button>
                  <button
                    onClick={() => setActiveTab("badges")}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
                      activeTab === "badges"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    배지
                  </button>
                </nav>
              </div>

              {/* Categories */}
              {activeTab === "posts" && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      카테고리
                    </h2>
                  </div>
                  <nav className="p-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          setSelectedCategory(
                            category.id as
                              | "introduction"
                              | "daily-phrase"
                              | "question"
                              | "study-share"
                              | "class-notice",
                          )
                        }
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 ${
                          selectedCategory === category.id
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {category.icon}
                        <span>{category.name}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {/* Top Users */}
              {activeTab === "ranking" && (
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      🏆 상위 랭킹
                    </h2>
                  </div>
                  <div className="p-4 space-y-3">
                    {topUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                                ? "bg-gray-100 text-gray-800"
                                : index === 2
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {user.name}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeInfo(user.badge).color}`}
                            >
                              {getBadgeInfo(user.badge).icon}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.points}P
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "posts" && (
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-64">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="게시글 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <button className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Posts List */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getCategoryName(selectedCategory)} 게시판
                    </h2>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {filteredPosts.length === 0 ? (
                      <div className="p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">게시글이 없습니다.</p>
                      </div>
                    ) : (
                      filteredPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => handlePostClick(post)}
                          className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                            post.isPinned ? "bg-yellow-50" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                {post.isPinned && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    📌 고정
                                  </span>
                                )}
                                <span className="text-sm text-gray-500">
                                  {getCategoryName(post.category)}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {new Date(
                                    post.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>

                              <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {post.title}
                              </h3>

                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {post.content}
                              </p>

                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4" />
                                  <span>{post.author.name}</span>
                                  <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeInfo(post.author.badge).color}`}
                                  >
                                    {getBadgeInfo(post.author.badge).icon}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Heart className="w-4 h-4" />
                                  <span>{post.likes}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{post.comments.length}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Eye className="w-4 h-4" />
                                  <span>{post.viewCount}</span>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "ranking" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    전체 랭킹
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {topUsers.map((user, index) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                            index === 0
                              ? "bg-yellow-100 text-yellow-800"
                              : index === 1
                                ? "bg-gray-100 text-gray-800"
                                : index === 2
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-medium text-gray-900">
                              {user.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getBadgeInfo(user.badge).color}`}
                            >
                              {getBadgeInfo(user.badge).icon}{" "}
                              {getBadgeInfo(user.badge).name}
                            </span>
                          </div>
                          <div className="flex items-center space-x-6 mt-2 text-sm text-gray-600">
                            <span>포인트: {user.points}P</span>
                            <span>게시글: {user.postCount}개</span>
                            <span>댓글: {user.commentCount}개</span>
                            <span>좋아요: {user.likeCount}개</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "badges" && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    배지 시스템
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="p-6 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl ${badge.color}`}
                          >
                            {badge.icon}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {badge.name}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {badge.description}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              필요 포인트: {badge.requiredPoints}P
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Detail Modal */}
      {showPostModal && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {getCategoryName(selectedPost.category)}
                  </span>
                  {selectedPost.isPinned && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      📌 고정
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowPostModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-3">
                {selectedPost.title}
              </h2>
              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{selectedPost.author.name}</span>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeInfo(selectedPost.author.badge).color}`}
                  >
                    {getBadgeInfo(selectedPost.author.badge).icon}
                  </span>
                </div>
                <span>
                  {new Date(selectedPost.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>{selectedPost.viewCount}</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>

              {/* Tags */}
              {selectedPost.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleLike(selectedPost.id)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{selectedPost.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    <Share className="w-4 h-4" />
                    <span>공유</span>
                  </button>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <Flag className="w-4 h-4" />
                  <span>신고</span>
                </button>
              </div>

              {/* Comments */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  댓글 ({selectedPost.comments.length})
                </h3>

                <div className="space-y-4 mb-6">
                  {selectedPost.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`p-4 rounded-lg ${
                        comment.isTeacherComment
                          ? "bg-blue-50 border border-blue-200"
                          : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">
                            {comment.author.name}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBadgeInfo(comment.author.badge).color}`}
                          >
                            {getBadgeInfo(comment.author.badge).icon}
                          </span>
                          {comment.isTeacherComment && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              선생님
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{comment.content}</p>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() =>
                            handleCommentLike(selectedPost.id, comment.id)
                          }
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                          <Heart className="w-4 h-4" />
                          <span>{comment.likes}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Comment */}
                {currentUser && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex space-x-3">
                      <div className="flex-1">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="댓글을 작성하세요..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
