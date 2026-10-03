import { extractPdfFromBuffer } from "../lib/pdf.js";
import { enqueueSourceProcessing } from "../lib/source-event.js";
import {
  createSourceRecord,
  listSourcesByWorkspaceId,
  deleteSourceById,
} from "../repositories/source.repository.js";
import { getWorkspaceByIdService } from "./workspace.service.js";


async function createAndProcessSource(
    data: Parameters<typeof createSourceRecord>[0],
) {
    console.log(data)
    const source = await createSourceRecord(data);

    await enqueueSourceProcessing({
        // @ts-expect-error
        sourceId: source.id,
        // @ts-expect-error
        workspaceId: source.workspaceId,
    });

    return source;
}


export async function uploadPdfSource(
    workspaceId: string,
    userId: string,
    file: Express.Multer.File,
    title?: string,
) {
    await getWorkspaceByIdService(workspaceId, userId);

    // const upload = await uploadPdfToCloudinary(
    //     file.buffer,
    //     file.originalname,
    // );

    let content: string | null = null;
    let pageCount: number | undefined;

    try {
        const extracted = await extractPdfFromBuffer(file.buffer);
        content = extracted.text;
        pageCount = extracted.pageCount;
    } catch {
        // Inngest will retry extraction from Cloudinary if upload-time parse fails.
    }

    return createAndProcessSource({
        workspaceId,
        type: "pdf",
        title: title?.trim() || file.originalname.replace(/\.pdf$/i, ""),
        content: content || "",
        status: "pending",
        metadata: {
            // fileUrl: upload.secureUrl,
            // fileName: upload.originalFilename,
            // fileSize: upload.bytes,
            // publicId: upload.publicId,
            // resourceType: upload.resourceType,
            pageCount,
        },
    });
}

export async function listSourcesService(workspaceId: string, userId: string) {
    await getWorkspaceByIdService(workspaceId, userId);
    return listSourcesByWorkspaceId(workspaceId);
}

export async function deleteSourceService(
    sourceId: string,
    workspaceId: string,
    userId: string,
) {
    await getWorkspaceByIdService(workspaceId, userId);
    return deleteSourceById(sourceId, workspaceId);
}