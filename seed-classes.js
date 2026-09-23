const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const classes = ['PKG', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];
  for (const cls of classes) {
    const exists = await prisma.class.findFirst({ where: { class_name: cls } });
    if (!exists) {
      await prisma.class.create({ data: { class_name: cls, section: 'A', academic_year: '2024-2025', status: 'ACTIVE' } });
      console.log('Created: ' + cls);
    } else {
      console.log('Already exists: ' + cls);
    }
  }
  console.log('Done seeding classes');
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
