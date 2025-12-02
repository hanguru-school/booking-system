import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";
import { cognitoConfig } from "./cognito-provider";

// Cognito User Pool 설정
const poolData = {
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId,
};

// Cognito User Pool 인스턴스 (기존 호환성을 위해 유지)
export const userPool = new CognitoUserPool(poolData);

// 개별 함수들 export
export const signIn = (username: string, password: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    });

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (result) => {
        resolve({
          success: true,
          accessToken: result.getAccessToken().getJwtToken(),
          idToken: result.getIdToken().getJwtToken(),
          refreshToken: result.getRefreshToken().getToken(),
        });
      },
      onFailure: (err) => {
        reject({
          success: false,
          error: err.message || "로그인에 실패했습니다.",
        });
      },
    });
  });
};

export const getCurrentUser = (): CognitoUser | null => {
  return userPool.getCurrentUser();
};

export const getSession = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getSession((err: any, session: any) => {
        if (err) {
          reject({
            success: false,
            error: err.message || "세션을 가져오는데 실패했습니다.",
          });
        } else if (session.isValid()) {
          resolve({
            success: true,
            session,
            accessToken: session.getAccessToken().getJwtToken(),
            idToken: session.getIdToken().getJwtToken(),
          });
        } else {
          reject({
            success: false,
            error: "세션이 유효하지 않습니다.",
          });
        }
      });
    } else {
      reject({
        success: false,
        error: "로그인된 사용자가 없습니다.",
      });
    }
  });
};

export const getUserAttributes = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.getUserAttributes((err: any, attributes: any) => {
        if (err) {
          reject({
            success: false,
            error: err.message || "사용자 속성을 가져오는데 실패했습니다.",
          });
        } else {
          const userAttributes: any = {};
          attributes?.forEach((attr: any) => {
            userAttributes[attr.getName()] = attr.getValue();
          });
          resolve({
            success: true,
            attributes: userAttributes,
          });
        }
      });
    } else {
      reject({
        success: false,
        error: "로그인된 사용자가 없습니다.",
      });
    }
  });
};

export const signOut = (): void => {
  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }
};

// 기존 함수들 (호환성을 위해 유지)
export const cognitoAuth = {
  signIn,
  getCurrentUser,
  getSession,
  getUserAttributes,
  signOut,
};

// 새로운 Cognito Provider에서 함수들을 다시 export
export {
  createOAuthUrl,
  exchangeCodeForToken,
  parseIdToken,
  getRedirectUrlByRole,
  validateCognitoConfig,
  cognitoConfig,
} from "./cognito-provider";

export default cognitoAuth;
