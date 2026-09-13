import type { LoginResponseVO, LoginUserVO, UserLoginRequest, UserRegisterRequest } from '@/types/api'
import { get, post } from '@/utils/request'

export const register = (data: UserRegisterRequest) => post<number>('/user/register', data)

export const login = (data: UserLoginRequest) => post<LoginResponseVO>('/user/login', data)

export const getMe = () => get<LoginUserVO>('/user/me')
