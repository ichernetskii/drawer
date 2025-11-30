import type { IPositionDataModel, ISceneDataModel, ISizeDataModel } from "@adapters";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface ISceneState {
	scene: ISceneDataModel;
}

const initialState: ISceneState = {
	scene: {
		zoom: 1,
		origin: { x: 0, y: 0 },
		size: { width: 0, height: 0 },
	},
};

export const sceneSlice = createSlice({
	name: "scene",
	initialState,
	reducers: {
		setZoom: (state, action: PayloadAction<number>) => {
			state.scene.zoom = action.payload;
		},
		setOrigin: (state, action: PayloadAction<IPositionDataModel>) => {
			state.scene.origin = action.payload;
		},
		setSize: (state, action: PayloadAction<ISizeDataModel>) => {
			state.scene.size = action.payload;
		},
	},
	selectors: {
		selectZoom: state => state.scene.zoom,
		selectOrigin: state => state.scene.origin,
		selectSize: state => state.scene.size,
	},
});

export const sceneActions = sceneSlice.actions;

export type ISceneActions = ReturnType<(typeof sceneActions)[keyof typeof sceneActions]>;
