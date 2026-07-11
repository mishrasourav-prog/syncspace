import { IUserDocument } from "../modules/auth/auth.model";
import ApiError from "../utils/ApiError";

import { User } from "../modules/auth/auth.model";

export const getUserOrThrowById = 
    async (userId: string): 
    Promise<IUserDocument> => {

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(
            404,
            "User not found."
        );
    }

    return user;
}

export const getUserOrThrowByEmail = 
    async (email: string): 
    Promise<IUserDocument> => {
        const user = await User.findOne({
            email: email
        });
        
        if (!user) {
            throw new ApiError(
                404,
                "User not found."
            );
        }
        return user;
}