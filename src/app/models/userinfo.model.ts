export interface UserInfo {
    userId: string;
    username: string;
}

export interface User {
    userId: string;
    username: string;
    password: string;
    gameId?: string | null;
    roleId?: string | null;
}
