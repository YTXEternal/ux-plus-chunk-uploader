/* eslint-disable react-hooks/rules-of-hooks */
 
import React,{useState} from 'react';
import { InboxOutlined } from '@ant-design/icons';
import  { type UploadProps ,Upload,message } from 'antd';
import {type ERROR_RESPOSE,useUploader} from '@ux-plus/chunk-uploader';

const {trigger,onSuccess,onFail,abort,onFinally} = useUploader({
  // 请求配置
  requestConfig: {
   // 获取已缓存切片接口s
   getChunks: {
       url: '/api/chunks',
       /**
        * @param {AxiosResponse<any, any>} r 
        * @returns {{ code: number; data: string[]; }} 
        */
       onResponse(r) {
           return r.data;
       },
       setParams(hash) {
           return {
             hash
           }
       }
   },
   // 上传切片接口
   uploadChunk: {
       url: '/api/uploadchunk',
       // 
       onResponse(r) {
           return r.data.code;
       },
       //  
       setParams(r) {
           return r;
       }
   },
   // 合并切片接口
   merge: {
       url: '/api/mergechunks',
       onResponse(r) {
           return r.data.code;
       },
       setParams(r) {
           return r
       }
   },
},
// 上传配置
uploadConfig: {
   // 每个切片大小（MB)
   chunkSize: 100,
   // 并发上传切片数
   limit: 5,
   // 最大分片数
   max: 100,
}
});

const { Dragger } = Upload;

const App: React.FC = () => {
  const [isDisabled] = useState(false);
  onFinally(()=>{
     console.log('上传完毕');
  });
  const props: UploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload() {
      abort();
      return true;
    },
    onRemove() {
      abort();
    },
    customRequest(params) {
      const raw = params.file;
      onSuccess(()=>{
         message.success('文件上传成功');
         params.onSuccess!(void 0);
      });
      onFail((e:ERROR_RESPOSE)=>{
        // console.error(e);
        message.error(e.reason);
        params.onError!(new Error('上传失败'));
      });
      trigger(raw as File,{
        onProgress(r) {
          params.onProgress!({
            percent:r
          });
        },
        limit:4,
        'max':100,
        'chunkSize':50
      })
      .catch(()=>{
        console.log('失败');
      });
    },
    maxCount:1,
    disabled:isDisabled,
  };

  return (
  <Dragger {...props} className='w-500px h-300px' >
    <p className="ant-upload-drag-icon">
      <InboxOutlined />
    </p>
    <p className="ant-upload-text">大文件上传</p>
    <p className="ant-upload-hint">
      仅支持单个上传
    </p>
  </Dragger>
  )
};

export default App;