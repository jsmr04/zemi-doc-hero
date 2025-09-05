import path from "path";
import { v4 as uuidv4 } from "uuid";
import { BUCKET_NAME } from "@/configs";
import { putObject } from "@/lib/aws/s3";

export const uploadFile = async (document: Express.Multer.File) => {
    const uuid = uuidv4()
    const objectName = `${uuid}${path.extname(document.originalname)}`
    
    await putObject({
        bucket: BUCKET_NAME,
        objectPrefix: 'upload',
        objectName: objectName,
        body: document.buffer
    })

    return {
        documentId: uuid,
        path: objectName,
        fileName: document.originalname
    }
}