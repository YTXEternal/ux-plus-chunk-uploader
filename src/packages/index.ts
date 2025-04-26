import axios from "axios";
import type {
  Options,
  ChunkUploader,
  UploadChunks,
  RawFile,
  UploaderConfig,
  RequestFunc,
  UploadError,
  Chunks,
  PrivateChunkUploaderProps,
  DeepPartial,
  SetParamsAssemble,
  ERROR_RESPOSE,
  _GetChunks,
} from "./types";
import {
  headers,
  objFor,
  callReject,
  isExistF,
  handleCanceledError,
} from "./shared";
import { useControl, useNextTick, useStoreTerminable } from "./hooks";
import {
  createChunks,
  clearRuntimeProduct,
  createHash,
} from "./modules/handles";
import { UPLOAD_ERROR_STATES } from "./constant";
import type { Terminable, TerminableTaskItem } from "./hooks/types";
export type { ERROR_RESPOSE, Options };

const initOptions = () => {
  const localOptions: DeepPartial<Options> = {
    requestConfig: {
      instance: axios.create(),
    },
    uploadConfig: {
      chunkSize: 100,
      max: 100,
      limit: 5,
    },
  };
  return localOptions as Options;
};

const setParamsAssemble: SetParamsAssemble = {
  getChunks(hash) {
    return {
      hash,
    };
  },
  uploadChunk(params) {
    return params;
  },
  merge(params) {
    return params;
  },
};

/**
 *
 * @class UxChunkUploader
 * @typedef {UxChunkUploader}
 * @implements {ChunkUploader}
 */
