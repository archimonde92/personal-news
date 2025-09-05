import { AggregateOptions, FindOptions } from "mongodb"

export const ReadNoGuaranteeOptions: FindOptions | AggregateOptions = { readPreference: "secondaryPreferred", readConcern: "local" }
export const ReadGuaranteeOptions: FindOptions | AggregateOptions = { readPreference: "secondaryPreferred", readConcern: "majority" }
export const FastestReadNoGuaranteeOptions: FindOptions | AggregateOptions = { readPreference: "primary", readConcern: "local" }
export const FastestReadGuaranteeOptions: FindOptions | AggregateOptions = { readPreference: "primary", readConcern: "majority" }
export const ReadAggregateOptions: FindOptions | AggregateOptions = { readPreference: "secondaryPreferred", readConcern: "snapshot" }
