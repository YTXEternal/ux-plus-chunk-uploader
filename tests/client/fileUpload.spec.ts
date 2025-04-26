import { describe, expect, it, vi, test } from "vitest";
import { useUploader, type ERROR_RESPOSE, Options } from "@/index";
import { instanceNormal } from "./mock";
const createLargeFile = (sizeInBytes: number) => {
  // 创建一个指定大小的 ArrayBuffer
  const arrayBuffer = new ArrayBuffer(sizeInBytes);
  // 创建一个视图以便我们可以填充数据
  const view = new Uint8Array(arrayBuffer);
  // 填充一些示例数据
  for (let i = 0; i < sizeInBytes; ++i) {
    view[i] = i % 256;
  }
  // 使用这个 ArrayBuffer 创建一个 Blob 或 File 对象
  return new File([view], "largefile.dat", {
    type: "application/octet-stream",
  });
};

const config: Options = {
  // 请求配置
  requestConfig: {
    // 获取已缓存切片接口
    getChunks: {
      url: "/api/chunks",
      onResponse(r) {
        return r.data;
      },
      setParams(hash) {
        return {
          hash,
        };
      },
    },
    // 上传切片接口
    uploadChunk: {
      url: "/api/uploadchunk",
      onResponse(r) {
        return r.data.code;
      },
      setParams(r) {
        return r;
      },
    },
    // 合并切片接口
    merge: {
      url: "/api/mergechunks",
      onResponse(r) {
        return r.data.code;
      },
      setParams(r) {
        return r;
      },
    },
    instance: instanceNormal,
  },
  // 全局上传文件配置
  uploadConfig: {
    // 每个切片大小（MB)
    chunkSize: 100,
    // 并发上传切片数
    limit: 5,
    // 最大分片数
    max: 100,
  },
};
// retain it
// const useRevertConfigUrl = (opt:{get:string;upload:string;merge:string},instance?:Options['requestConfig']['instance']) =>  {
//    const option:Options =  {
//      ...config,
//      requestConfig:{
//         getChunks:{...config.requestConfig.getChunks} as Options['requestConfig']['getChunks'],
//         uploadChunk:{...config.requestConfig.uploadChunk},
//         merge:{...config.requestConfig.merge},
//         instance:instanceNormal
//      }
//    };
//    option.requestConfig.getChunks!.url = opt.get;
//    option.requestConfig.uploadChunk.url = opt.upload;
//    option.requestConfig.merge.url = opt.merge;
//    if(instance) {
//     option.requestConfig.instance = instance;
//    }
//    return option;
// };

const file = createLargeFile(125036);

describe("useUploader", () => {
  it("onSuccess", async () => {
    const { trigger, onSuccess } = useUploader(config);
    const mockFn = vi.fn();
    onSuccess(mockFn);
    await trigger(file);
    expect(mockFn).toHaveBeenCalled();
  });
  it("onFinally", async () => {
    const { trigger, onFinally } = useUploader(config);
    const mockFn = vi.fn();
    onFinally(mockFn);
    await trigger(file);
    expect(mockFn).toHaveBeenCalled();
  });
  it("onProgress", async () => {
    const { trigger } = useUploader(config);
    const mockProgress = vi.fn();
    await trigger(file, {
      onProgress: mockProgress,
    });
    expect(mockProgress).toHaveBeenCalled();
  });
  it("abort", async () => {
    const { trigger, abort } = useUploader(config);
    try {
      await trigger(file, {
        onProgress() {
          abort();
        },
      });
    } catch (e) {
      const err = e as ERROR_RESPOSE;
      expect(err.type).toBe("terminate-upload");
    }
  });

  test("All of it", async () => {
    try {
      const { trigger, onFinally, onSuccess } = useUploader(config);
      const mockSuccess = vi.fn();
      const mockOnProgress = vi.fn();
      const mockFinally = vi.fn();
      onSuccess(mockSuccess);
      onFinally(mockFinally);
      await trigger(file, {
        onProgress: mockOnProgress,
      });
      expect(mockSuccess).toHaveBeenCalled();
      expect(mockFinally).toHaveBeenCalled();
      expect(mockOnProgress).toHaveBeenCalled();
    } catch (e) {
      const err = e as ERROR_RESPOSE;
      expect(err.reason).toBe("This is an error");
    }
  });
});

describe("Wrong boundary", () => {
  it("file is not a valid value", async () => {
    const { trigger, onFail } = useUploader(config);
    const mockFail = vi.fn();
    try {
      onFail(mockFail);
      // @ts-ignore
      const r = await trigger(void 0);
      expect(r).toBe(void 0);
    } catch (e) {
      const err = e as ERROR_RESPOSE;
      expect(err.reason).toBe("file is not a valid value");
      expect(mockFail).toHaveBeenCalled();
    }
  });
  it("Environment without Web Workers", async () => {
    const Worker = window.Worker;
    // @ts-ignore
    window.Worker = null;
    try {
      const { trigger, onSuccess } = useUploader(config);
      const mockSuccess = vi.fn();
      onSuccess(mockSuccess);
      await trigger(file);
      expect(mockSuccess).toHaveBeenCalled();
    } catch (e) {
      const err = e as ERROR_RESPOSE;
      expect(err.reason).toBe("This is an error");
    }
    window.Worker = Worker;
  });
});
