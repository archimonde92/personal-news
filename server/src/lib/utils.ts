import { MILLISECOND_PER_ONE_SEC } from "./constants"
import readline from "readline/promises"
var crypto = require('crypto')

// Type definitions for better type safety
type DateInput = Date | string | number;

// Async utilities
export const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));


// Number utilities
export const randomBetween = (from: number, to: number): number => {
    if (from > to) throw new Error("'to' must be greater than 'from'");
    return from + (Math.random() * (to - from));
};

export const isNumberString = (n: string): boolean =>
    Boolean(n) && !Number.isNaN(Number(n));

export const ConvertMsToSec = (ms: number): number =>
    Math.floor(ms / MILLISECOND_PER_ONE_SEC);

// Date utilities
export const isAtTime = (startTime: number, duration: number, checkTime: number): boolean =>
    checkTime >= startTime && checkTime < startTime + duration;

export const getStartPreviousDays = (from: Date, days: number): Date =>
    new Date(from.getTime() - (days * 86400000));

// String utilities

export const lowerCase = (s?: string): string =>
    s?.toLowerCase() ?? '';

// Validation utilities
const EMAIL_REGEX = /^[a-z][a-z0-9_\.]{4,32}@[a-z0-9]{2,}(\.[a-z0-9]{2,4}){1,2}.*$/;
const PROJECT_NAME_REGEX = /^([a-zA-Z0-9-\s]){0,50}$/;
export const SHA256_REGEX = /^[a-fA-F0-9]{64}$/;

export const isValidEmailAddress = (email: string): boolean =>
    EMAIL_REGEX.test(email);

export const isValidProjectName = (projectName: string): boolean =>
    PROJECT_NAME_REGEX.test(projectName);

// Date manipulation utilities
export enum DateType {
    FirstOfMonth = 'firstOfMonth',
    LastOfMonth = 'lastOfMonth',
    StartOfDay = 'startOfDay',
    EndOfDay = 'endOfDay'
}

export const ConvertDateDayOrMonth = (date: DateInput, type: DateType): number => {
    const convertedDate = new Date(date);

    switch (type) {
        case DateType.FirstOfMonth:
            return new Date(convertedDate.setUTCDate(1)).setUTCHours(0, 0, 0, 0);
        case DateType.LastOfMonth:
            return new Date(new Date(convertedDate.setUTCMonth(convertedDate.getUTCMonth() + 1))
                .setUTCDate(0)).setUTCHours(0, 0, 0, 0);
        case DateType.StartOfDay:
            return convertedDate.setUTCHours(0, 0, 0, 0);
        case DateType.EndOfDay:
            return convertedDate.setUTCHours(24, 0, 0, 0);
    }
};

// Error handling
export const ConvertErrorToString = (error: unknown): string => {
    if (!error) return "UNKNOWN_ERROR";
    if (typeof error === "string") return error;
    if (error instanceof Error) return error.message;
    return JSON.stringify(error);
};

// JSON utilities
export const GetPreviousAndNextMonth = (date: Date | string | number = new Date(), typeOfMonth: 'previous' | 'next', quantity: number = 1) => {
    const convertDate: typeof date = typeof date === "string" || typeof date === "number" ? new Date(date) : date
    let new_month: number = convertDate.getUTCMonth()
    typeOfMonth === 'previous' ? new_month -= quantity : new_month += quantity
    const new_date = new Date().setUTCMonth(new_month)
    return new Date(new_date)
}

export const HexToString = (hex: string) => {
    try {
        const message = Buffer.from(hex, "hex").toString("utf8")
        return message
    } catch (error) {
        return hex
    }
}

export async function Sha256(source) {
    const sourceBytes = new TextEncoder().encode(source);
    const digest = await crypto.subtle.digest("SHA-256", sourceBytes);
    const resultBytes = [...new Uint8Array(digest)];
    return resultBytes.map(x => x.toString(16).padStart(2, '0')).join("");
}


export const ConvertTimeTommDDDyyyy = (date: Date | string | number | undefined | null) => {
    if (!date) return "TBA"
    const new_date = new Date(date).toLocaleString('en-US', { timeZone: 'UTC' }).replace(',', '')
    const [day, time, period] = new_date.split(' ')
    return `${day} ${time} ${period} UTC`
}

