import { Injectable } from '@nestjs/common';
import { users } from './users.user.data';

@Injectable()
export class UsersService {
    findUser(username: string) {
        return users.find(user => user.username === username);
    }
}