import { createReducer, on } from '@ngrx/store';
import * as StartGameActions from './start-game.actions';

export interface GameState {
  url_id: string;
  gameId: string;
  userId: string;
  username: string;
  loading: boolean;
  error: any;
}

export const initialState: GameState = {
  url_id: '',
  gameId: '',
  userId: '',
  username: '',
  loading: false,
  error: null
};

export const StartGameReducer = createReducer(
  initialState,
  on(StartGameActions.createGame, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(StartGameActions.createGameSuccess, (state, data) => ({
    ...state,
    gameId: data.gameId,
    url_id: data.url_id,
    loading: false
  })),
  on(StartGameActions.createGameFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  })),
  on(StartGameActions.fetchUser, (state, actions) => {
    console.log('*** Reducer: fetchUser action received with userId:', actions.userId);
    return {
      ...state,
      userId: actions.userId,
      loading: true,
      error: null
    };
  }),
  on(StartGameActions.fetchUserSuccess, (state, data) => ({
    ...state,
    username: data.username,
    loading: false
  })),
  on(StartGameActions.fetchUserFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);
