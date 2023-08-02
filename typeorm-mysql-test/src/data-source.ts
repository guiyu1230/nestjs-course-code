import "reflect-metadata"
import { DataSource } from "typeorm"
import { Aaa } from "./entity/Aaa"
import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "123456",
    database: "practice",
    synchronize: true,
    logging: true,
    entities: [User, Aaa],
    migrations: [],
    subscribers: [],
    connectorPackage: 'mysql2',
    extra: {
        authPlugin: 'sha256_password'
    }
})
