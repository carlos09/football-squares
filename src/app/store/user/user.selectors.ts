import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const USER_STATE_NAME = 'user';

export const selectUserState =
    createFeatureSelector<UserState>(USER_STATE_NAME);

export const selectUserId = createSelector(
    selectUserState,
    (state) => state.user?.userId ?? null,
);

export const selectUsername = createSelector(
    selectUserState,
    (state) => state.user?.username ?? null,
);

export const selectCreateUserError = createSelector(
    selectUserState,
    (state) => state.error,
);

// export const selectCreateUserSuccess = createSelector(
//     selectUserState,
//     (state) => state.createUserSuccess, // Ensure this property exists in UserState
// );

export const selectCreatedUser = createSelector(
    selectUserState,
    (state) => state.user, // Ensure this returns the correct user object
);

export const selectUser = createSelector(
    selectUserState,
    (state) => state.user,
);
export const selectUserGames = createSelector(selectUserState, (state) => {
    console.log('Full user state:', state); // Log the entire state object
    return state?.games ?? []; // Ensure it never returns undefined
});

export const selectUserLoading = createSelector(
    selectUserState,
    (state) => state.loading,
);

export const selectUserStateFull = createSelector(selectUserState, (state) => ({
    user: state.user,
    games: state.games,
}));

export const selectUserAndCurrentGame = (gameCode: string | null) =>
    createSelector(selectUserStateFull, ({ user, games }) => {
        const currentGame =
            games?.find((game) => game.game_code === gameCode) ?? null;
        return { user, currentGame };
    });

export const selectGameId = (gameCode: string | null) =>
    createSelector(selectUserStateFull, ({ user, games }) => {
        console.log('from selector user: ', user);
        console.log('from selector game: ', games);
        const currentGame =
            games?.find((game) => game.game_code === gameCode) ?? null; // Use game.code instead of game.id
        return { user, currentGame };
    });
