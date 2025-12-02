import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
// import nodemailer from "nodemailer"; // 실제 구현 시 사용

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, signatureData, isMinor } = body;

    // 학생 찾기
    const student = await prisma.student.findUnique({
      where: { studentId },
    });

    if (!student) {
      return NextResponse.json(
        { error: "학생을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 실제로는 nodemailer를 사용하여 이메일 전송
    // 현재는 로그만 출력
    console.log("문서 전송 요청:", {
      studentId,
      email: student.email,
      isMinor,
    });

    // 입회 완료 처리
    await prisma.student.update({
      where: { studentId },
      data: {
        enrollmentStatus: "COMPLETED",
      },
    });

    // TODO: 실제 이메일 전송 로직
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: student.email,
      subject: '입회 서류 안내 - MalMoi 한국어교실',
      html: `
        <h1>입회 서류가 준비되었습니다</h1>
        <p>학번: ${studentId}</p>
        <p>이름: ${student.kanjiName}</p>
        <p>첨부된 서류를 확인해주세요.</p>
      `,
    });
    */

    return NextResponse.json({
      success: true,
      message: "문서가 이메일로 전송되었습니다.",
    });
  } catch (error) {
    console.error("문서 전송 오류:", error);
    return NextResponse.json(
      { error: "문서 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}






