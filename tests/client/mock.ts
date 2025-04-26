import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export const instanceNormal = axios.create();
export const instanceDelay = axios.create();
const mock = new MockAdapter(instanceNormal);
const mockDelay = new MockAdapter(instanceDelay, {
  delayResponse: 20000,
});

// 成功的模拟响应
const defineSuccess = () => {
  // GET 请求匹配 /api/chunks? 开头的任何路径
  mock.onGet(/\/api\/chunks/).reply(() => [
    200,
    {
      code: 200,
      data: [],
      message: "",
    },
  ]);

  // POST 请求到 /api/uploadchunk
  mock.onPost("/api/uploadchunk").reply(200, {
    code: 200,
    data: [],
    message: "",
  });

  // POST 请求到 /api/mergechunks
  mock.onPost("/api/mergechunks").reply(200, {
    code: 200,
    data: [],
    message: "",
  });
};

// 失败的模拟响应
const defineFail = () => {
  // GET 请求匹配 /api/chunks/fail? 开头的任何路径
  mock.onGet(/\/api\/chunks\/fail/).reply(200, {
    code: 400,
    data: [],
    message: "",
  });

  // POST 请求到 /api/uploadchunk/fail
  mock.onPost("/api/uploadchunk/fail").reply(200, {
    code: 400,
    message: "",
  });

  // POST 请求到 /api/mergechunks/fail
  mock.onPost("/api/mergechunks/fail").reply(200, {
    code: 400,
    message: "",
  });
};

// 延迟响应
const defineLongTime = () => {
  // GET 请求匹配 /api/chunks/longtime? 开头的任何路径，并延迟2秒响应
  mockDelay.onGet("/api/chunks/longtime").reply(
    200,
    {
      code: 200,
      data: [],
    },
    {
      mockDelay: 2000,
    }
  );

  // POST 请求到 /api/uploadchunk/longtime 并延迟2秒响应
  mock.onPost("/api/uploadchunk/longtime").reply(200, {
    code: 200,
    data: [],
  });

  // POST 请求到 /api/mergechunks/longtime 并延迟2秒响应
  mock.onPost("/api/mergechunks/longtime").reply(200, {
    code: 200,
    data: [],
  });
};

defineSuccess();
defineFail();
defineLongTime();
