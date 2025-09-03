export interface User{
    user_id: number,
    user_name: string,
    email: string,
    phone_number: number,
    postal_code?: number,
    home_address?: string,
    pwd: boolean,
    helper: boolean,
    via_points?: number,
    created_date?: Date,
    updated_date?: Date 
}

export interface Pwd{
    user_id: number,
    user_name: string,
    email: string,
    phone_number: number,
    postal_code?: number,
    home_address: string,
    pwd: true,
    created_date?: Date,
    updated_date?: Date 
}

export interface Helper{
    user_id: number,
    user_name: string,
    email: string,
    phone_number: number,
    postal_code?: number,
    home_address?: string,
    helper: true,
    via_points?: number,
    created_date?: Date,
    updated_date?: Date 
}