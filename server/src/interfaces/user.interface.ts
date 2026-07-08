 export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface currentUser {
  user:{
    _id: string;
    name: string;
    username: string;
    email: string;
    avatar?: string;
  }
}

export interface IJwtPayload {
  _id: string;
  email: string;
  username: string;
}

export interface LoginUser {
  email:string;
  password:string
}

export interface RegisterUser {
  email:string;
  password:string
  name:string;
  username:string;
}

export interface LoginResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}


export interface ResetResponse {
    email: string;
    resetToken: string;
}