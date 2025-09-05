interface EnvValidationOptions {
	greater_than?: number;
	less_than?: number;
}

// Base env getter with type checking
const getEnvValue = <T>(key: string, parser: (value: string) => T, validator?: (value: T) => void): T => {
	const value = process.env[key];
	if (!value) throw new Error(`${key} must be provided`);
	
	try {
		const parsed = parser(value);
		validator?.(parsed);
		return parsed;
	} catch (error) {
		throw new Error(`Invalid value for ${key}: ${error instanceof Error ? error.message : String(error)}`);
	}
};

const getEnvString = (key: string): string => getEnvValue(key, String);

const getEnvBigInt = (key: string): bigint => 
	getEnvValue(key, BigInt);

const getBooleanFromEnv = (key: string): boolean => 
	getEnvValue(key, (value) => {
		const normalized = value.toLowerCase();
		if (!["true", "false"].includes(normalized)) {
			throw new Error('must be true|false|TRUE|FALSE');
		}
		return normalized === 'true';
	});

const getArrStringFromEnv = (key: string, split_char: string): string[] => 
	getEnvValue(key, (value) => value.split(split_char));

const getArrIntFromEnv = (key: string, split_char: string): number[] =>
	getEnvValue(
		key,
		(value) => {
			const numbers = value.split(split_char).map(Number);
			if (!numbers.every(n => !Number.isNaN(n) && n !== null)) {
				throw new Error('must be valid numbers');
			}
			return numbers;
		}
	);

const validateNumberRange = (value: number, options?: EnvValidationOptions) => {
	if (!options) return;
	
	if (options.greater_than !== undefined && value <= options.greater_than) {
		throw new Error(`must be greater than ${options.greater_than}`);
	}
	if (options.less_than !== undefined && value >= options.less_than) {
		throw new Error(`must be less than ${options.less_than}`);
	}
};

const getIntFromEnv = (key: string, options?: EnvValidationOptions): number =>
	getEnvValue(
		key,
		(value) => {
			const num = parseInt(value, 10);
			if (Number.isNaN(num)) throw new Error('must be an integer');
			validateNumberRange(num, options);
			return num;
		}
	);

const getFloatFromEnv = (key: string, options?: EnvValidationOptions): number =>
	getEnvValue(
		key,
		(value) => {
			const num = Number(value);
			if (Number.isNaN(num)) throw new Error('must be a number');
			validateNumberRange(num, options);
			return num;
		}
	);

export {
	getArrIntFromEnv,
	getArrStringFromEnv,
	getBooleanFromEnv,
	getEnvBigInt,
	getEnvString,
	getFloatFromEnv,
	getIntFromEnv,
};

