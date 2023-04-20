import express from "express";
import { promises } from "fs";
import { celebrate, Joi, Segments } from "celebrate";

import { ReadJSONFile } from "../data/json.js";

const fs = promises;
const router = express.Router();

// POST - Return a new product created
router.post(
  "/",
  celebrate({
    [Segments.BODY]: {
      description: Joi.string().min(2).required(),
      value: Joi.number().required(),
      brand: Joi.string().required(),
    },
  }),
  async (req, res) => {
    let product = req.body;
    try {
      let result = ReadJSONFile();

      product = { id: result.nextID++, ...product, timestamp: new Date() };
      result.products.push(product);
      delete product.nextID;

      await fs
        .writeFile(productsFileJSON, JSON.stringify(result))
        .then(() => {
          logger.info(`POST /products - ${JSON.stringify(product)}`);
          res.send(product);
        })
        .catch((err) => {
          logger.error(`POST /products - ${err.message}`);
          res.status(400).send({ error: err.message });
        });
    } catch (err) {
      logger.error(`POST /products - ${err.message}`);
      res.status(400).send({ error: err.message });
    }
  }
);

// PUT - Return a product updated passing by id
router.put(
  "/:id",
  celebrate({
    [Segments.BODY]: {
      description: Joi.string().min(2).required(),
      value: Joi.number().required(),
      brand: Joi.string().required(),
    },
    [Segments.PARAMS]: {
      id: Joi.number().required(),
    },
  }),
  async (req, res) => {
    try {
      let { description, value, brand } = req.body;
      let result = ReadJSONFile();
      let id = Number(req.params.id);

      const findProduct = result.products.findIndex(
        (product) => product.id === id
      );
      if (findProduct === -1) {
        logger.error(`PUT /products/:id - Product Not Found`);
        res.status(404).send({ error: "Product Not Found" });
        return;
      }

      result.products[findProduct].description = description;
      result.products[findProduct].value = value;
      result.products[findProduct].brand = brand;

      await fs
        .writeFile(productsFileJSON, JSON.stringify(result))
        .then(() => {
          logger.info(
            `PUT /products - ${JSON.stringify(result.products[findProduct])}`
          );
          res.send(result.products[findProduct]);
        })
        .catch((err) => {
          logger.error(`PUT /products/:id - ${err.message}`);
          res.status(400).send({ error: err.message });
        });
    } catch (err) {
      logger.error(`PUT /products/:id - ${err.message}`);
      res.status(400).send({ error: err.message });
    }
  }
);

// DELETE - Return a product deleted by id
router.delete(
  "/:id",
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.number().required(),
    },
  }),
  async (req, res) => {
    try {
      let result = ReadJSONFile();
      let id = Number(req.params.id);

      const product = result.products.find((product) => product.id === id);
      if (!product) {
        logger.error(`DELETE /products/:id - Product Not Found`);
        res.status(404).send({ error: "Product Not Found" });
        return;
      }

      const products = result.products.filter((product) => product.id !== id);
      if (!products) {
        logger.error(`DELETE /products/:id - Product Not Found`);
        res.status(404).send({ error: "Product Not Found" });
        return;
      }
      result.products = products;

      await fs
        .writeFile(productsFileJSON, JSON.stringify(result))
        .then(() => {
          logger.info(`DELETE /products - ${JSON.stringify(product)}`);
          res.send(product);
        })
        .catch((err) => {
          logger.error(`DELETE /products:id - ${err.message}`);
          res.status(400).send({ error: err.message });
        });
    } catch (err) {
      logger.error(`DELETE /products/:id - ${err.message}`);
      res.status(400).send({ error: err.message });
    }
  }
);

// GET - Return all products
router.get("/", async (req, res) => {
  try {
    let result = ReadJSONFile();

    logger.info(`GET /products - ${JSON.stringify(result.products)}`);
    res.send(result.products);
  } catch (err) {
    logger.error(`GET /products - ${err.message}`);
    res.status(400).send({ error: err.message });
  }
});

// GET - Return a product selected by id
router.get(
  "/:id",
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.number().required(),
    },
  }),
  async (req, res) => {
    try {
      let result = ReadJSONFile();
      let id = Number(req.params.id);

      let product = result.products.find((product) => product.id === id);
      if (!product) {
        logger.error(`GET /products/:id - Product Not Found`);
        res.status(404).send({ error: "Product Not Found" });
        return;
      }
      logger.info(`GET /products/:id - ${JSON.stringify(product)}`);
      res.send(product);
    } catch (err) {
      logger.error(`GET /products/:id - ${err.message}`);
      res.status(400).send({ error: err.message });
    }
  }
);

export default router;
