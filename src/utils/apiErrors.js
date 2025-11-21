export const API_ERRORS = {
  // 인증
  MISSING_AUTH_TOKEN: "로그인이 필요합니다. 다시 로그인해주세요.",

  // 유저
  USER_NOT_FOUND: "사용자를 찾을 수 없습니다. 다시 로그인해주세요.",
  ALREADY_DELETED: "이미 탈퇴된 계정입니다.",

  // PATCH 전용
  NO_UPDATE_FIELDS: "수정할 항목이 없습니다. 닉네임 또는 비밀번호를 입력하세요.",

  // 서버 내부 오류
  INTERNAL_SERVER_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};
