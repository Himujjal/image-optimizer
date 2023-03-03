const express = require("express");
const multer = require("multer");
const app = express();
const port = process.env.PORT || 8000;
const sharp = require("sharp");
const dotenv = require("dotenv");

dotenv.config();

const upload = multer({ storage: multer.memoryStorage() });

const { API_KEY, CLOUD_NAME, UPLOAD_PRESET } = process.env;

/**
 * @param {Uint8Array} imageBuffer
 * @param {string} public_id
 * */
async function uploadFile(imageBuffer, public_id) {
  const form = new FormData();
  form.append("file", new Blob([imageBuffer]));
  form.append("api_key", API_KEY);
  form.append("cloud_name", CLOUD_NAME);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("public_id", public_id ?? crypto.randomUUID());
  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dg9rlaf37/image/upload",
    {
      body: form,
      method: "POST",
    }
  );
  const j = await res.json();
  return j?.url;
}

async function modifyImage(imageBuffer) {
  return await sharp(imageBuffer).webp({ quality: 80 }).toBuffer();
}

app.post("/", upload.single("image"), async (req, res) => {
  const file_name = req.body.public_id;
  const file = req.file;
  if (file && file_name) {
    const compressed = await modifyImage(file.buffer);
    return res.json({ url: await uploadFile(compressed, file_name) });
  }
  return res.status(400).json({ error: "Error" });
});

app.listen(port, () => console.log(`HelloNode app listening on port ${port}!`));
