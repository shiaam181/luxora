// Cloudinary upload helper

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @param {string} folder - Optional folder name
 * @returns {Promise<string>} - Image URL
 */
export const uploadImage = async (file, folder = 'products') => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', `luxora/${folder}`);

    console.log('Uploading to Cloudinary:', file.name);

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    console.log('Upload successful:', data.secure_url);

    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload ${file.name}`);
  }
};

/**
 * Delete image from Cloudinary (requires backend)
 */
export const deleteImage = async (imageUrl) => {
  console.log('Delete image:', imageUrl);
  // Note: Deletion requires backend with API secret
  return true;
};

/**
 * Get optimized image URL
 * @param {string} url - Original Cloudinary URL
 * @param {object} options - Transformation options
 */
export const getOptimizedUrl = (url, options = {}) => {
  if (!url) return url;
  
  const { width = 500, height = 500, quality = 'auto' } = options;
  
  // Insert transformation parameters into URL
  if (url.includes('upload/')) {
    return url.replace(
      'upload/',
      `upload/w_${width},h_${height},c_fill,q_${quality}/`
    );
  }
  
  return url;
};