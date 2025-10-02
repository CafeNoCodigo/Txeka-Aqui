import express from "express";
import adminRoutes from "./routes/admin.ts";

const app = express();

app.use("/admin", adminRoutes);

app.listen(3001, () => {
  console.log("Backend rodando na porta 3001");
});
