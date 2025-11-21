export async function apiRequest(url, options = {}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // 204 No Content 처리
    if (response.status === 204) return null;

    // 텍스트 먼저 읽고 JSON 변환
    const text = await response.text();
    let result;
    try {
      result = text ? JSON.parse(text) : null;
    } catch {
      throw {
        code: "INVALID_JSON",
        message: `서버 응답을 JSON으로 파싱할 수 없습니다. Response: ${text}`,
        status: response.status,
      };
    }

    // HTTP error
    if (!response.ok) {
      throw {
        code: result?.error?.code || "HTTP_ERROR",
        message: result?.error?.message || result?.message || "서버 오류가 발생했습니다",
        status: response.status,
      };
    }

    // success=false 처리
    if (result?.success === false) {
      throw {
        code: result?.error?.code || "API_ERROR",
        message:
          result?.error?.message || result?.message || "요청 처리 중 문제가 발생했습니다",
        status: response.status,
      };
    }

    return result;
  } catch (err) {
    console.error("🔥 [apiRequest Catch]", err);

    if (err && typeof err === "object" && err.code && err.message) {
      throw err;
    }

    if (err instanceof Error) {
      throw {
        code: "JS_ERROR",
        message: err.message,
        status: null,
      };
    }

    throw {
      code: "UNKNOWN_ERROR",
      message: "알 수 없는 오류가 발생했습니다.",
      status: null,
    };
  }
}
