import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'hh-pgsql-public.ebi.ac.uk',
    port: 5432,
    username: 'reader',
    password: 'NWDMCE5xdipIjRrp',
    database: 'pfmegrnargs',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
    synchronize: false,
    logging: true,
});
