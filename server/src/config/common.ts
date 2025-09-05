import { getArrStringFromEnv, getBooleanFromEnv, getEnvBigInt, getEnvString, getIntFromEnv } from "../lib"
import { CommonConfigParams, CommonInfra, FastifyConfigParams, GraphqlConfigParams, MongoConfigParams, RedisConfigParams, SentryConfigParams, TronwebConfigParams, ViemConfigParams } from "./common.i"

export class CCommonConfig {
    common: CommonConfigParams | undefined
    mongo: MongoConfigParams | undefined
    sentry: SentryConfigParams | undefined
    redis: RedisConfigParams | undefined
    graphql: GraphqlConfigParams | undefined
    fastify: FastifyConfigParams | undefined
    viem: ViemConfigParams | undefined
    tronweb: TronwebConfigParams | undefined

    constructor(infras: CommonInfra[]) {
        this.common = {
            NODE_ENV: getEnvString("NODE_ENV"),
            SERVER_NAME: getEnvString("SERVER_NAME"),
            SERVER_CODE: getEnvString("SERVER_CODE"),
            isProductionRun: false,
            isLocalRun: false,
            isTestnetRun: false,
        }

        this.common.isProductionRun = ["prod", "production"].includes(this.common.NODE_ENV)
        this.common.isLocalRun = ["local"].includes(this.common.NODE_ENV)
        this.common.isTestnetRun = ["testnet"].includes(this.common.NODE_ENV)

        infras.forEach(infra => {
            this[`init_${infra}`]()
        })
    }

    private init_mongo() {
        this.mongo = {
            MONGO_DB_NAME: getEnvString("MONGO_DB_NAME"),
            MONGO_URI: getEnvString("MONGO_URI")
        }
    }

    private init_sentry() {
        this.sentry = {
            SENTRY_DNS: getEnvString("SENTRY_DNS"),
        }
    }

    private init_redis() {
        this.redis = {
            REDIS_DB_NUMBER: getIntFromEnv("REDIS_DB_NUMBER"),
            REDIS_PREFIX: getEnvString("REDIS_PREFIX"),
            REDIS_URI: getEnvString("REDIS_URI"),
        }
    }

    private init_graphql() {
        this.graphql = {
            GRAPHQL_PORT: getIntFromEnv("GRAPHQL_PORT"),
            IS_USE_PLAYGROUND: getBooleanFromEnv("IS_USE_PLAYGROUND"),
        }
    }

    private init_fastify() {
        this.fastify = {
            FASTIFY_PORT: getIntFromEnv("FASTIFY_PORT"),
        }
    }

    private init_viem() {
        this.viem = {
            VIEM_PROVIDERS: getArrStringFromEnv("VIEM_PROVIDERS", ","),
            ANTI_REORG_BLOCK_NUMBER: getEnvBigInt("ANTI_REORG_BLOCK_NUMBER"),
            AVG_BLOCK_TIME_SEC: getIntFromEnv("AVG_BLOCK_TIME_SEC"),
        }
    }

    private init_tronweb() {
        this.tronweb = {
            FULL_NODE: getEnvString("FULL_NODE"),
            SOLIDITY_NODE: getEnvString("SOLIDITY_NODE"),
            EVENT_SERVER: getEnvString("EVENT_SERVER"),
            FULL_NODE_JSON_RPC_API: getEnvString("FULL_NODE_JSON_RPC_API"),
        }
    }
}


/* 
   NODE_ENV=
   SERVER_NAME=
   SENTRY_DNS=
   ADMIN_KEY=
   IS_DEBUG=
   DEBUG_LEVEL=
   IS_FORK=
*/

