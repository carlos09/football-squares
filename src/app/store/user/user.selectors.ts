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

// export const selectCreatedUser = createSelector(
//     selectUserState,
//     (state) => state.user,
// );

export const selectUser = createSelector(
    selectUserState,
    (state) => state.username,
);

export const selectUserGames = createSelector(selectUserState, (state) => {
    console.log('Full user state:', state);
    return state?.games ?? [];
});

export const selectUserLoading = createSelector(
    selectUserState,
    (state) => state.loading,
);

export const selectUserStateFull = createSelector(
    selectUserState,
    (state) => ({
        userId: state.userId,
        username: state.username,
        roleId: state.roleId,
        games: state.games,
        loading: state.loading,
        error: state.error,
    }), // ✅ Flattened structure
);
export const selectUserAndCurrentGame = (gameCode: string | null) =>
    createSelector(
        selectUserStateFull,
        ({ userId, username, roleId, games }) => {
            console.log('1111 games: ', games);
            console.log('Selector - Game Code:', gameCode);
            console.log(
                'Selector - Available Games:',
                games.map((game) => game.gameCode),
            );

            const currentGame =
                games?.find((game) => game.gameCode === gameCode) ?? null;

            console.log('Selector - Found Current Game:', currentGame);

            return { userId, username, roleId, currentGame }; // ✅ Flattened user properties
        },
    );

export const selectGameAndUserIds = (gameCode: string | null) =>
    createSelector(selectUserStateFull, ({ userId, games }) => {
        // ✅ Flattened structure
        console.log('Selector - Game Code:', gameCode);
        console.log('Selector - Available Games:', games);

        if (!games || games.length === 0) {
            console.warn('No games available in store.');
            return { gameId: '', userId: userId ?? '' }; // ✅ Direct access to `userId`
        }

        const currentGame =
            games.find((game) => game.gameCode === gameCode) ?? null;

        console.log('Selector - Found Current Game:', currentGame);

        return {
            gameId: currentGame?.id ?? '',
            userId: userId ?? '',
        };
    });

// export const selectGameId = (gameCode: string | null) =>
//     createSelector(selectUserStateFull, ({ user, games }) => {
//         console.log('from selector user: ', user);
//         console.log('from selector game: ', games);
//         const currentGame =
//             games?.find((game) => game.game_code === gameCode) ?? null;
//         return { user, currentGame };
//     });
