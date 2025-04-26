export const useControl = () => {
    const map:Map<string,AbortController['abort']> = new Map;
    const insert = (url:string,abort:()=>void)=>{
        map.set(url,abort);
    };

    const aborts = ()=>{
        map.forEach(v=>v());
        map.clear();
    }

    const del = (url:string) =>{
        map.delete(url);
    }

    const clear = () => {
        map.clear();
    }


    return {
        aborts,
        del,
        insert,
        clear
    }
};