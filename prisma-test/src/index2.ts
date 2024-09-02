import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: [
    {
      emit: 'stdout',
      level: 'query'
    }
  ]
})

async function test2() {
  const user = await prisma.user.create({
    data: {
      name: '东东东2',
      emal: 'dongdong@dong2.com',
      posts: {
        create: [
          {
            title: 'ccc',
            content: 'cccc'
          },
          {
            title: 'ddd',
            content: 'dddd'
          }
        ]
      }
    }
  })
  console.log(user);
}

test2();