class UxChunkUploader implements ChunkUploader {
  options: Options | null = null;
  private _chunkcount: number = 0;
  private _progressGather: PrivateChunkUploaderProps["progressGather"] = {};
  private _requestFunc: PrivateChunkUploaderProps["requestFunc"] = null;
  private _control?: PrivateChunkUploaderProps["control"];
  $nextTick = useNextTick();
  private _terminable: Terminable = useStoreTerminable();
  private _mergechunkmutex = false;
  constructor(options: Options) {
    this.setOptions(options);
  }
  setOptions(options: DeepPartial<Options>) {
    if (!options) throw new TypeError("options is not a valid type");
    // 初始化默认配置
    !this.options && (this.options = initOptions());
    const opt = Object.assign(this.options, options) as Required<Options>;
    this.options = opt;
    const requestConfig = this.options!.requestConfig!;
    if (!requestConfig) return void 0;
    !requestConfig.instance && (requestConfig.instance = axios);

    // 初始化请求函数
    const initRequester = () => {
      const context = this;
      const getRequestConfig = () => context.options!.requestConfig;
      // 上传切片函数
      const uploadChunk: RequestFunc["uploadChunk"] = ({
        formData,
        url,
        taskIndex,
      }) =>
        new Promise((resolve, reject: (e: ERROR_RESPOSE) => void) => {
          const control = new AbortController();
          const _control = context._control!;
          const key = `${url}_${taskIndex}`;
          _control.insert(key, control.abort.bind(control));
          getRequestConfig().instance!<{
            code: number;
            data: any;
          }>({
            method: "POST",
            data: formData,
            url,
            headers,
            signal: control.signal,
          })
            .then((r) => {
              if (getRequestConfig().uploadChunk.onResponse) {
                return resolve(getRequestConfig()!.uploadChunk.onResponse!(r));
              }
              resolve(r.data.code);
            })
            .finally(() => {
              _control.del(key);
            })
            .catch(reject);
        });
      const localRequestFunc: RequestFunc = {
        merge(url, params) {
          const control = new AbortController();
          const f = isExistF(
            setParamsAssemble.merge,
            context.options!.requestConfig.merge.setParams
          );
          const _control = context._control!;
          _control.insert(url, control.abort.bind(control));
          const data = f(params);
          return getRequestConfig().instance!({
            method: "POST",
            url,
            data,
            signal: control.signal,
          }).then((r) => {
            if (getRequestConfig().merge?.onResponse)
              return Promise.resolve(getRequestConfig().merge!.onResponse!(r));
            return Promise.resolve(r.data.code);
          });
        },
        getChunk(url: string, hash: string) {
          const control = new AbortController();
          const _control = context._control!;
          _control.insert(url, control.abort.bind(control));
          const f = isExistF(
            setParamsAssemble.getChunks,
            getRequestConfig().getChunks?.setParams
          );
          return requestConfig.instance!<{
            code: number;
            data: any;
          }>({
            method: "get",
            url,
            signal: control.signal,
            params: f(hash),
          }).then((r) => {
            let isError = false;
            if (getRequestConfig().getChunks?.onResponse) {
              const authenticResponse =
                getRequestConfig().getChunks!.onResponse!(r);
              if (authenticResponse.code !== 200) isError = true;
            } else if (r.data.code !== 200) isError = true;
            if (isError) {
              return callReject({
                type: UPLOAD_ERROR_STATES.GET_CHUNKS_ERROR,
                reason: "The status code of getChunk is not 200",
              });
            }
            return Promise.resolve(r.data.data);
          });
        },
        uploadChunk,
      };
      this._requestFunc = localRequestFunc;
    };
    initRequester();
  }
  private _setOptions(options: Record<string, any>) {
    Object.assign(this, options);
  }
  private _uploadChunks({
    hash,
    chunks,
    limit = 4,
    filename,
    onProgress,
    count: localCount,
  }: Parameters<UploadChunks>[0]) {
    let count = localCount;
    const createErrorState = () => {
      const isError = {
        value: false,
      };
      const setError = () => {
        isError.value = true;
      };
      return {
        isError,
        setError,
      };
    };
    const { isError, setError } = createErrorState();
    const chks: Chunks = chunks;
    const context = this;
    context._mergechunkmutex = true;
    // 上传切片
    const upload = () =>
      new Promise(
        (
          resolve: (value: undefined) => void,
          reject: (err: Parameters<typeof callReject>[0]) => void
        ) => {
          // 没有分片直接结束去合并
          if (!chks.length) {
            return resolve(void 0);
          }
          const handleProgress = (v: number, chunkname: string) => {
            const r = context.computedProgress(v, chunkname);
            typeof onProgress === "function" ? onProgress(r) : void 0;
          };
          const chunksMap = chks.map((...args) => args[1]);
          const isRun = () => count !== 0 && !context._terminable.state;
          const f = isExistF(
            setParamsAssemble.uploadChunk,
            this.options!.requestConfig.uploadChunk.setParams
          );

          const useSharedError = (err: any, taskIndex: number) => ({
            type: UPLOAD_ERROR_STATES.UPLOAD_CHUNK_ERROR,
            reason: `The index:${taskIndex} slice file upload failed`,
            err,
          });

          const useError = () => {
            reject({
              type: UPLOAD_ERROR_STATES.TERMINATE_UPLOAD,
              reason: `${UPLOAD_ERROR_STATES.UPLOAD_CHUNK_ERROR}:terminated upload`,
            });
          };
          // 上传切片
          const run = () => {
            const taskIndex = chunksMap.shift();
            if (context._terminable.state)
              return reject({
                type: UPLOAD_ERROR_STATES.TERMINATE_UPLOAD,
                reason: "terminated upload",
              });
            if (typeof taskIndex !== "number" || isError.value) return void 0;
            const v = chks[taskIndex!];
            const useFormDate = () => {
              const formData = new FormData();
              const formList = f({
                chunk: v.chunk,
                chunkname: v.chunkname,
                dirname: hash,
              });
              objFor(formList, (v, k) => formData.append(k, v));
              return formData;
            };
            const formData = useFormDate();
            context
              ._requestFunc!.uploadChunk({
                formData,
                url: context.options!.requestConfig!.uploadChunk.url,
                taskIndex,
              })
              // 当有一个分片上传失败整个Promise任务都是失败的
              .then((code) => {
                if (code === 200) {
                  handleProgress(1, v.chunkname);
                  return Promise.resolve(void 0);
                }
                handleProgress(0, v.chunkname);
                setError();
                reject(useSharedError(void 0, taskIndex));
              })
              .then(() => {
                context._terminable.state && useError();
                count--;
                isRun() && run();
              })
              .catch((err) => {
                handleProgress(0, v.chunkname);
                return callReject(useSharedError(err, taskIndex));
              })
              .catch(reject)
              .finally(() => {
                // 判断是否上传完毕
                if (
                  count === 0 &&
                  context._mergechunkmutex &&
                  !isError.value &&
                  !context._terminable.state
                ) {
                  context._mergechunkmutex = false;
                  return resolve(void 0);
                }
              });
          };
          new Array(limit).fill(null).forEach(() => {
            isRun() && run();
          });
        }
      );
    return upload()
      .then(() =>
        Promise.resolve({
          chunklength: chunks.length,
          filename,
          hash,
        })
      )
      .catch((err) => handleCanceledError(err, () => Promise.reject(err)));
  }
  // 合并
  private _merge(res: { hash: string; chunklength: number; filename: string }) {
    const context = this;
    const handleError = () =>
      callReject({
        type: UPLOAD_ERROR_STATES.MERGE_CHUNKS_ERROR,
        reason: "Failed to merge slices",
      });
    return context
      ._requestFunc!.merge(context.options!.requestConfig!.merge.url, {
        hash: res.hash,
        chunkcount: res.chunklength,
        filename: res.filename,
      })
      .then((code) => {
        if (code === 200) return void 0;
        return handleError();
      })
      .catch(() => handleError());
  }
  // 上传
  public triggerUpload(file: RawFile, opt?: Partial<UploaderConfig>) {
    const terminatedUpload = () => {
      this._terminable.execute();
    };
    if (!file)
      return {
        response: callReject({
          err: void 0,
          reason: "file is not a valid value",
          type: UPLOAD_ERROR_STATES.FILE_ERROR,
        }),
        terminate: terminatedUpload,
      };
    const context = this;
    const control = useControl();
    const init = () => {
      context._terminable.clear();
      context._control = control;
      clearRuntimeProduct(context._setOptions.bind(context));
    };
    init();
    const data: Promise<undefined> = new Promise(
      (resolve: (v: undefined) => void, reject: (e: UploadError) => void) => {
        const localOpt = Object.assign(
          { ...context.options!.uploadConfig },
          { ...opt }
        );
        const addTerminable = (abort: TerminableTaskItem) => {
          context._terminable.push(abort);
        };
        createHash(file, addTerminable)
          .then((r) => {
            const { hash, suffix, filename } = r;
            const { err, chunks } = createChunks(
              {
                raw: file,
                hash,
                suffix,
                chunkSize: localOpt.chunkSize!,
                max: localOpt.max!,
              },
              () => context._terminable.state,
              context._setOptions.bind(context)
            );
            if (err) {
              return err;
            }
            return {
              chunks,
              filename,
              hash,
            };
          })
          .then(({ chunks, filename, hash }) => {
            context._terminable.push(() => control.aborts());
            const isGetChunks = context.options?.requestConfig.getChunks?.url;
            const sharedValue = () => ({
              chunks,
              hash,
              filename,
            });
            if (isGetChunks) return context._getChunks(sharedValue());
            return Promise.resolve({
              ...sharedValue(),
              count: context._chunkcount,
            });
          })
          .then(({ hash, chunks, filename, count }) =>
            context._uploadChunks({
              hash,
              chunks,
              limit: localOpt.limit!,
              filename,
              onProgress:
                localOpt.onProgress ||
                context.options?.uploadConfig?.onProgress,
              count,
            })
          )
          .then((r) => {
            const t = r!;
            return context._merge(t);
          })
          .then(() => resolve(void 0))
          .catch(reject);
      }
    );
    return {
      terminate: terminatedUpload,
      response: data,
    };
  }
  private computedProgress(progress: number, chunkname: string) {
    const context = this;
    context._progressGather[chunkname] = progress!;
    const refeef = context._progressGather;
    const chunkcount = context._chunkcount;
    let sum = 0;
    objFor(refeef, (v) => {
      sum += v;
    });
    return Math.floor((sum / chunkcount) * 100);
  }
  // 获取切片
  private _getChunks({
    hash,
    chunks,
    filename,
  }: Parameters<_GetChunks>[0]): ReturnType<_GetChunks> {
    const context = this;
    let chks = chunks;
    let count = chunks.length;
    return new Promise(
      (
        resolve: (value: Awaited<ReturnType<_GetChunks>>) => void,
        reject: (reason?: any) => void
      ) => {
        const success = () => {
          resolve({
            hash,
            chunks: chks,
            count,
            filename,
          });
        };
        if (!context._requestFunc!.getChunk) {
          chunks.forEach((v) => {
            context._progressGather[v.chunkname] = 0;
          });
          success();
        }
        // 获取已缓存的切片
        context
          ._requestFunc!.getChunk(
            context.options!.requestConfig!.getChunks!.url,
            hash
          )
          .then((r) => {
            !r && success();
            if (r.length) {
              chks = chunks!.filter((v) => !r.includes(v.chunkname));
              r.forEach((key) => {
                context._progressGather[key] = 1;
              });
            }
            count -= r.length;
            success();
          })
          .catch((err) =>
            handleCanceledError(err, () =>
              reject({
                type: UPLOAD_ERROR_STATES.GET_CHUNKS_ERROR,
                reason: err?.message || err?.reason,
                err,
              })
            )
          );
      }
    );
  }
}

