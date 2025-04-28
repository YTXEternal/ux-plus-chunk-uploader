## introduction

This is a large file chunked upload plugin based on axios development, supporting breakpoint resume and pause. Developers can quickly implement these features without concerning about the specific implementation logic.



## catalogue

- [introduction](#introduction)
- [Languge](#languge)
- [Install](#install)
- [Example](#example)
- [Config](#config)
  - [requestConfig](#requestconfig)
  - [uploadConfig](#uploadconfig)
- [Return Values](#return-values)
- [Full example code](#full-example-code)
- [Contribution Guideline](#contribution-guideline)



## Languge

[English](https://github.com/YTXEternal/ux-plus-chunk-uploader/blob/master/README_en.md "English")
[中文](https://github.com/YTXEternal/ux-plus-chunk-uploader/blob/master/README.md "中文")



## Install

```cmd
// npm
npm i @ux-plus/chunk-uploader -S
// yarn
yarn add @ux-plus/chunk-uploader -S
// pnpm
pnpm add @ux-plus/chunk-uploader -S
```



## Example

```typescript
import {type ERROR_RESPOSE,type Options,useUploader} from '@ux-plus/chunk-uploader';
const options:Options = {
        // Request configuration
        requestConfig: {
            // API for retrieving cached slices
            getChunks: {
                url: '/api/chunks',
                /**
                 * Intercept Response
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {{code:number;data:string[]}} 
                 */
                onResponse(r) {
                    return r.data;
                },
                /**
                 * Set request parameters
                 * @param {string} hash 
                 * @returns {Record<string,any>} 
                 */
                setParams(hash) {
                    return {
                        hash
                    };
                }
            },
            // API for uploading slices
            uploadChunk: {
                url: '/api/uploadchunk',
                /**
                 * Intercept Response
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * Set request parameters
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
            // API for merging slices
            merge: {
                url: '/api/mergechunks',
                /**
                 * Intercept Response
                 * 
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * Set request parameters
                 *
                 * @param {{ hash: string; chunkcount: number; filename: string }} r 
                 * @returns {Record<string,any>} 
                 */
                setParams(r) {
                    return r;
                }
            },
        },
        // Global file upload configuration
        uploadConfig: {
            // Size of each slice in MB
            chunkSize: 100,
            // Number of concurrent slices to upload
            limit: 5,
            // Maximum number of slices
            max: 100,
        },
};
const {onFail, onFinally, onSuccess, abort, trigger} = useUploader(options);


trigger(/* your file */, {
    // The configuration here will override the global file upload configuration
    onProgress(v) {
        console.log('onProgress', v);
    },
    limit: 5,
    max: 100,
});

// Called when upload and slice merging succeed
onSuccess(() => {
    console.log("Upload succeeded");
});

// Called if the upload or slice merging fails (including upload cancellation)
onFail((e: ERROR_RESPOSE) => {
    console.log("Upload failed", e);
});

// Called once the upload and slice merging request completes (including upload cancellation)
onFinally(() => {
    console.log("Upload completed");
});
```



## Config

### requestConfig

- **getChunks**: Configuration for retrieving cached slices.
  - `url`: Request URL.
  - `onResponse(r)`: Response interceptor, parameter is Axios response object.
  - `setParams(hash)`: Set request parameters, parameter is file hash value.
- **uploadChunk**: Configuration for uploading slices.
  - `url`: Request URL.
  - `onResponse(r)`: Response interceptor, parameter is Axios response object.
  - `setParams(r)`: Set request parameters, parameter includes `dirname`, `chunkname`, and `chunk`.
- **merge**: Configuration for merging slices.
  - `url`: Request URL.
  - `onResponse(r)`: Response interceptor, parameter is Axios response object.
  - `setParams(r)`: Set request parameters, parameter includes `hash`, `chunkcount`, and `filename`.

### uploadConfig

- **chunkSize**: Size of each slice in MB.
- **limit**: Number of concurrent slices to upload.
- **max**: Maximum number of slices.

## Return Values

`useUploader` returns an object containing the following methods:

- **onSuccess(callback)**: Called when the file upload and slice merging succeed.
- **onFail(callback)**: Called if the file upload or slice merging fails (including upload cancellation).
- **onFinally(callback)**: Called once the upload and slice merging request completes (including upload cancellation).
- **abort()**: Cancel the current upload operation.
- **trigger(file, config?)**: Trigger the file upload, which can override global configuration items.



## Full example code

```typescript
import {type ERROR_RESPOSE,useUploader} from '@ux-plus/chunk-uploader';
const uploader = document.querySelector('#uploader')! as HTMLInputElement;
    const {onFail, onFinally, onSuccess, abort, trigger} = useUploader({
        // Request configuration
        requestConfig: {
            // API for retrieving cached slices
            getChunks: {
                url: '/api/chunks',
                /**
                 * Intercept Response
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {{code:number;data:string[]}} 
                 */
                onResponse(r) {
                    return r.data;
                },
                /**
                 * Set request parameters
                 * @param {string} hash 
                 * @returns {Record<string,any>} 
                 */
                setParams(hash) {
                    return {
                        hash
                    };
                }
            },
            // API for uploading slices
            uploadChunk: {
                url: '/api/uploadchunk',
                /**
                 * Intercept Response
                 *
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * Set request parameters
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
            // API for merging slices
            merge: {
                url: '/api/mergechunks',
                /**
                 * Intercept Response
                 * 
                 * @param {AxiosResponse<any,any>} r 
                 * @returns {number} 
                 */
                onResponse(r) {
                    return r.data.code;
                },
                /**
                 * Set request parameters
                 *
                 * @param {{ hash: string; chunkcount: number; filename: string }} r 
                 * @returns {Record<string,any>} 
                 */
                setParams(r) {
                    return r;
                }
            },
        },
        // Global file upload configuration
        uploadConfig: {
            // Size of each slice in MB
            chunkSize: 100,
            // Number of concurrent slices to upload
            limit: 5,
            // Maximum number of slices
            max: 100,
        },
    });

    const terminateBtn = document.querySelector('#terminate')! as HTMLInputElement;
    uploader.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target.files![0];
        trigger(file, 
            // The configuration here will override the global file upload configuration.
            {
                /**
                 * Upload Progress Listener
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
            // Cancel upload
            abort();
        };
        // Called when upload and slice merging succeed
        onSuccess(() => {
            console.log("Upload succeeded");
        });
        // Called if the upload or slice merging fails (including upload cancellation)
        onFail((e: ERROR_RESPOSE) => {
            console.log("Upload failed", e);
        });
        // Called once the upload and slice merging request completes (including upload cancellation)
        onFinally(() => {
            console.log("Upload completed");
        });
};
```

## Contribution Guideline

Thank you for your interest in this project and willingness to contribute! In the beginning, please read the following guidelines carefully.

[Document](https://github.com/YTXEternal/ux-plus-chunk-uploader/blob/master/EXPLANATION_en.md)