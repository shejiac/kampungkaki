import {upsertChat} from './upsertChat'
import {Chat} from '../../types/chats'
import {getChatDetails} from './getChatsDetails'
import logger from '../db/logger'
import { error } from "console";




// 4) Room bootstrap
getThreadWithSession(
  threadId: string,
  userId: string // enforce membership (volunteer or beneficiary)
): Promise<{
  thread: { id: string, status: ThreadStatus, request_id: string, volunteer_id: string, beneficiary_id: string },
  request: { title: string | null, location: string | null, start_time?: string | null },
  session: SessionRow | null,
  messages: MessageRow[]
}>

// 1) Accept Request. When accepted request, creates chat that pairs volunteer and beneficiary
export async function acceptRequest(requestId: string, beneficiaryId: string, volunteerId: string): Promise<string>{
    const chat: Chat = {
        request_id: requestId,
        requester_id: beneficiaryId,
        volunteer_id: volunteerId
    }
    upsertChat(chat)
    const chat_details = await getChatDetails(requestId)
    const chat_id = chat_details.chat_id
    if (!chat_id){
        logger.error(`Failed to get chat id`);
        throw error;
    }
    return chat_id
}

// 3) Inbox
export async function listChatForUser(userId: string): Promise<ThreadListItem[]>{

}