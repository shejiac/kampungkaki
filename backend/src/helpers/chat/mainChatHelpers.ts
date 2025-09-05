import {upsertChat} from './upsertChat'
import {Chat, ChatListItem} from '../../types/chats'
import {getChatDetails} from './getChatsDetails'
import { getRequestsByUserId } from './getRequestsByUserId'
import logger from '../db/logger'
import { error } from "console";
import { getChatMessages, getLastChatMessage } from './getChatMessages'
import { upsertAcceptedRequest } from './upsertAcceptedRequest'
import { RequestInfo, AcceptedRequestInfo } from '../../types/request'
import { updateStatus } from './updateStatus'


// 1) Accept Request. When accepted request, creates chat that pairs volunteer and beneficiary,
// also upserts request as an accepted request 
export async function acceptRequest(requestId: string, beneficiaryId: string, volunteerId: string): Promise<string>{
    const chat: Chat = {
        request_id: requestId,
        requester_id: beneficiaryId,
        volunteer_id: volunteerId
    }
    const acceptedRequest: AcceptedRequestInfo ={
      request_id: requestId,   
      requester_id: beneficiaryId, 
      volunteer_id: volunteerId,    
      request_status: "ongoing"
    }
    updateStatus(requestId, "ongoing")
    upsertAcceptedRequest(acceptedRequest)
    upsertChat(chat)
    const chat_details = await getChatDetails(requestId)
    const chat_id = chat_details.chat_id
    if (!chat_id){
        logger.error(`Failed to get chat id`);
        throw error;
    }
    return chat_id
}

// 2) Inbox
export async function listChatForUser(userId: string): Promise<ChatListItem[]>{
  const chat_list: ChatListItem[] = []
  // get all the requests that user is involved in
  const requests = await getRequestsByUserId(userId)
    for (const r of requests){
      if (!r.request_id){
        continue
      }
      const chat_details = await getChatDetails(r.request_id)
      const chat_id = chat_details.chat_id
      if (!chat_id){
        continue
      }
      let other_party_user_name: string;
      if (chat_details.requester_id == userId){
        other_party_user_name = chat_details.volunteer_id
      }
      else{
        other_party_user_name = chat_details.requester_id
      }
      const chat_messages = await getChatMessages(chat_id) 
      const last_chat_message = await getLastChatMessage(chat_messages)
      const last_message = last_chat_message.body
      const last_message_time = last_chat_message.created_at
      const last_message_sender = last_chat_message.sender_id
      const chat_info = {chat_id, other_party_user_name, last_message, last_message_time, last_message_sender}
      chat_list.push(chat_info)
    }
  return chat_list
}
