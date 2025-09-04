export interface User {
    user_id: string,     
    user_name: string,   
    email: string,
    phone_number: string,
    postal_code?: string,
    home_address?: string,
    pwd: boolean,
    helper: boolean,
    via_points?: string,
    created_at?: Date,
    updated_at?: Date 
}

export interface Pwd {
    user_id: string,          
    user_name: string,
    email: string,
    phone_number: string,
    postal_code?: string,
    home_address: string,
    pwd: true,
    created_at?: Date,
    updated_at?: Date 
}

export interface Helper {
    user_id: string,           
    user_name: string,
    email: string,
    phone_number: string,
    postal_code?: string,
    home_address?: string,
    helper: true,
    via_points?: string,
    created_at?: Date,
    updated_at?: Date 
}
