import { apiClient } from "@/shared/api/axios";
import axios from "axios";

interface UploadUrlResponse {
  uploadURL: string;
  key: string;
}

interface Attachment {
  key: string;
  url: string;
}

export const requestUploadURL = async (
  ticketId: string,
  fileName: string,
  contentType: string,
): Promise<UploadUrlResponse> => {

  const { data } = await apiClient.post<UploadUrlResponse>(
    `/tickets/${ticketId}/attachments/upload-url`,
    { fileName, contentType },
  );

  return data;
};

export const getAttachments = async(ticketId: string): Promise<Attachment[]> => {
    const { data } = await apiClient.get<Attachment[]>(`/tickets/${ticketId}/attachments`)
    return data;
}


export const uploadFileToS3 = async(uploadUrl: string, file:File  ): Promise<void> => {
    await axios.put(uploadUrl, file, { headers: {
        "Content-Type": file.type
    } })
}

export const confirmAttachment = async(ticketId: string, key: string) => {
    const { data } = await apiClient.post(`/tickets/${ticketId}/attachments`, { key });
    return data;
}