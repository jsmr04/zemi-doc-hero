import path from "path";
import { v4 as uuidv4 } from "uuid";
import { AWS_REGION, AWS_CUSTOM_PROFILE, BUCKET_NAME } from "@/configs";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: AWS_REGION,
    profile: AWS_CUSTOM_PROFILE ? AWS_CUSTOM_PROFILE : undefined
})

export const uploadFile = async (document: Express.Multer.File) => {
    const uuid = uuidv4()
    const objectName = `upload/${uuid}${path.extname(document.originalname)}`

    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: objectName,
        Body: document.buffer
    }))

    return {
        documentId: uuid,
        path: objectName,
        fileName: document.originalname
    }
}