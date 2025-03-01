export interface UserInfo {
    userId: string;
    username: string;
}

export interface User {
    userId: string;
    username: string;
    roleId?: number;
    gameId: string;
}
