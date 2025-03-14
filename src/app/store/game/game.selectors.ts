import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GameState } from './game.reducer';

export const GAME_STATE_NAME = 'game';

export const selectGameState =
    createFeatureSelector<GameState>(GAME_STATE_NAME);

export const selectGameCode = createSelector(
    selectGameState,
    (state) => state.gameCode,
);

export const selectGameId = createSelector(
    selectGameState,
    (state) => state.gameId ?? '',
);

// export const selectRoleId = createSelector(
//     selectGameState,
//     (state) => state.roleId,
// );

export const selectGameLoading = createSelector(
    selectGameState,
    (state) => state.loading,
);

export const selectGameError = createSelector(
    selectGameState,
    (state) => state.error,
);

export const selectGameUrl = createSelector(
    selectGameState,
    (state) => state.gameCode ?? '',
);

export const selectGameStateData = createSelector(selectGameState, (state) => ({
    gameId: state.gameId,
    gameCode: state.gameCode,
    // roleId: state.roleId,
    loading: state.loading,
    error: state.error,
    players: state.players,
    settings: state.settings,
}));

export const selectUserSelectedSquares = createSelector(
    selectGameState,
    (state) => state?.selections || [],
);

export const selectGameSettings = createSelector(selectGameState, (state) => {
    return state.settings;
});

export const selectHaveNumbersBeenGenerated = createSelector(
    selectGameState,
    (state) => {
        return state.haveNumbersBeenGenerated;
    },
);

export const selectQuarterScoring = createSelector(selectGameState, (state) => {
    return state.scoring;
});

export const selectLiveQuarter = createSelector(selectGameState, (state) => {
    const liveIndex = state.scoring.findIndex((quarter) => quarter.isLive);
    console.log('Live Quarter from Selector:', liveIndex);
    return liveIndex !== -1 ? liveIndex : null;
});

export const selectAxisNumbers = createSelector(selectGameState, (state) => {
    return state.axisNumbers;
});

export const selectQuarterScores = createSelector(
    selectGameState,
    (gameState) => {
        if (!gameState?.scoring) return [];

        return gameState.scoring.map((q, index) => ({
            quarter: index + 1,
            homeTeam: q.homeTeam,
            awayTeam: q.awayTeam,
            isLive: q.isLive,
            hasEnded: q.hasEnded,
        }));
    },
);
