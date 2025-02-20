export interface Game {
    id: string;
    url_id: string | null;
    created_at: Date | string;
    game_code: string;
    admin_user_id: string;
}
