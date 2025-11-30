import { configureStore, createListenerMiddleware, type TypedStartListening } from "@reduxjs/toolkit";

import { entitySlice, type IEntityActions, type IEntityState } from "./entitySlice.ts";
import { type ISceneActions, type ISceneState, sceneSlice } from "./sceneSlice.ts";

const listenerMiddleware = createListenerMiddleware();

export const store = configureStore({
	reducer: {
		entities: entitySlice.reducer,
		scene: sceneSlice.reducer,
	},
	middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

type IRootState = ReturnType<typeof store.getState>;
type IAppDispatch = typeof store.dispatch;

const startAppListening = listenerMiddleware.startListening as TypedStartListening<IRootState, IAppDispatch>;

function createSelectiveSubscribe<T>(selector: (state: IRootState) => T) {
	return (listener: () => void): (() => void) => {
		listener();
		return startAppListening({
			predicate: (_, currentState, previousState) => {
				return selector(currentState) !== selector(previousState);
			},
			effect: () => {
				listener();
			},
		});
	};
}

export interface IEntityStoreRedux {
	getState(): IEntityState;
	dispatch(action: IEntityActions): void;
	subscribe(listener: () => void): () => void;
}

export interface ISceneStoreRedux {
	getState(): ISceneState;
	dispatch(action: ISceneActions): void;
	subscribe(listener: () => void): () => void;
}

export const entityStoreAdapterRedux: IEntityStoreRedux = {
	getState: () => store.getState().entities,
	dispatch: (action: IEntityActions) => store.dispatch(action),
	subscribe: createSelectiveSubscribe(state => state.entities),
};

export const sceneStoreAdapterRedux: ISceneStoreRedux = {
	getState: () => store.getState().scene,
	dispatch: (action: ISceneActions) => store.dispatch(action),
	subscribe: createSelectiveSubscribe(state => state.scene),
};
