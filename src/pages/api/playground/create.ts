// API end point that creates a swift playground from the provided code
import type { NextApiRequest, NextApiResponse } from "next";
import { makeSwiftPackage } from "@/lib/playground";
import createZip from "@/lib/zip";
import { getPlaygroundFileKey, getPlaygroundZipKey } from "@/lib/storage";
import { writeBufferToS3 } from "../../../lib/s3Client";
import { serverUrl } from "@/lib/config";
interface PlaygroundCreateRequestBody {
  code: string;
  name: string;
}

interface BodyApiRequest extends NextApiRequest {
  body: PlaygroundCreateRequestBody;
}
interface PlaygroundCreateResponseBody {
  url: string;
  requestId: string;
}

async function createPlaygroundLink(
  name: string,
  requestId: string,
  code: string
): Promise<PlaygroundCreateResponseBody> {
  const files = makeSwiftPackage(name, code, []);
  const zipData = await createZip(files);
  const _writeZip = writeBufferToS3(
    zipData,
    getPlaygroundZipKey(name, requestId)
  );
  const _writeFiles = Promise.all(
    Object.entries(files).map(([key, content]) =>
      writeBufferToS3(
        Buffer.from(content),
        getPlaygroundFileKey(name, requestId, key)
      )
    )
  );
  const [zip, individualFiles] = await Promise.all([_writeZip, _writeFiles]);
  console.log("finished", { zip, individualFiles });
  const url = `${serverUrl}/playground/${requestId}/${name}`;
  return {
    requestId,
    url,
  };
}

function genRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export default async function handler(
  req: BodyApiRequest,
  res: NextApiResponse
) {
  console.log(`${req.method} /playground/create`);
  if (req.method === "POST") {
    // TODO: zod
    const { code, name } = req.body as PlaygroundCreateRequestBody;
    console.log(`-> ${code}`);
    const requestId = genRequestId();
    const playground = await createPlaygroundLink(name, requestId, code);
    console.log(`<- ${JSON.stringify(playground)}`);
    res.status(200).json(playground);
  } else if (req.method === "OPTIONS") {
    console.log(`->: OPTIONS`, req.headers);
    // WHY ISN'T THIS HANDLED BY NEXT.JS?
    res.setHeader("Access-Control-Allow-Origin", "https://chat.openai.com");
    res.setHeader("Access-Control-Allow-Methods", "POST");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    res.status(200).send("OK");
  } else {
    console.log(`Method not allowed: ${req.method}`);
    res.status(405).send("Method not allowed");
  }
}
