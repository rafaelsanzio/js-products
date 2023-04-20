import express from "express";
import winston from "winston";
import path from "path";
import { promises } from "fs";
import { errors } from "celebrate";

import products from "./routes/products.js";

const fs = promises;
const app = express();

const { combine, timestamp, label, printf } = winston.format;
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

const jsonFile = path.join(process.cwd(), "./data/products.json");

global.productsFileJSON = jsonFile;
global.logger = winston.createLogger({
  level: "silly",
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "products-api.log" }),
  ],
  format: combine(label({ label: "products-api" }), timestamp(), logFormat),
});

app.use(express.json());
app.get("/", function (req, res) {
  res.redirect("/products");
});
app.use("/products", products);

app.use(errors());

app.listen(3000, async () => {
  try {
    await fs.readFile(productsFileJSON, "utf-8");
  } catch (err) {
    const initalJson = {
      nextID: 1,
      products: [],
    };
    fs.writeFile(productsFileJSON, JSON.stringify(initalJson)).catch((err) => {
      logger.error(err);
    });
  }
});
