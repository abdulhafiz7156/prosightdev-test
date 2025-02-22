import { Injectable } from '@nestjs/common';
import { users } from './users.user.data';

@Injectable()
export class UsersRepository {
    findUserByUsername(username: string) {
        return users.find(user => user.username === username);
    }
}