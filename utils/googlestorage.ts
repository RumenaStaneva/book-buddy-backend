import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const storage = new Storage({
    projectId: process.env.GOOGLE_STORAGE_PROJECT_ID,
    credentials: {
        client_email: process.env.GOOGLE_STORAGE_EMAIL,
        private_key: process.env.GOOGLE_STORAGE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
});

const bucket = storage.bucket(process.env.GOOGLE_STORAGE_BUCKET || 'book-buddy');

// Upload image to Google Cloud Storage
async function uploadImageToStorage(encodedImage: string) {
    const uniqueFilename = `${uuidv4()}.png`;
    const buffer = Buffer.from(encodedImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const file = bucket.file(`profile-pictures/${uniqueFilename}`);

    await file.save(buffer, {
        metadata: {
            contentType: 'image/png',
        },
    });

    return file;
}

// Upload image to Google Cloud Storage
async function uploadThumbnailImageToStorage(encodedImage: string) {
    const uniqueFilename = `${uuidv4()}.png`;
    const buffer = Buffer.from(encodedImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const file = bucket.file(`book-thumbnails/${uniqueFilename}`);

    await file.save(buffer, {
        metadata: {
            contentType: 'image/png',
        },
    });

    return file;
}

async function uploadImageByUrlToStorage(imageUrl: string) {

    try {
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
        });

        if (response.status !== 200) {
            throw new Error('Failed to download image');
        }

        const imageBuffer = Buffer.from(response.data, 'binary');

        const uniqueFilename = `${Date.now()}.png`;

        const file = bucket.file(`book-thumbnails/${uniqueFilename}`);

        await file.save(imageBuffer, {
            metadata: {
                contentType: 'image/png',
            },
        });
        return file;
    } catch (error) {
        console.error('Error uploading image from URL to Google Cloud Storage:', error);
        throw new Error('Failed to upload image from URL to Google Cloud Storage');
    }
}


const deleteImageFromStorage = async (fileName: string) => {
    try {
        await storage.bucket(`${process.env.GOOGLE_STORAGE_BUCKET}`).file(fileName).delete();
        console.log(`File ${fileName} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting file ${fileName}: ${error}`);
        throw error;
    }
};

function isBase64(str: string): boolean {
    const base64Regex = /^data:image\/\w+;base64,/;
    return base64Regex.test(str);
}

export { uploadImageToStorage, deleteImageFromStorage, uploadThumbnailImageToStorage, uploadImageByUrlToStorage, isBase64 };
