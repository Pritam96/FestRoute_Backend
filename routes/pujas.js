import express from "express";
import {
  getPujas,
  getPuja,
  createPuja,
  editPuja,
  deletePuja,
} from "../controllers/pujas.js";

const router = express.Router();

router.get("/", getPujas);
router.get("/:id", getPuja);
router.post("/", createPuja);
router.put("/:id", editPuja);
router.delete("/:id", deletePuja);

export default router;
