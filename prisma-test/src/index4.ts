import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient();

async function test4() {
  await prisma.post.delete({
      where: {
          id: 2
      }
  });
}
test4();