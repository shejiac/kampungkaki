// src/types/request.ts

export type RequestStatus = 'Open' | 'Ongoing' | 'Closed';

export interface RequestInfo {
  request_id?: string;
  requester_id: string;
  volunteer_id?: string;

  request_title: string;
  request_type: string;
  request_description: string;
  request_location: string;
  request_initial_meet: boolean;
  request_time: string;
  request_approx_duration: string;
  request_priority: string;

  request_status: RequestStatus;
  created_at?: Date;
  updated_at?: Date;
}

export interface AcceptedRequestInfo {
  request_id: string;
  requester_id: string;
  volunteer_id: string;
  request_start_time?: Date;
  request_end_time?: Date;
  request_total_time?: number;
  request_status: RequestStatus;
}

export interface OpenRequestWithNames {
  request: RequestInfo;
  requester_name: string;
}

export interface DashboardRequest {
  request_id: string;
  type: string;
  title: string;
  urgency: string;
  duration: string;
  location: string;
}

export interface PreAcceptRequest {
  request_id: string;
  requester_id: string;
  name: string;
  title: string;
  type: string;
  description: string;
  location: string;
  initial_meet: boolean;
  time: string;
  duration: string;
  urgency: string;
  created_at: Date;
}
