import dotenv from 'dotenv'
dotenv.config()

const env = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: !(process.env.NODE_ENV === 'development'),
    port: Number(process.env.PORT) || 7979,
    opensearch: {
        domain: process.env.OPENSEARCH_DOMAIN!,
        region: process.env.OPENSEARCH_REGION!
    },
    mysql: {
        host: process.env.MYSQL_DB_HOST!,
        port: Number(process.env.MYSQL_DB_PORT) || 3306,
        user: process.env.MYSQL_DB_USER!,
        password: process.env.MYSQL_DB_PASSWORD!,
        database: process.env.MYSQL_DB_NAME!
    },
    jwt: process.env.JWT_SECRET!,
    redis: {
        hierarchyLive: {
            host: process.env.HIERARCHY_LIVE_REDIS_HOST!,
            port: Number(process.env.HIERARCHY_LIVE_LIVE_REDIS_PORT) || 6379
        },
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT) || 6379
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!
    },
    slack: {
        token: process.env.SLACK_BOT_TOKEN!
    }
}

const validateEnv = (data: Record<string, unknown> | null) => {
    if (data === null) return
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'object') {
            validateEnv(value as Record<string, unknown> | null)
        } else if (value == null) {
            const message = `${key} missing in env`
            // eslint-disable-next-line no-console
            console.log(message)
        }
    }
}

validateEnv(env)

export default env
