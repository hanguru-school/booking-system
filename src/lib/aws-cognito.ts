import AWS from "aws-sdk";

// AWS Cognito 설정
const cognitoConfig = {
  region: process.env.AWS_REGION || "ap-northeast-2",
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID || "",
  clientId: process.env.AWS_COGNITO_CLIENT_ID || "",
  identityPoolId: process.env.AWS_COGNITO_IDENTITY_POOL_ID || "",
};

// AWS Cognito 서비스 클래스
export class CognitoService {
  private cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;
  private cognitoIdentity: AWS.CognitoIdentity;

  constructor() {
    // AWS 설정
    AWS.config.update({
      region: cognitoConfig.region,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.cognitoIdentityServiceProvider =
      new AWS.CognitoIdentityServiceProvider();
    this.cognitoIdentity = new AWS.CognitoIdentity();
  }

  // 사용자 등록
  async signUp(email: string, password: string, name: string, role: string) {
    try {
      const params = {
        ClientId: cognitoConfig.clientId,
        Username: email,
        Password: password,
        UserAttributes: [
          {
            Name: "email",
            Value: email,
          },
          {
            Name: "name",
            Value: name,
          },
          {
            Name: "custom:role",
            Value: role,
          },
        ],
      };

      const result = await this.cognitoIdentityServiceProvider
        .signUp(params)
        .promise();
      return {
        success: true,
        userId: result.UserSub,
        message: "사용자가 성공적으로 등록되었습니다.",
      };
    } catch (error) {
      console.error("Cognito signup error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  // 사용자 로그인
  async signIn(email: string, password: string) {
    try {
      const params = {
        AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
        UserPoolId: cognitoConfig.userPoolId,
        ClientId: cognitoConfig.clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
      };

      const result = await this.cognitoIdentityServiceProvider
        .initiateAuth(params)
        .promise();

      if (result.AuthenticationResult) {
        return {
          success: true,
          accessToken: result.AuthenticationResult.AccessToken,
          refreshToken: result.AuthenticationResult.RefreshToken,
          idToken: result.AuthenticationResult.IdToken,
          expiresIn: result.AuthenticationResult.ExpiresIn,
        };
      } else {
        return {
          success: false,
          message: "인증이 필요합니다.",
        };
      }
    } catch (error) {
      console.error("Cognito signin error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  // 토큰 검증
  async verifyToken(token: string) {
    try {
      const params = {
        AccessToken: token,
      };

      const result = await this.cognitoIdentityServiceProvider
        .getUser(params)
        .promise();

      return {
        success: true,
        user: {
          id: result.Username,
          email: result.UserAttributes?.find((attr) => attr.Name === "email")
            ?.Value,
          name: result.UserAttributes?.find((attr) => attr.Name === "name")
            ?.Value,
          role: result.UserAttributes?.find(
            (attr) => attr.Name === "custom:role",
          )?.Value,
        },
      };
    } catch (error) {
      console.error("Cognito token verification error:", error);
      return {
        success: false,
        message: "토큰이 유효하지 않습니다.",
      };
    }
  }

  // 비밀번호 변경
  async changePassword(
    accessToken: string,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      const params = {
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
      };

      await this.cognitoIdentityServiceProvider
        .changePassword(params)
        .promise();

      return {
        success: true,
        message: "비밀번호가 성공적으로 변경되었습니다.",
      };
    } catch (error) {
      console.error("Cognito password change error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  // 사용자 정보 업데이트
  async updateUserAttributes(
    accessToken: string,
    attributes: Record<string, string>,
  ) {
    try {
      const userAttributes = Object.entries(attributes).map(([key, value]) => ({
        Name: key,
        Value: value,
      }));

      const params = {
        AccessToken: accessToken,
        UserAttributes: userAttributes,
      };

      await this.cognitoIdentityServiceProvider
        .updateUserAttributes(params)
        .promise();

      return {
        success: true,
        message: "사용자 정보가 업데이트되었습니다.",
      };
    } catch (error) {
      console.error("Cognito user update error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  // 사용자 삭제
  async deleteUser(accessToken: string) {
    try {
      const params = {
        AccessToken: accessToken,
      };

      await this.cognitoIdentityServiceProvider.deleteUser(params).promise();

      return {
        success: true,
        message: "사용자가 삭제되었습니다.",
      };
    } catch (error) {
      console.error("Cognito user deletion error:", error);
      return {
        success: false,
        message: this.getErrorMessage(error),
      };
    }
  }

  // 에러 메시지 변환
  private getErrorMessage(error: any): string {
    if (error.code === "NotAuthorizedException") {
      return "이메일 또는 비밀번호가 올바르지 않습니다.";
    } else if (error.code === "UserNotFoundException") {
      return "사용자를 찾을 수 없습니다.";
    } else if (error.code === "UsernameExistsException") {
      return "이미 존재하는 이메일입니다.";
    } else if (error.code === "InvalidPasswordException") {
      return "비밀번호가 요구사항을 충족하지 않습니다.";
    } else if (error.code === "ExpiredTokenException") {
      return "토큰이 만료되었습니다. 다시 로그인해주세요.";
    } else {
      return "오류가 발생했습니다. 다시 시도해주세요.";
    }
  }
}

// 싱글톤 인스턴스
export const cognitoService = new CognitoService();
