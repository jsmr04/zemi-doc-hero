import { Readable } from "stream";
import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { AWS_REGION, AWS_CUSTOM_PROFILE, BUCKET_NAME } from "@/configs";

const PRESIGNED_URL_EXPIRES_IN = 3600

const s3Client = new S3Client({
    region: AWS_REGION,
    profile: AWS_CUSTOM_PROFILE ? AWS_CUSTOM_PROFILE : undefined
})

type ObjectPrefix = 'upload' | 'download'

export type PutObjectParams = {
    bucket?: string
    body: any
    objectPrefix?: ObjectPrefix
    objectName?: string
}

export type GetObjectParams = {
    bucket?: string
    objectPrefix?: ObjectPrefix
    objectName?: string
}

export const putObject = async ({ bucket, objectName, body, objectPrefix }: PutObjectParams) => {
    const key = `${objectPrefix ? objectPrefix + '/' : ''}${objectName}`
    const putObjectCommand = new PutObjectCommand({
        Bucket: bucket || BUCKET_NAME,
        Key: key,
        Body: body
    })

    s3Client.send(putObjectCommand)
}

export const getObject = async ({ bucket, objectName, objectPrefix }: GetObjectParams) => {
    const key = `${objectPrefix ? objectPrefix + '/' : ''}${objectName}`
    const getObjectCommand = new GetObjectCommand({
        Bucket: bucket || BUCKET_NAME,
        Key: key,
    })
    const object = await s3Client.send(getObjectCommand);
    const { Body } = object
    
    if (!Body || !(Body instanceof Readable)) {
        throw new Error(`S3 object is not a readable stream`);
    }

    return Body
}

export const getObjectAndConvertToBuffer = async ({ bucket, objectName, objectPrefix }: GetObjectParams) => {
    const stream = await getObject({
        objectPrefix: 'upload',
        objectName
    })

    const document = await streamToBuffer(stream)
    return document
}

export const presignUrlFromExistingObject = async ({ bucket, objectName, objectPrefix }: GetObjectParams) => {
    const key = `${objectPrefix ? objectPrefix + '/' : ''}${objectName}`
    const getObjectCommand = new GetObjectCommand({
        Bucket: bucket || BUCKET_NAME,
        Key: key,
    })
    return await getSignedUrl(s3Client, getObjectCommand, { expiresIn: PRESIGNED_URL_EXPIRES_IN })
}

const streamToBuffer = async (stream: Readable): Promise<Buffer> => {
    const chunks: Uint8Array[] = [];

    for await (const chunk of stream) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
};