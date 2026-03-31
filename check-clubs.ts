import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clubs = await prisma.club.findMany();
  console.log('Total Clubs found:', clubs.length);
  clubs.forEach(c => console.log(\`- \${c.name}\`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
