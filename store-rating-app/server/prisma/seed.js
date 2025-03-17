const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Starting seed...");

    // Clean up existing data
    await prisma.rating.deleteMany({});
    await prisma.store.deleteMany({});
    await prisma.user.deleteMany({});

    console.log("Deleted existing data");

    // Create admin user
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const admin = await prisma.user.create({
      data: {
        name: "System Administrator Account",
        email: "admin@example.com",
        password: adminPassword,
        address: "123 Admin Street, Admin City, Admin Country",
        role: "ADMIN",
      },
    });

    console.log("Created admin user:", admin.email);

    // Create normal users
    const normalUserPassword = await bcrypt.hash("User@123", 10);
    const normalUsers = [];

    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.create({
        data: {
          name: `Normal User Account ${i}`.padEnd(20, " "),
          email: `user${i}@example.com`,
          password: normalUserPassword,
          address: `${i}23 User Street, User City, User Country`,
          role: "USER",
        },
      });
      normalUsers.push(user);
      console.log("Created normal user:", user.email);
    }

    // Create store owners
    const storeOwnerPassword = await bcrypt.hash("Owner@123", 10);
    const storeOwners = [];

    for (let i = 1; i <= 3; i++) {
      const owner = await prisma.user.create({
        data: {
          name: `Store Owner Account ${i}`.padEnd(20, " "),
          email: `owner${i}@example.com`,
          password: storeOwnerPassword,
          address: `${i}23 Owner Street, Owner City, Owner Country`,
          role: "STORE_OWNER",
        },
      });
      storeOwners.push(owner);
      console.log("Created store owner:", owner.email);
    }

    // Create stores
    const stores = [];

    for (let i = 0; i < storeOwners.length; i++) {
      const store = await prisma.store.create({
        data: {
          name: `Amazing Store ${i + 1}`.padEnd(20, " "),
          email: `store${i + 1}@example.com`,
          address: `${i + 1}23 Store Street, Store City, Store Country`,
          ownerId: storeOwners[i].id,
        },
      });
      stores.push(store);
      console.log("Created store:", store.name);
    }

    // Create additional stores without owners
    for (let i = 4; i <= 6; i++) {
      const store = await prisma.store.create({
        data: {
          name: `Amazing Store ${i}`.padEnd(20, " "),
          email: `store${i}@example.com`,
          address: `${i}23 Store Street, Store City, Store Country`,
        },
      });
      stores.push(store);
      console.log("Created store without owner:", store.name);
    }

    // Create ratings
    for (const user of normalUsers) {
      for (const store of stores) {
        // Random rating between 1 and 5
        const value = Math.floor(Math.random() * 5) + 1;

        const rating = await prisma.rating.create({
          data: {
            value,
            userId: user.id,
            storeId: store.id,
          },
        });
        console.log(
          `Created rating: ${user.email} rated ${store.name} with ${value} stars`
        );
      }
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
