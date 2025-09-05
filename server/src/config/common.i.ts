export type CommonInfra = keyof Omit<InfraType, "common">

export type CommonConfigParams = {
    NODE_ENV: string
    SERVER_NAME: string
    SERVER_CODE: string
    isProductionRun: boolean
    isLocalRun: boolean
    isTestnetRun: boolean
}

export type MongoConfigParams = {
    MONGO_URI: string
    MONGO_DB_NAME: string
}

export type SentryConfigParams = {
    SENTRY_DNS: string
}

export type RedisConfigParams = {
    REDIS_URI: string
    REDIS_DB_NUMBER: number
    REDIS_PREFIX: string
}

export type GraphqlConfigParams = {
    GRAPHQL_PORT: number
    IS_USE_PLAYGROUND: boolean
}

export type FastifyConfigParams = {
    FASTIFY_PORT: number
}

export type ViemConfigParams = {
    VIEM_PROVIDERS: string[]
    ANTI_REORG_BLOCK_NUMBER: bigint
    AVG_BLOCK_TIME_SEC: number
}

export type TronwebConfigParams = {
    FULL_NODE: string
    SOLIDITY_NODE: string
    EVENT_SERVER: string
    FULL_NODE_JSON_RPC_API: string
}

type InfraType = {
    common: CommonConfigParams
    mongo: MongoConfigParams
    sentry: SentryConfigParams
    redis: RedisConfigParams
    graphql: GraphqlConfigParams
    fastify: FastifyConfigParams
    viem: ViemConfigParams
    tronweb: TronwebConfigParams
}

export type GetConfigType<A extends readonly string[]> = {
    [K in A[number]]: K extends keyof InfraType ? InfraType[K] : undefined
} & {
    common: CommonConfigParams
}