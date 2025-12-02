import AWS from "aws-sdk";

// AWS 결제 설정
const paymentConfig = {
  region: process.env.AWS_REGION || "ap-northeast-2",
  // 토스페이먼츠 연동을 위한 설정
  tossPayments: {
    secretKey: process.env.TOSS_PAYMENTS_SECRET_KEY || "",
    clientKey: process.env.TOSS_PAYMENTS_CLIENT_KEY || "",
    apiUrl: "https://api.tosspayments.com",
  },
};

// 결제 상태 타입
export type PaymentStatus =
  | "pending"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded";

// 결제 방법 타입
export type PaymentMethod =
  | "card"
  | "bank_transfer"
  | "virtual_account"
  | "phone";

// 결제 정보 인터페이스
export interface PaymentInfo {
  id: string;
  userId: string;
  reservationId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description: string;
  status: PaymentStatus;
  transactionId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  failedAt?: Date;
}

// AWS 결제 서비스 클래스
export class PaymentService {
  private sns: AWS.SNS;

  constructor() {
    // AWS 설정
    AWS.config.update({
      region: paymentConfig.region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.sns = new AWS.SNS();
  }

  // 토스페이먼츠 결제 요청
  async requestTossPayment(paymentData: {
    userId: string;
    reservationId?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    description: string;
    customerEmail: string;
    customerName: string;
  }) {
    try {
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const tossPaymentData = {
        amount: paymentData.amount,
        orderId: orderId,
        orderName: paymentData.description,
        customerName: paymentData.customerName,
        customerEmail: paymentData.customerEmail,
        successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
        failUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/fail`,
        paymentMethod: paymentData.paymentMethod,
      };

      // 토스페이먼츠 API 호출
      const response = await fetch(
        `${paymentConfig.tossPayments.apiUrl}/v1/payments`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(paymentConfig.tossPayments.secretKey + ":").toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tossPaymentData),
        },
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentId: orderId,
          paymentUrl: result.paymentUrl,
          transactionId: result.paymentKey,
          message: "결제 요청이 생성되었습니다.",
        };
      } else {
        return {
          success: false,
          message: result.message || "결제 요청에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("토스페이먼츠 결제 요청 오류:", error);
      return {
        success: false,
        message: "결제 요청 중 오류가 발생했습니다.",
      };
    }
  }

  // 토스페이먼츠 결제 승인
  async confirmTossPayment(
    paymentKey: string,
    orderId: string,
    amount: number,
  ) {
    try {
      const response = await fetch(
        `${paymentConfig.tossPayments.apiUrl}/v1/payments/${paymentKey}`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(paymentConfig.tossPayments.secretKey + ":").toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId,
            amount,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          transactionId: result.paymentKey,
          status: result.status,
          message: "결제가 성공적으로 완료되었습니다.",
        };
      } else {
        return {
          success: false,
          message: result.message || "결제 승인에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("토스페이먼츠 결제 승인 오류:", error);
      return {
        success: false,
        message: "결제 승인 중 오류가 발생했습니다.",
      };
    }
  }

  // 결제 취소
  async cancelPayment(paymentId: string, reason: string) {
    try {
      const response = await fetch(
        `${paymentConfig.tossPayments.apiUrl}/v1/payments/${paymentId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(paymentConfig.tossPayments.secretKey + ":").toString("base64")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancelReason: reason,
          }),
        },
      );

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: "결제가 취소되었습니다.",
        };
      } else {
        return {
          success: false,
          message: result.message || "결제 취소에 실패했습니다.",
        };
      }
    } catch (error) {
      console.error("결제 취소 오류:", error);
      return {
        success: false,
        message: "결제 취소 중 오류가 발생했습니다.",
      };
    }
  }

  // 결제 알림 발송
  async sendPaymentNotification(paymentInfo: PaymentInfo) {
    try {
      const message = {
        paymentId: paymentInfo.id,
        userId: paymentInfo.userId,
        amount: paymentInfo.amount,
        status: paymentInfo.status,
        timestamp: new Date().toISOString(),
      };

      const params = {
        Message: JSON.stringify(message),
        TopicArn: process.env.AWS_SNS_PAYMENT_TOPIC_ARN || "",
      };

      await this.sns.publish(params).promise();

      return {
        success: true,
        message: "결제 알림이 발송되었습니다.",
      };
    } catch (error) {
      console.error("결제 알림 발송 오류:", error);
      return {
        success: false,
        message: "결제 알림 발송에 실패했습니다.",
      };
    }
  }

  // 결제 내역 조회
  async getPaymentHistory(userId: string, startDate?: Date, endDate?: Date) {
    try {
      // 실제 구현에서는 데이터베이스에서 조회
      // 여기서는 시뮬레이션 데이터 반환
      const mockPayments: PaymentInfo[] = [
        {
          id: "payment_1",
          userId,
          amount: 50000,
          currency: "KRW",
          paymentMethod: "card",
          description: "강의실 예약 결제",
          status: "completed",
          transactionId: "txn_123456",
          createdAt: new Date(),
          completedAt: new Date(),
        },
      ];

      return {
        success: true,
        payments: mockPayments,
      };
    } catch (error) {
      console.error("결제 내역 조회 오류:", error);
      return {
        success: false,
        message: "결제 내역 조회 중 오류가 발생했습니다.",
      };
    }
  }

  // 결제 통계
  async getPaymentStatistics(startDate: Date, endDate: Date) {
    try {
      // 실제 구현에서는 데이터베이스에서 집계
      const statistics = {
        totalAmount: 1500000,
        totalCount: 30,
        successCount: 28,
        failedCount: 2,
        averageAmount: 50000,
        paymentMethods: {
          card: 20,
          bank_transfer: 8,
          virtual_account: 2,
        },
      };

      return {
        success: true,
        statistics,
      };
    } catch (error) {
      console.error("결제 통계 조회 오류:", error);
      return {
        success: false,
        message: "결제 통계 조회 중 오류가 발생했습니다.",
      };
    }
  }
}

// 싱글톤 인스턴스
export const paymentService = new PaymentService();
