// Script tự động quét và trích xuất kích thước + tỷ lệ khung hình thật của toàn bộ ảnh tài sản.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Trích xuất width, height từ header buffer của WebP, PNG, JPEG mà không cần thư viện bên ngoài.
 * @param {Buffer} buf
 * @returns {{ width: number, height: number } | null}
 */
function getDimensionsFromBuffer(buf) {
  if (buf.length < 32) return null;

  // WebP
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
    const chunk = buf.toString('ascii', 12, 16);
    if (chunk === 'VP8 ') {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
    if (chunk === 'VP8L') {
      const b1 = buf[21];
      const b2 = buf[22];
      const b3 = buf[23];
      const b4 = buf[24];
      return {
        width: 1 + (((b2 & 0x3f) << 8) | b1),
        height: 1 + ((((b4 & 0xf) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6))),
      };
    }
    if (chunk === 'VP8X') {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
  }

  // PNG
  if (buf.toString('hex', 0, 8) === '89504e470d0a1a0a') {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }

  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset < buf.length) {
      if (buf[offset] !== 0xff) break;
      const marker = buf[offset + 1];
      if (marker === 0xc0 || marker === 0xc2) {
        return {
          width: buf.readUInt16BE(offset + 7),
          height: buf.readUInt16BE(offset + 5),
        };
      }
      offset += 2 + buf.readUInt16BE(offset + 2);
    }
  }

  return null;
}

const targetDirs = [
  path.join(rootDir, 'public', 'assets', 'events'),
  path.join(rootDir, 'public', 'assets', 'sources'),
];

const metadata = {};
let count = 0;

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) continue;
  const folderName = path.basename(dir);
  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (!/\.(webp|png|jpg|jpeg)$/i.test(file)) continue;
    const fullPath = path.join(dir, file);
    try {
      const buf = fs.readFileSync(fullPath);
      const dims = getDimensionsFromBuffer(buf);
      if (dims && dims.width > 0 && dims.height > 0) {
        const aspect = Math.round((dims.width / dims.height) * 1000) / 1000;
        const key = `assets/${folderName}/${file}`;
        metadata[key] = {
          width: dims.width,
          height: dims.height,
          aspect,
        };
        count += 1;
      }
    } catch (err) {
      console.warn(`Could not read ${file}:`, err.message);
    }
  }
}

const fileHeader = `// Metadata kích thước và tỷ lệ gốc của các hình ảnh tư liệu lịch sử.
// Tạo tự động bởi scripts/generateImageMetadata.mjs.

export const IMAGE_METADATA = Object.freeze(${JSON.stringify(metadata, null, 2)});

/**
 * Trả về tỷ lệ aspect ratio (width / height) thực tế của một ảnh.
 * Tự động chuẩn hóa đường dẫn và có cơ chế tìm kiếm theo tên tệp.
 * @param {string} src Đường dẫn ảnh hoặc tên file
 * @param {number} fallback Tỷ lệ dự phòng nếu không tìm thấy (mặc định 1.33)
 * @returns {number}
 */
export function getImageAspect(src, fallback = 1.33) {
  if (!src || typeof src !== 'string') return fallback;
  const clean = src.replace(/^\\.?\\/+/g, '').replace(/^web_clone\\/+/g, '');
  if (IMAGE_METADATA[clean]?.aspect) return IMAGE_METADATA[clean].aspect;

  const fileName = clean.split('/').pop()?.split('?')[0];
  if (fileName) {
    for (const [key, val] of Object.entries(IMAGE_METADATA)) {
      if (key.endsWith(fileName) && val?.aspect) {
        return val.aspect;
      }
    }
  }
  return fallback;
}

/**
 * Trả về thông tin kích thước gốc { width, height, aspect } của một ảnh.
 * @param {string} src
 * @returns {{ width: number, height: number, aspect: number } | null}
 */
export function getImageDimensions(src) {
  if (!src || typeof src !== 'string') return null;
  const clean = src.replace(/^\\.?\\/+/g, '').replace(/^web_clone\\/+/g, '');
  if (IMAGE_METADATA[clean]) return IMAGE_METADATA[clean];

  const fileName = clean.split('/').pop()?.split('?')[0];
  if (fileName) {
    for (const [key, val] of Object.entries(IMAGE_METADATA)) {
      if (key.endsWith(fileName)) return val;
    }
  }
  return null;
}
`;

const outputPath = path.join(rootDir, 'src', 'imageMetadata.js');
fs.writeFileSync(outputPath, fileHeader, 'utf8');
console.log(`Đã tạo thành công ${outputPath} với metadata của ${count} ảnh.`);
