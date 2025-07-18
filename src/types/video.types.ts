export interface PublishVideoBody {
    title: string;
    description: string;
    category: string;
}

export interface PublishVideoFile {
    videoFile: Express.Multer.File[];
    thumbnail: Express.Multer.File[]
}

export interface GetAllVideosReqQuery {
    page?: number;
    limit?: number;
    query?: string;
    sortBy?: string;
    sortType?: "asc" | "dsc";
    userId: string;
}

export interface VideoUpdateBody {
    title: string;
    description: string;
    videoFile: string;
    thumbnail: string;
    isPublished: boolean;
}
