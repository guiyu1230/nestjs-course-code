import "reflect-metadata"
import { DataSource } from "typeorm"
import { NewUser } from "./entity/NewUser"

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "123456",
    database: "test",
    synchronize: false,
    logging: true,
    entities: [NewUser],
    migrations: ['./src/migration/**.ts'],
    subscribers: [],
    poolSize: 10,
    connectorPackage: 'mysql2',
    extra: {
        authPlugin: 'sha256_password',
    }
})
