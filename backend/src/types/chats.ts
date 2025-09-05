export interface Chat {
    chat_id?: string,        
    request_id: string,     
    requester_id: string,    
    volunteer_id: string,       
    created_at?: Date
}

export interface ChatMessage {
    message_id?: string,   
    chat_id: string,     
    sender_id?: string,    
    message_type: "user" | "system",
    body: string,
    created_at?: Date
}
