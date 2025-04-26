export type TerminableTaskItem = ()=>void;
export interface Terminable {
    task:TerminableTaskItem[];
    state:boolean;
    execute:()=>void;
    push:(t:TerminableTaskItem) =>void;
    clear:()=>void
}