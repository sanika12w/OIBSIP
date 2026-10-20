
import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});



// San06@pizza_app_user24

// mongodb+srv://<db_username>:<db_password>@project.gy4mqfg.mongodb.net/