export const useUploader = (opt: Options) => {
  const instance = new UxChunkUploader(opt);
  let tAbort: null | (() => void) = null;
  let tSuccess: (() => void) | null = null;
  let tFail: ((e: ERROR_RESPOSE) => void) | null = null;
  let tFinally: (() => void) | null = null;
  const onSuccess = (t: () => void) => {
    tSuccess = t;
  };
  const onFail = (t: (e: ERROR_RESPOSE) => void) => {
    tFail = t;
  };
  const onFinally = (t: () => void) => {
    tFinally = t;
  };

  const trigger = (file: RawFile, opt?: Partial<UploaderConfig>) => {
    const { response, terminate } = instance.triggerUpload(file, opt);
    tAbort = terminate;
    return response
      .then(() => {
        typeof tSuccess === "function" && tSuccess();
        return Promise.resolve(void 0);
      })
      .catch((e: ERROR_RESPOSE) => {
        typeof tFail === "function" && tFail(e);
        return Promise.reject(e);
      })
      .finally(() => {
        typeof tFinally === "function" && tFinally();
      });
  };

  const abort = () => {
    if (tAbort) {
      tAbort();
      tAbort = null;
    }
  };

  return {
    trigger,
    abort,
    onSuccess,
    onFail,
    onFinally,
  };
};
