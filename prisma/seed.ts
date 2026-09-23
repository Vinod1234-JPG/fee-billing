import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const assistantPassword = await bcrypt.hash('assistant123', 10)

  // Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      name: 'Super Admin',
      password_hash: adminPassword,
      role: 'ADMIN',
      phone: '1234567890',
    },
  })

  // Create Assistant
  const assistant = await prisma.user.upsert({
    where: { email: 'assistant@school.com' },
    update: {},
    create: {
      email: 'assistant@school.com',
      name: 'John Assistant',
      password_hash: assistantPassword,
      role: 'ASSISTANT',
      phone: '0987654321',
    },
  })

  // Create Class
  const class1A = await prisma.class.create({
    data: {
      class_name: 'Class 1',
      section: 'A',
      academic_year: '2023-2024',
      assistant_id: assistant.id,
    }
  })

  // Create Parent
  const parent = await prisma.parent.create({
    data: {
      father_name: 'Robert Smith',
      mother_name: 'Mary Smith',
      phone: '5551234567',
      address: '123 Main St, Springfield',
      city: 'Springfield',
      state: 'IL',
      pin_code: '62701'
    }
  })

  // Create Bus
  const bus1 = await prisma.bus.create({
    data: {
      bus_number: 'B-01',
      vehicle_number: 'XY 1234',
      driver_name: 'Mike Johnson',
      driver_phone: '5559876543',
      route: 'North Route',
      capacity: 40
    }
  })

  // Create Student
  const student = await prisma.student.create({
    data: {
      student_id: 'STU-001',
      first_name: 'James',
      last_name: 'Smith',
      gender: 'Male',
      date_of_birth: new Date('2015-05-15'),
      admission_date: new Date('2023-01-10'),
      class_id: class1A.id,
      section: 'A',
      academic_year: '2023-2024',
      assistant_id: assistant.id,
      parent_id: parent.id,
      uses_bus: true,
      bus_id: bus1.id,
      pickup_point: 'Main Square'
    }
  })

  // Create Fees
  await prisma.fee.create({
    data: {
      student_id: student.id,
      total_amount: 5000,
      paid_amount: 2000,
      balance_amount: 3000,
      status: 'BALANCE',
    }
  })

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
