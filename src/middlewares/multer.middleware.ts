import { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'

const storage = multer.diskStorage({
    destination: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ): void {
        cb(null,  path.join(process.cwd(), 'public/temp'))
    },
    filename: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ): void {
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage })