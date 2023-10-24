import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

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

const deleteImageFromStorage = async (fileName: string) => {
    try {
        console.log('fileName', fileName);

        await storage.bucket(`${process.env.GOOGLE_STORAGE_BUCKET}`).file(fileName).delete();
        console.log(`File ${fileName} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting file ${fileName}: ${error}`);
        throw error;
    }
};

export { uploadImageToStorage, deleteImageFromStorage, uploadThumbnailImageToStorage };
