import { seed } from "./seed";
import { Storage } from "./storage";

(async () => {
  console.log("Starting manual database seed...");
  try {
    await seed(new Storage());
    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
})();
