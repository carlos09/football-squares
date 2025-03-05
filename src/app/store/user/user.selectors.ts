import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const USER_STATE_NAME = 'user';

export const selectUserState =
    createFeatureSelector<UserState>(USER_STATE_NAME);

export const selectUserId = createSelector(
    selectUserState,
    (state) => state.userId ?? null,
);

export const selectUsername = createSelector(
    selectUserState,
    (state) => state.username ?? null,
);

export const selectCreateUserError = createSelector(
    selectUserState,
    (state) => state.error,
);

export const selectUser = createSelector(
    selectUserState,
    (state) => state.username,
);

export const selectUserGames = createSelector(selectUserState, (state) => {
    return state?.games ?? [];
});

export const selectUserLoading = createSelector(
    selectUserState,
    (state) => state.loading,
);

export const selectUserStateFull = createSelector(selectUserState, (state) => ({
    userId: state.userId,
    username: state.username,
    roleId: state.roleId,
    games: state.games,
    loading: state.loading,
    error: state.error,
}));
export const selectUserAndCurrentGame = (gameCode: string | null) =>
    createSelector(
        selectUserStateFull,
        ({ userId, username, roleId, games }) => {
            const currentGame =
                games?.find((game) => game.gameCode === gameCode) ?? null;

            return { userId, username, roleId, currentGame };
        },
    );

export const selectGameAndUserIds = (gameCode: string | null) =>
    createSelector(selectUserStateFull, ({ userId, games }) => {
        if (!games || games.length === 0) {
            return { gameId: '', userId: userId ?? '' };
        }

        const currentGame =
            games.find((game) => game.gameCode === gameCode) ?? null;

        return {
            gameId: currentGame?.id ?? '',
            userId: userId ?? '',
        };
    });
