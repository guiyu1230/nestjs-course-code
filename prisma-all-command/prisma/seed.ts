import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    },
  ],
});

async function main() {
  const user = await prisma.user.create({
    data: {
      name: '东东动',
      emal: 'dongdong@dong.com',
      Post: {
        create: [
          {
            title: 'aaa',
            content: 'aaaa'
          },
          {
            title: 'bbb',
            content: 'bbbb'
          }
        ]
      },
    },
  })
  console.log(user)
}

main();

/**
prisma:query BEGIN
prisma:query INSERT INTO `prisma_test`.`User` (`id`,`emal`,`name`) VALUES (?,?,?)
prisma:query INSERT INTO `prisma_test`.`Post` (`published`,`content`,`title`,`authorId`) VALUES (?,?,?,?), (?,?,?,?)
prisma:query SELECT `prisma_test`.`User`.`id`, `prisma_test`.`User`.`emal`, `prisma_test`.`User`.`name` FROM `prisma_test`.`User` WHERE `prisma_test`.`User`.`id` = ? LIMIT ? OFFSET ?
prisma:query COMMIT
 */