import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import dotenv from 'dotenv'
dotenv.config()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dd7rzfpcx',
    api_key: process.env.CLOUDINARY_API_KEY || '325267138495394',
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localfilePath: string) => {
    try {
        if (!localfilePath) return null;
        const response = await cloudinary.uploader.upload(localfilePath, {
            resource_type: 'auto'
        })
        fs.unlinkSync(localfilePath)
        return response
    } catch (error) {
        fs.unlinkSync(localfilePath)
        console.log("Error uploading file to cloudinary", error)
        throw error
    }
}

const deleteCloudinaryFiles = async (publicId: string, resource_type: string) => {
    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: resource_type })
    } catch (error) {
        console.log("Error in delete cloudinary files", error)
        throw error
    }
}

export { uploadOnCloudinary, deleteCloudinaryFiles }