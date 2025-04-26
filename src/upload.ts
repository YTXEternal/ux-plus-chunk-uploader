import type {ERROR_RESPOSE} from './packages/types';
import {useUploader} from './packages';

export const setupUploader = () => {
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
};