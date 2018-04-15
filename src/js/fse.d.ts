export function copy(src: string, tar: string, ignore?: RegExp): Promise<string[] | string[][]>
export function read(file: string, option?: any): Promise<any>
export function write(file: string, data: any, option?: any): Promise<string>
export function remove(src: string): Promise<any[]>
