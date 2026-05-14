import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload file ke Cloudinary.
 * @param file - File object dari FormData
 * @param folder - Folder di Cloudinary, contoh: 'siap-laundry/laundry'
 * @returns URL gambar yang bisa langsung dipakai di <Image>
 */
export async function saveUploadedFile(
  file: File,
  folder: string
): Promise<string> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `siap-laundry/${folder}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload gagal'))
        } else {
          resolve(result.secure_url)
        }
      }
    )
    uploadStream.end(buffer)
  })
}
