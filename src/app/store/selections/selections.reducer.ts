import { createReducer, on } from '@ngrx/store';
import * as SelectionsActions from './selections.actions';

export interface SelectionsState {
  selectedSquareIds: number[];
  loading: boolean;
  error: any;
}

export const initialState: SelectionsState = {
  selectedSquareIds: [],
  loading: false,
  error: null
};

export const SelectionsReducer = createReducer(
  initialState,
  on(SelectionsActions.loadSelections, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(SelectionsActions.loadSelectionsSuccess, (state, { selections }) => ({
    ...state,
    selectedSquareIds: selections,
    loading: false
  })),
  on(SelectionsActions.loadSelectionsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false
  }))
);
