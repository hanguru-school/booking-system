import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getUserAttributes } from "@/lib/cognito";

export async function GET(request: NextRequest) {
  try {
    console.log("=== Cognito 세션 확인 API 호출됨 ===");

    try {
      // Cognito에서 현재 사용자 정보 가져오기
      const user = await getCurrentUser();
      console.log("Cognito 사용자 정보:", user);

      // 사용자 속성 가져오기
      let userAttributes;
      try {
        userAttributes = await getUserAttributes();
        console.log("사용자 속성:", userAttributes);
      } catch (attrError) {
        console.log("사용자 속성 가져오기 실패:", attrError);
        userAttributes = {};
      }

      return NextResponse.json({
        success: true,
        message: "세션 정보를 성공적으로 조회했습니다.",
        data: {
          authenticated: true,
          user: {
            ...user,
            attributes: userAttributes,
          },
        },
      });
    } catch (sessionError: any) {
      console.log("Cognito 세션 오류:", sessionError.message);

      return NextResponse.json(
        {
          success: false,
          message: "로그인이 필요합니다.",
          data: {
            authenticated: false,
          },
        },
        { status: 401 },
      );
    }
  } catch (error) {
    console.error("세션 확인 API 오류:", error);
    return NextResponse.json(
      {
        success: false,
        message: "세션 확인 중 오류가 발생했습니다.",
        data: {
          authenticated: false,
        },
      },
      { status: 500 },
    );
  }
}
