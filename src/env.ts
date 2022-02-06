import dotenv from 'dotenv'
dotenv.config()

const env = {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: !(process.env.NODE_ENV === 'development'),
    port: Number(process.env.PORT) || 7979,
    host: 'localhost',
    mysql: {
        host: process.env.MYSQL_DB_HOST!,
        port: Number(process.env.MYSQL_DB_PORT) || 3306,
        user: process.env.MYSQL_DB_USER!,
        password: process.env.MYSQL_DB_PASSWORD!,
        database: process.env.MYSQL_DB_NAME!
    },
    postgre: {
        host: process.env.POSTGRE_DB_HOST!,
        user: process.env.POSTGRE_DB_USER!,
        password: process.env.POSTGRE_DB_PASSWORD!,
        name: process.env.POSTGRE_DB_NAME!
    },
    redis: {
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT) || 6379,
        keyPrefix: process.env.REDIS_PREFIX as string
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
        region: process.env.AWS_REGION!
    },
    slack: {
        token: process.env.SLACK_BOT_TOKEN!
    },
    secret: {
        cookie: process.env.COOKIE_SECRET!
    },
    jwt: process.env.JWT_SECRET!
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
