export interface User{
    userId: string,
    userName: string,
    email: string,
    phoneNumber: number,
    postalCode?: number,
    homeAddress?: string,
    pwd: boolean,
    helper: boolean,
    viaPoints?: number,
    createdDate: Date,
    updatedDate: Date 
}