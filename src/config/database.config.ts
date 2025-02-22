import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const databaseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: 'hh-pgsql-public.ebi.ac.uk',
    port: 5432,
    username: 'reader',
    password: 'NWDMCE5xdipIjRrp',
    database: 'pfmegrnargs',
    entities: [__dirname + '/../**/*.entity.{js,ts}'],
    synchronize: false,
    logging: true,
};