## 简介

这是一款基于axios开发的大文件分片上传插件支持断点续传以及暂停，开发者无需关注具体的实现逻辑即可快速实现



## 目录

- [简介](#%E7%AE%80%E4%BB%8B)
- [语言](#%E8%AF%AD%E8%A8%80)
- [安装](#%E5%AE%89%E8%A3%85)
- [示例](#%E7%A4%BA%E4%BE%8B)
- [配置](#%E9%85%8D%E7%BD%AE)
  - [requestConfig](#requestconfig)
  - [uploadConfig](#uploadconfig)
- [返回值](#%E8%BF%94%E5%9B%9E%E5%80%BC)
- [完整示例代码](#%E5%AE%8C%E6%95%B4%E7%A4%BA%E4%BE%8B%E4%BB%A3%E7%A0%81)
- [贡献指南](#%E8%B4%A1%E7%8C%AE%E6%8C%87%E5%8D%97)




## 语言

[English](https://github.com/YTXEternal/ux-plus-chunk-uploader/blob/master/README_en.md "English")
[中文](https://github.com/YTXEternal/ux-plus-chunk-uploader/blob/master/README.md "中文")




## 安装

```
// npm
npm i @ux-plus/chunk-uploader -S
// yarn
yarn add @ux-plus/chunk-uploader -S
// pnpm
pnpm add @ux-plus/chunk-uploader -S
```



## 示例

```typescript
import {type ERROR_RESPOSE,type Options,useUploader} from '@ux-plus/chunk-uploader';
const options:Options = {
        // 请求配置
        requestConfig: {
            // 获取已缓存分片的API配置
            getChunks: {
                url: '/api/chunks',
                /**
                 * 拦截响应
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {{code:number;data:string[]}} 
                 */
                onResponse(r) {
                    return r.data;
                },
                /**
                 * 设置请求参数
                 * @param {string} hash 
                 * @returns {Record<string,any>} 
                 */
                setParams(hash) {
                    return {
                        hash
                    };
                }
            },
            // 用于上传分片的API配置
            uploadChunk: {
                url: '/api/uploadchunk',
                /**
                 * 拦截响应
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * 设置请求参数
                 *
                 * @param {{
                 *   dirname: string;
                 *   chunkname: string;
                 *   chunk: Blob;
                 * }} r 
                 * @returns {Record<string,any>} 
                 */
                setParams(r) {
                    return r;
                }
            },
            // 用于合并分片的API配置
            merge: {
                url: '/api/mergechunks',
                /**
                 * 拦截响应
                 * 
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * 设置请求参数
                 *
                 * @param {{ hash: string; chunkcount: number; filename: string }} r 
                 * @returns {Record<string,any>} 
                 */
                setParams(r) {
                    return r;
                }
            },
        },
        // 全局文件上传配置
        uploadConfig: {
            // 每个切片的大小，以MB为单位
            chunkSize: 100,
            // 上传的并发切片数
            limit: 5,
            // 最大切片数
            max: 100,
        },
};
const {onFail, onFinally, onSuccess, abort, trigger} = useUploader(options);


trigger(/*your file*/,{
     // 这里的配置会覆盖全局的上传文件配置
     {
     // 进度监听器
     onProgress(v) {
         console.log('onProgress', v);
     },
     limit: 5,
     max: 100,
});

// 上传和合并切片成功时调用
onSuccess(()=>{
    console.log("上传成功");
});
// 上传成功或合并切片失败时调用（包括取消上传）
onFail((e:ERROR_RESPOSE)=>{
    console.log("上传失败",e);
});
// 上传以及合并切片请求完成后调用（包括取消上传）
onFinally(()=>{
    console.log("上传完成");
});

```



## 配置

### requestConfig

- **getChunks**: 获取缓存分片的API配置。
  - `url`: 请求URL。
  - `onResponse(r)`: 响应拦截器，参数为Axios响应对象。
  - `setParams(hash)`: 设置请求参数，参数为文件哈希值。
- **uploadChunk**: 分片上传API配置。
  - `url`: 请求URL。
  - `onResponse(r)`: 响应拦截器，参数为Axios响应对象。
  - `setParams(r)`: 设置请求参数，参数为包含`dirname`, `chunkname`, 和 `chunk`的对象。
- **merge**: 合并分片API配置。
  - `url`: 请求URL。
  - `onResponse(r)`: 响应拦截器，参数为Axios响应对象。
  - `setParams(r)`: 设置请求参数，参数为包含`hash`, `chunkcount`, 和 `filename`的对象。

### uploadConfig

- **chunkSize**: 每个分片大小（单位：MB）。
- **limit**: 并发上传分片数量。
- **max**: 最大分片数量。
- **onProgress**:进度监听器。



## 返回值

`useUploader` 返回一个对象，包含以下方法：

- **onSuccess(callback)**: 文件上传及合并成功时调用的回调函数。

- **onFail(callback)**: 文件上传或合并失败时调用的回调函数，包括上传取消。

- **onFinally(callback)**: 文件上传及合并请求完成后调用的回调函数，无论成功与否。

- **abort()**: 取消当前上传操作。

- **trigger(file, config?)**: 触发文件上传，可覆盖全局配置项。

  

## 完整示例代码

```typescript
import {type ERROR_RESPOSE,useUploader} from '@ux-plus/chunk-uploader';
const uploader = document.querySelector('#uploader')! as HTMLInputElement;
    const {onFail, onFinally, onSuccess, abort, trigger} = useUploader({
        // 请求配置
        requestConfig: {
            // 获取以缓存分片接口配置
            getChunks: {
                url: '/api/chunks',
                /**
                 * 拦截响应
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {{code:number;data:string[]}} 
                 */
                onResponse(r) {
                    return r.data;
                },
                /**
                 * 设置请求参数
                 * @param {string} hash 
                 * @returns {Record<string,any>} 
                 */
                setParams(hash) {
                    return {
                        hash
                    };
                }
            },
            // 用于上传切片的API配置
            uploadChunk: {
                url: '/api/uploadchunk',
                /**
                 * 拦截响应
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * 设置请求参数
                 *
                 * @param {{
                 *   dirname: string;
                 *   chunkname: string;
                 *   chunk: Blob;
                 * }} r 
                 * @returns {Record<string,any>} 
                 */
                setParams(r) {
                    return r;
                }
            },
            // 用于合并分片的API配置
            merge: {
                url: '/api/mergechunks',
                /**
                 * 拦截响应
                 * 
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * 设置请求参数
                 *
                 * @param {{ hash: string; chunkcount: number; filename: string }} r 
                 * @returns {Record<string,any>} 
                 */
                setParams(r) {
                    return r;
                }
            },
        },
        // 全局文件上传配置
        uploadConfig: {
            // 每个切片的大小，以MB为单位
            chunkSize: 100,
            // 上传的并发切片数
            limit: 5,
            // 最大分片数
            max: 100,
        },
    });

    const terminateBtn = document.querySelector('#terminate')! as HTMLInputElement;
    uploader.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files![0];
        trigger(file, 
            // 这里的配置将覆盖全局文件上传配置。
            {
                /**
                 * 上传进度监听器
                 *
                 * @param {number} v 
                 */
                onProgress(v) {
                    console.log('progress', v);
                },
                limit: 5,
                max: 100,
            });
        terminateBtn.onclick = () => {
            // 中断（取消）上传
            abort();
        };
        // 上传和切片合并成功时调用
        onSuccess(() => {
            console.log("上传成功了");
        });
        // 如果上传或分片合并失败（包括上传取消）调用。
        onFail((e: ERROR_RESPOSE) => {
            console.log("上传失败", e);
        });
        // 在上传和切片合并请求完成时调用（包括上传取消）
        onFinally(() => {
            console.log("上传文件完毕");
        });
};
```



## 贡献指南

感谢你对本项目感兴趣并愿意贡献！在开始之前，请仔细阅读以下指南。

[详细文档](https://github.com/YTXEternal/ux-plus-chunk-uploader/blob/master/CONTRIBUTION.md)