export function ToHex(str) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16)
    }
    return result
}

export class LibUtils {

    static ConvertErrorToString = (e: any) => {
        if (!e) return "UNKNOWN_ERROR"
        if (typeof e === "string") return e
        if (e.message && (typeof e.message === "string")) return e.message as string
        return JSON.stringify(e)
    }
    static array = {
        GetRandomManyItems: <T>(arr: T[], n: number): T[] => {
            const indices = new Set<number>();
            while (indices.size < Math.min(n, arr.length)) {
                indices.add(Math.floor(Math.random() * arr.length));
            }
            return Array.from(indices).map(i => arr[i]);
        },
        FilterBySearch: <T>(array: T[], key: keyof T, search: string) => {
            if (!array[0] || typeof array[0][key] !== "string") return array
            return array.filter(el => new RegExp(`${search}`).test(el[key] as any))
        },
        GetUniqueArr: <T>(a: T[]) => Array.from(new Set(a)),
        /**
         * @param array 
         * @param sort 
         * @example
         * array=[{ a: 2, b: 1 }, { a: 2, b: 2 }, { a: 1, b: 2 } ]
         * sort={a:1}
         * =>result [ { a: 1, b: 2 }, { a: 2, b: 1 }, { a: 2, b: 2 } ]
         */
        SortArrayByManyFields: <T>(array: T[], sort: { [Key in keyof T]?: 1 | -1 }) => {
            const all_keys = Object.keys(sort)
            array.sort((a, b) => {
                let index = 0
                for (let key of all_keys) {
                    if (a[key] !== b[key]) return a[key] > b[key] ? sort[key] : sort[key] * -1
                    index++
                    if (index === all_keys.length - 1) break
                }
                return a[all_keys[index]] > b[all_keys[index]] ? sort[all_keys[index]] : sort[all_keys[index]] * -1
            })
        },
        Shuffle<T>(array: T[]) {
            let currentIndex = array.length, randomIndex

            // While there remain elements to shuffle.
            while (currentIndex != 0) {

                // Pick a remaining element.
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;

                // And swap it with the current element.
                [array[currentIndex], array[randomIndex]] = [
                    array[randomIndex], array[currentIndex]]
            }

            return array
        }
    }
}

export const GetJSONStringify = (object: any): string =>
    // Use the JSON.stringify method to convert the object to a JSON string
    JSON.stringify(
        object,
        // Use a replacer function to handle bigint values
        (_, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
    )

export const GetCurrentTimeInSeconds = (date: Date = new Date()) => Math.floor(date.getTime() / 1000)

export const RoundNumber = (n: number) => {
    const round_step = (method: 'floor' | 'ceil' | 'round', step: number) => {
        if (step === 0) return n
        return Math[method](n / step) * step
    }
    const round = (method: 'floor' | 'ceil' | 'round', fraction_digits: number, step: number) => {
        const factor = 10 ** fraction_digits;
        return Math[method](round_step(method, step) * factor) / factor;
    };
    return {
        floor: (fraction_digits = 2, step = 0) => round('floor', fraction_digits, step),
        ceil: (fraction_digits = 2, step = 0) => round('ceil', fraction_digits, step),
        round: (fraction_digits = 2, step = 0) => round('round', fraction_digits, step),
    };
};

export class GlobalUtilsLibShare {
    /**
     * @description Check if two numbers are approximately equal
     * @param a 
     * @param b 
     * @param tolerance 
     * @param min_value 
     * @returns 
     */
    static isApproximatelyEqual = (a: number, b: number, tolerance: number = 0.02, min_value: number = 0) => {
        return Math.abs(a - b) <= Math.min(a * tolerance, b * tolerance, min_value)
    }

    static RetryPromise = async <T>(promise: Promise<T>, times: number = 3, delay: number = 1000) => {
        let response: T
        let error: any
        for (let i = 0; i < times; i++) {
            try {
                response = await promise
                return response as T
            } catch (err) {
                error = err
                await sleep(delay)
            }
        }
        if (error) throw error
    }
}

//Create get input from prompt
export const getInputFromPrompt = async (promtText: string) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    const address = await rl.question(promtText)
    rl.close()
    return address
}