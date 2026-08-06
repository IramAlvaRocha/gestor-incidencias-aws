import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { IStorageService } from "../../application/ports/IStorageService.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const URL_EXPIRATION_SECONDS  = 300;

export class S3StorageService implements IStorageService {

    private readonly client: S3Client;
    
    constructor(
        private readonly bucketName: string,
        region: string
    ) {
        this.client = new S3Client({ region })
    }
    
    getUploadUrl(key: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType
        });

        return getSignedUrl(this.client, command, { expiresIn: URL_EXPIRATION_SECONDS })
    }
    getDownloadUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key
        });

        return getSignedUrl(this.client, command, { expiresIn: URL_EXPIRATION_SECONDS })
    }
    
}