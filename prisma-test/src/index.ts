import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function test1() {
  // await prisma.user.create({
  //   data: {
  //     name: 'guang',
  //     emal: '111@guang1.com'
  //   }
  // })

  // await prisma.user.create({
  //   data: {
  //     name: 'dong',
  //     emal: '222@dong1.com'
  //   }
  // });

  const users = await prisma.user.findMany();
  console.log(users)
  const posts = await prisma.post.findMany();
  console.log(posts)
}

test1();
