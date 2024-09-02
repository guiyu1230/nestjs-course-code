import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function test3() {
  await prisma.post.update({
      where: {
          id: 2
      },
      data: {
          content: 'xxx'
      }
  })
}
test3();