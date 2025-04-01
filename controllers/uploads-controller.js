const path = require('path');
const fs = require('fs/promises');
const tryCatch = require('../utils/tryCatch');
const cloudinary = require('../config/cloudinary');
const prisma = require('../configs/prisma');
const createError = require('../utils/createError');

module.exports.uploadMusic = tryCatch(async (req, res) => {
  const audioFile = req.files.audioFile ? req.files.audioFile[0] : null;
  const albumCover = req.files.albumCover ? req.files.albumCover[0] : null;
  let { title, trackType, visibility, releaseDate, price, genres, textInfo, userId } = req.body;

  console.log("ข้อมูลที่ได้รับจาก request:", req.body);
  console.log("ไฟล์ที่ได้รับจาก request:", req.files);

  // แปลงค่าที่ได้รับให้เป็นประเภทที่ถูกต้อง
  visibility = visibility === 'true' || visibility === true;
  releaseDate = new Date(releaseDate.replace(/"/g, ''));
  price = parseFloat(price);
  userId = parseInt(userId);

  let genresArray = [];
  try {
    genresArray = JSON.parse(genres);
    if (!Array.isArray(genresArray)) throw new Error();
  } catch (e) {
    return res.status(400).json({ message: "ข้อมูล genres ไม่ถูกต้อง" });
  }

  if (!title) return res.status(400).json({ message: "กรุณากรอกชื่อเพลง (title)" });
  if (!trackType) return res.status(400).json({ message: "กรุณากรอก trackType" });
  if (visibility === undefined || visibility === null) return res.status(400).json({ message: "กรุณากรอก visibility" });
  if (isNaN(releaseDate.getTime())) return res.status(400).json({ message: "กรุณากรอกวันที่ให้ถูกต้อง" });
  if (isNaN(price)) return res.status(400).json({ message: "กรุณากรอกราคาให้ถูกต้อง" });
  if (!genresArray.length) return res.status(400).json({ message: "กรุณาเลือกประเภทเพลงอย่างน้อย 1 ประเภท" });
  if (!audioFile) return res.status(400).json({ message: "กรุณาอัปโหลดไฟล์เพลง" });
  if (!textInfo) return res.status(400).json({ message: "กรุณากรอกรายละเอียดเพลง" });
  if (!albumCover) return res.status(400).json({ message: "กรุณาอัปโหลดปกอัลบั้ม" });
  if (!userId) return res.status(400).json({ message: "กรุณาระบุ userId" });

  const userExists = await prisma.user.findUnique({ where: { id: userId } });
  if (!userExists) return res.status(404).json({ message: "ไม่พบผู้ใช้ที่มี ID นี้" });

  const uploadResult = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => (error ? reject(error) : resolve(result))
    ).end(audioFile.buffer);
  });

  let coverImageURL = "";
  try {
    const coverUpload = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => (error ? reject(error) : resolve(result))
      ).end(albumCover.buffer);
    });
    coverImageURL = coverUpload.secure_url;
  } catch (error) {
    return res.status(500).json({ message: "Error uploading album cover image to Cloudinary", error });
  }

  const music = await prisma.sample.create({
    data: {
      title,
      trackType,
      visibility,
      releaseDate,
      price,
      genres: JSON.stringify(genresArray),  
      audio_url: uploadResult.secure_url,
      album_cover_url: coverImageURL,
      text_info: textInfo,
      user: { connect: { id: userId } },
    },
  });
  res.status(201).json({ message: "อัปโหลดเพลงสำเร็จ!", music });
});

module.exports.updateMusic = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { title, artist, genre, removeCover, albumCover } = req.body;

  const music = await prisma.sample.findUnique({ where: { id: +id } });
  if (!music) return res.status(404).json({ message: "ไม่พบเพลงนี้" });

  let coverImageURL = music.album_cover_url;
  if (albumCover) {
    const coverUpload = await cloudinary.uploader.upload(albumCover, { resource_type: "image" });
    coverImageURL = coverUpload.secure_url;
  } else if (removeCover) {
    coverImageURL = null;
  }

  const updatedMusic = await prisma.sample.update({
    where: { id: +id },
    data: {
      title: title || music.title,
      artist: artist || music.artist,
      genre: genre || music.genre,
      album_cover_url: coverImageURL,
    }
  });
  res.json({ message: "อัปเดตข้อมูลเพลงสำเร็จ", updatedMusic });
});

module.exports.getAllMusic = tryCatch(async (req, res) => {
  const musicList = await prisma.sample.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ musicList });
});

module.exports.deleteMusic = tryCatch(async (req, res) => {
  const { id } = req.params;
  const music = await prisma.sample.findUnique({ where: { id: +id } });
  if (!music) return res.status(404).json({ message: "ไม่พบเพลงนี้" });

  await cloudinary.uploader.destroy(path.parse(music.audio_url).name);
  const deletedMusic = await prisma.sample.delete({ where: { id: +id } });

  res.json({ message: "ลบเพลงสำเร็จ", deletedMusic });
});
