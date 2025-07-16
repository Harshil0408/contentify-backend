export interface PublishVideoBody {
    title: string;
    description: string;
    category : string;
}

export interface PublishVideoFile {
    videoFile: Express.Multer.File[];
    thumbnail: Express.Multer.File[]
}
