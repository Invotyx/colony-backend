import * as faker from 'faker';
import { Factory } from '../../decorators/common.decorator';
import { UsersService } from '../../modules/users/services/users.service';
import { IFactory } from '../factory.interface';

@Factory()
export class UserFactory implements IFactory {
  constructor(private readonly usersService: UsersService) {}
  async run(param = {} as any) {
    const expect = param.expect || 1;
    const usernames = [
      ...new Set([...Array(expect * 1)].map(() => faker.internet.userName())),
    ];
    const emails = [
      ...new Set([...Array(expect * 1)].map(() => faker.internet.email())),
    ];
    const total = Math.min(usernames.length, emails.length, expect);
    const Users = Array(total)
      .fill(0)
      .map((v, i) => {
        return {
          firstName: faker.firstName.findName(),
          lastName: faker.lastName.findName(),
          email: emails[i],
          username: usernames[i],
          password: 'fakeP@W0rd',
          gender: faker.random.arrayElement(['male', 'female']),
          mobile: faker.phone.phoneNumber(),
          meta: {
            TFARequire:true
          },
          branchId: 1,
          languageId: 1,
          cityId:1,
        };
      });
    // return Users;
    const res = await Users.reduce(async (a, v) => {
      await a;
      await this.usersService.createUser(v as any);
    }, Promise.resolve());
    return {
      success: true,
      inserted: total,
    };
  }
}
