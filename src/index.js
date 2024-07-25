import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/connection.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8001;

try {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
} catch (error) {
  console.log(`MongoDB Connection error ${error}`);
}
