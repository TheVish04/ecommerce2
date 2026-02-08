import axios from 'axios';

/**
 * Uploads a file to Cloudinary.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string>} - The URL of the uploaded image.
 */
export const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
        console.warn('Cloudinary environment variables missing. Using placeholder.');
        // Return a mock URL for development if keys are missing
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(URL.createObjectURL(file));
            }, 1000);
        });
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        return response.data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};
