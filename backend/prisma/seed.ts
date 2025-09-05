import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


async function main() {
  const defaultUserId = "1b4e28ba-2fa1-11d2-883f-0016d3cca427";

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { id: defaultUserId } });
  if (existing) {
    console.log("Default user already exists.");
    return;
  }

  // Create default user
  const user = await prisma.user.create({
    data: {
      id: defaultUserId,
      username: "Default User",
      phoneNumber: "000-000-0000",
      homeAddress: "Default Address",
      pwd: false,
      volunteer: false,
      viaHours: 0,
    },
  });

  console.log("Default user created:", user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
