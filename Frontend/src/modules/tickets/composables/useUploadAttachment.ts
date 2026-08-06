import { useMutation, useQueryClient } from '@tanstack/vue-query';
import {
  confirmAttachment,
  requestUploadURL,
  uploadFileToS3,
} from '../api/attachments.api';
import { attachmentKeys } from '../api/attachment.keys';

const MAX_FILE_SIZE_MB = 5;
const ALLOWED_CONTENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/pdf',
] as const;

export const useUploadAttachment = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!ALLOWED_CONTENT_TYPES.includes(file.type as (typeof ALLOWED_CONTENT_TYPES)[number])) {
        throw new Error(
          'Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, GIF o PDF.',
        );
      }

      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        throw new Error(
          `El tamaño del archivo no debe de exceder de ${MAX_FILE_SIZE_MB}MB`,
        );
      }

      const { key, uploadURL } = await requestUploadURL(
        ticketId,
        file.name,
        file.type,
      );

      await uploadFileToS3(uploadURL, file);
      return confirmAttachment(ticketId, key);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attachmentKeys.byTicket(ticketId),
      });
    },
  });
};
