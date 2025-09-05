export type MyPicking<TObj, TKey extends keyof TObj> = {
    [Key in TKey]: TObj[Key];
}

export type MyOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export type MyReadonly<TObj> = {
    readonly [Key in keyof TObj]: TObj[Key];
}

export type First<TArray extends any[]> = TArray extends [infer TFirst, ...any] ? TFirst : never

export type MyMerge<T> = {
    [K in keyof T]: T[K]
}

export type OptionalSelected<T, K extends keyof T> = MyMerge<{ [Key in K]?: T[Key] } & Omit<T, K>>;

export type OptionalAll<T> = { [Key in keyof T]?: T[Key] }

export type RequiredSelected<T, K extends keyof T> = MyMerge<{ [Key in K]-?: T[Key] } & Omit<T, K>>;

export type RequiredAll<T> = MyMerge<{ [Key in keyof T]-?: T[Key] }>;

export type Awaited<T extends Promise<any>> = T extends Promise<infer x> ? (x extends Promise<any> ? Awaited<x> : x) : never

export type If<C extends boolean, T, F> = C extends true ? T : F

type Exclude<T, U> = T extends U ? never : T

type Expected<T extends true> = T

type IsEqual<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y
    ? 1
    : 2
    ? true
    : false;


//Test
const a = [1, 2]
type b = First<[undefined]>
type c = First<["a", "b"]>
type d = MyOmit<{ a: string, b: string, c: string }, "a" | "b" | "c">
type e = OptionalSelected<{ a: number, b: number }, "a">
type f = RequiredSelected<e, "a">

type cases = [
    Expected<IsEqual<b, undefined>>,
    Expected<IsEqual<c, "a">>,
    Expected<IsEqual<d, {}>>,
    Expected<IsEqual<e, { a?: number, b: number }>>,
    Expected<IsEqual<f, { a: number, b: number }>>,
    Expected<IsEqual<f, { a: number, b: number }>>
]


