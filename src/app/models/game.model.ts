export interface Game {
    id: string;
    url_id: string | null;
    created_at: Date | string;
    gameCode: string;
    admin_user_id: string;
    roleId: number;
}
