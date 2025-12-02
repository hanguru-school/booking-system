const {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
require("dotenv").config({ path: ".env.local" });

// AWS Cognito 클라이언트 설정
const client = new CognitoIdentityProviderClient({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const USER_POOL_ID = "ap-northeast-2_5R7g8tN40";

async function createCognitoUser(email, password, name, role = "STUDENT") {
  try {
    console.log(`Cognito 사용자 생성 중: ${email}`);

    // 사용자 생성
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      UserAttributes: [
        {
          Name: "email",
          Value: email,
        },
        {
          Name: "email_verified",
          Value: "true",
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
      MessageAction: "SUPPRESS", // 환영 이메일 발송 안함
    });

    const createResult = await client.send(createUserCommand);
    console.log("사용자 생성 성공:", createResult.User.Username);

    // 비밀번호 설정
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: password,
      Permanent: true, // 영구 비밀번호
    });

    await client.send(setPasswordCommand);
    console.log("비밀번호 설정 성공");

    console.log(`✅ Cognito 사용자 생성 완료: ${email}`);
    console.log(`   - 이름: ${name}`);
    console.log(`   - 역할: ${role}`);
    console.log(`   - 비밀번호: ${password}`);
  } catch (error) {
    if (error.name === "UsernameExistsException") {
      console.log(`⚠️  사용자가 이미 존재합니다: ${email}`);
    } else {
      console.error("❌ Cognito 사용자 생성 실패:", error);
    }
  }
}

async function createTestUsers() {
  console.log("=== Cognito 테스트 사용자 생성 ===\n");

  // 테스트 사용자들
  const testUsers = [
    {
      email: "student@test.com",
      password: "Student1234!",
      name: "田中太郎 (たなかたろう) / 홍길동",
      role: "STUDENT",
    },
    {
      email: "parent@test.com",
      password: "Parent1234!",
      name: "田中花子 (たなかはなこ) / 홍길순",
      role: "PARENT",
    },
    {
      email: "teacher@test.com",
      password: "Teacher1234!",
      name: "山田先生 (やまだせんせい) / 김선생",
      role: "TEACHER",
    },
    {
      email: "staff@test.com",
      password: "Staff1234!",
      name: "佐藤職員 (さとうしょくいん) / 박직원",
      role: "STAFF",
    },
    {
      email: "admin@test.com",
      password: "Admin1234!",
      name: "管理者太郎 (かんりしゃたろう) / 관리자",
      role: "ADMIN",
    },
  ];

  for (const user of testUsers) {
    await createCognitoUser(user.email, user.password, user.name, user.role);
    console.log(""); // 빈 줄 추가
  }

  console.log("=== 모든 테스트 사용자 생성 완료 ===");
  console.log("\n📋 테스트 계정 목록:");
  testUsers.forEach((user) => {
    console.log(`   - ${user.email} / ${user.password} (${user.role})`);
  });
  console.log("\n🔗 테스트 페이지: http://localhost:3000/test-cognito");
}

// 스크립트 실행
if (require.main === module) {
  createTestUsers().catch(console.error);
}

module.exports = { createCognitoUser, createTestUsers };
