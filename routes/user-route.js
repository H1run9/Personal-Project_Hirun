const express = require("express");
const uploadController = require("../controllers/uploads-controller");
const upload = require("../middlewares/multer"); // Middleware สำหรับอัปโหลดไฟล์
const router = express.Router();

// API Routes
router.post("/upload", upload.fields([{ name: "audioFile", maxCount: 1 }, { name: "albumCover", maxCount: 1 }]), uploadController.uploadMusic);
router.get("/sample", uploadController.getAllMusic);
router.delete("/:id", uploadController.deleteMusic);
router.put("/:id", upload.single("audioFile"), uploadController.updateMusic);

module.exports = router;
