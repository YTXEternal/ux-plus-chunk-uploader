import type {UseNextTick} from './types';
export const useNextTick:UseNextTick = () => {
  const win = window;
  if (Promise.resolve) {
    return (callback) => {
      Promise.resolve().then(callback);
    };
  } else if (win.queueMicrotask) {
    return (callback) => {
      win.queueMicrotask(callback);
    };
    // @ts-ignore
  } else if(win.setImmediate) {
    return (callback) => {
    // @ts-ignore
        win.setImmediate(callback);
      };
  } 
    return (callback) => {
        win.setTimeout(callback,0);
    };
  
};
