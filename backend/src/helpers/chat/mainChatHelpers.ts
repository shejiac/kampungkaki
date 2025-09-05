import {upsertChat} from './upsertChat'
import { upsertChatMessage } from './upsertChatMessage'
import {Chat, ChatListItem, ChatMessage} from '../../types/chats'
import {getChatDetailsByChatId, getChatDetailsByReqId} from './getChatsDetails'
import { getRequestsByUserId } from './getRequestsByUserId'
import logger from '../db/logger'
import { error } from "console";
import { getChatMessages, getLastChatMessage } from './getChatMessages'
import { upsertAcceptedRequest } from './upsertAcceptedRequest'
import {AcceptedRequestInfo } from '../../types/request'
import { updateStatus } from './updateStatus'
import {getRequesterbyRequest} from './getRequesterByRequestId'
import { getAllRequestDetails } from '../volunteer/getAllRequestDetails'
import { getRequestbyRequester } from './getRequestByRequesterId'
import { get, request } from 'http'
import { getRequestbyRequestId } from './getRequestByRequestId'
import { getAcceptedRequestbyRequestId } from './getAcceptedRequestByRequestId'


// 1) Accept Request. When accepted request, creates chat that pairs volunteer and beneficiary,
// also upserts request as an accepted request 
export async function acceptRequest(requestId: string, volunteerId: string): Promise<string>{
    const beneficiaryId = await getRequesterbyRequest(requestId)
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
    await updateStatus(requestId, "ongoing")
    await upsertAcceptedRequest(acceptedRequest)
    await upsertChat(chat)
    const chat_details = await getChatDetailsByReqId(requestId)
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
      const chat_details = await getChatDetailsByReqId(r.request_id)
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
      console.log("chat_details:", chat_details);
      console.log("chat_messages:", chat_messages);
      console.log("last_chat_message:", last_chat_message);
      const chat_info = {chat_id, other_party_user_name, last_message, last_message_time, last_message_sender}
      chat_list.push(chat_info)
    }
  return chat_list
}

// 3) get Chat and request details
export async function getChat(chatId: string){
  const chat_details = await getChatDetailsByChatId(chatId)
  const request_id = chat_details.request_id
  const request_details = await getRequestbyRequestId(request_id)
  const chat_messages = await getChatMessages(chatId)

  return {chat_details, request_details, chat_messages}
}

// 4a) a user creates message, gets upserted to db
export async function userCreateMessage(chatId: string, senderId: string, message: string): Promise<void> {
  const chat_message: ChatMessage = {
    chat_id: chatId,
    sender_id: senderId,
    message_type: 'user',
    body: message
  }
  await upsertChatMessage(chat_message)
}

// 4b) system created message also gets upserted to db
export async function systemCreateMessage(chatId: string, senderId: string, message: string): Promise<void> {
  const chat_message: ChatMessage = {
    chat_id: chatId,
    sender_id: senderId,
    message_type: 'system',
    body: message
  }
  await upsertChatMessage(chat_message)
}

/** "6) beneficiaryConfirmChat(threadId, beneficiaryId)" does not exist theres no status for chat.
 * the moment the request is accepted a chat should just be created
 */

/**  7) and 8) together, if request is meet first, just start timer only when beneficiary approve,
 * if request is no meet first, just start timer when volunteer request
 * just use this function when either of the two situations happen 
 */

export async function startTime(chat_id: string): Promise<void> {
  const chat_details = await getChatDetailsByChatId(chat_id)
  const acceptedRequest: AcceptedRequestInfo = {
    request_id: chat_details.request_id,
    requester_id: chat_details.requester_id,
    volunteer_id: chat_details.volunteer_id,
    request_status: "ongoing",
    request_start_time: new Date(),
  }
  await upsertAcceptedRequest(acceptedRequest)
}

/**  9) and 10) also together, no need to check when volunteer end, js see when beneficiary end 
 * (beneficiary should only be able to end after volunteer end anyway)
 */
export async function endTime(chat_id: string): Promise<void> {
  const chat_details = await getChatDetailsByReqId(chat_id)
  const acceptedRequest: AcceptedRequestInfo = {
    request_id: chat_details.request_id,
    requester_id: chat_details.requester_id,
    volunteer_id: chat_details.volunteer_id,
    request_status: "ongoing",
    request_end_time: new Date()
  }
  await upsertAcceptedRequest(acceptedRequest)
}