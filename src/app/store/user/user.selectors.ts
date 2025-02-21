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
export const selectUserGames = createSelector(
    selectUserState,
    (state) => state.games,
);
export const selectUserLoading = createSelector(
    selectUserState,
    (state) => state.loading,
);
