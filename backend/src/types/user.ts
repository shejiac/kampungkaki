export interface User{
    user_id: string,
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

export interface pwd{
    userId: string,
    userName: string,
    email: string,
    phoneNumber: number,
    postalCode?: number,
    homeAddress?: string,
    pwd: boolean,
    createdDate?: Date,
    updatedDate?: Date 
}

export interface helper{
    userId: string,
    userName: string,
    email: string,
    phoneNumber: number,
    postalCode?: number,
    homeAddress?: string,
    helper: boolean,
    viaPoints?: number,
    createdDate?: Date,
    updatedDate?: Date 
}