import { getEnvString } from "../lib"
import { CCommonConfig } from "./common"
import { CommonInfra } from "./common.i"

export class CAppConfig extends CCommonConfig {
    app: {
        TELEGRAM_BOT_TOKEN: string,
    }

    constructor(infras: CommonInfra[]) {
        super(infras)
        this.app = {
            TELEGRAM_BOT_TOKEN: getEnvString('TELEGRAM_BOT_TOKEN'),
        }
    }
}