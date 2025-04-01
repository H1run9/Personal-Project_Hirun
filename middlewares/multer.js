const multer = require("multer");

// กำหนดพื้นที่จัดเก็บไฟล์ในหน่วยความจำ (memoryStorage)
const storage = multer.memoryStorage(); // ใช้ memoryStorage เพื่ออัปโหลดไป Cloudinary หรือบริการอื่น

// ตรวจสอบประเภทไฟล์ที่อนุญาต (เช่น MP3, WAV, JPEG, PNG)
const fileFilter = (req, file, cb) => {
    const audioTypes = ["audio/mpeg", "audio/wav", "audio/mp3"]; // ประเภทไฟล์เสียง
    const imageTypes = ["image/jpeg", "image/png"]; // ประเภทไฟล์ภาพ

    if (audioTypes.includes(file.mimetype)) {
        cb(null, true); // อนุญาตไฟล์เสียง
    } else if (imageTypes.includes(file.mimetype)) {
        cb(null, true); // อนุญาตไฟล์ภาพ
    } else {
        cb(new Error("ไฟล์ต้องเป็น MP3, WAV, JPEG หรือ PNG เท่านั้น"), false); // หากไฟล์ไม่ตรงตามที่กำหนด
    }
};

// ตั้งค่าอัปโหลด (จำกัดขนาดไฟล์ 10MB สำหรับไฟล์เสียง และ 5MB สำหรับไฟล์ภาพ)
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // ขนาดไฟล์เสียงสูงสุด 10MB
    fileFilter: fileFilter, // ตรวจสอบประเภทไฟล์
});

module.exports = upload;

