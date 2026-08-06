import { useQuery } from "@tanstack/vue-query"
import { attachmentKeys } from "../api/attachment.keys"
import { getAttachments } from "../api/attachments.api"

export const useAttachments = (ticketId: string) => {

    return useQuery({
        queryKey: attachmentKeys.byTicket(ticketId),
        queryFn: () => getAttachments(ticketId)
    })
}