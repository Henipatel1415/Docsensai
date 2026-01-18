

// src/routes/sopRoutes.js
import { Router } from "express";
import multer from "multer";
import { uploadSOP, deleteSOP, listSOPs,askQuestion } from "../controllers/sopController.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

router.post("/upload", upload.single("file"), uploadSOP);
router.delete("/:name", deleteSOP);
router.get("/list", listSOPs);
router.post("/ask", askQuestion); 

export default router;