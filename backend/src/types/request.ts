export interface RequestInfo{
    request_id: number,           
    requester_id: number,
    helper_id?: number,
    request_title: string,
    request_type: string,
    request_description: string,
    request_location: string,
    request_initial_meet: boolean,
    request_time: number,
    request_approx_duration: number,
    request_priority: string, 
    request_status: string, //open, ongoing, closed
    created_date?: Date,
    updated_date?: Date
}

export interface AcceptedRequestInfo{
    request_id: number,   
    requester_id: number,        
    helper_id: number,                     
    request_start_time?: Date,
    request_end_time?: Date,
    request_total_time?: number,
    request_status: string
}