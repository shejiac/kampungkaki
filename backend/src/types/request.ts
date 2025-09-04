export interface RequestInfo {
    request_id: string,   
    requester_id: string,    
    volunteer_id?: string,            
    request_title: string,
    request_type: string,
    request_description: string,
    request_location: string,
    request_initial_meet: boolean,
    request_time: string,          
    request_approx_duration: string,
    request_priority: string, 
    request_status: RequestStatus,
    created_at?: Date,
    updated_at?: Date
}

export interface AcceptedRequestInfo {
    request_id: string,   
    requester_id: string, 
    volunteer_id: string,    
    request_start_time?: Date,
    request_end_time?: Date,
    request_total_time?: number,
    request_status: string
}

export type RequestStatus = 'open' | 'ongoing' | 'closed';

export interface OpenRequestWithNames {
  request: RequestInfo;
  requester_name: string;
}
