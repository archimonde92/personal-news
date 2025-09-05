import { config } from "dotenv";
import { CAppConfig } from "./app";
import { CommonInfra, GetConfigType } from "./common.i";
import { CCommonConfig } from "./common";

const path = ".env"
console.table({ env_path: path })
config({ path })

export const infras: CommonInfra[] = ["mongo"]
const _infras = ["mongo"] as const

export const AppEnvConfig = new CAppConfig(infras) as any as Omit<CAppConfig, keyof CCommonConfig> & GetConfigType<typeof _infras>