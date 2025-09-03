export interface Request{
    requester_id: string,
    request_title: string,
    request_type: string,
    request_description: string,
    request_location: string,
    request_intial_meet: boolean,
    request_time: number,
    request_approx_duration: number,
    request_priority: string, 
    created_date?: Date,
    updated_date?: Date
}