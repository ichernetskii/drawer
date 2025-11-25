import type { IPositionDataModel, ISceneDataModel, ISizeDataModel, Tool } from "@adapters";
import { Rectangle } from "@domain";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const initialState: ISceneDataModel = {
	zoom: 1,
	origin: { x: 0, y: 0 },
	size: { width: 0, height: 0 },
	tool: Rectangle.type,
};

export const sceneSlice = createSlice({
	name: "scene",
	initialState,
	reducers: {
		setZoom: (state, action: PayloadAction<number>) => {
			state.zoom = action.payload;
		},
		setOrigin: (state, action: PayloadAction<IPositionDataModel>) => {
			state.origin = action.payload;
		},
		setSize: (state, action: PayloadAction<ISizeDataModel>) => {
			state.size = action.payload;
		},
		setTool: (state, action: PayloadAction<Tool>) => {
			state.tool = action.payload;
		},
	},
	selectors: {
		selectZoom: state => state.zoom,
		selectOrigin: state => state.origin,
		selectSize: state => state.size,
		selectTool: state => state.tool,
	},
});

export const sceneActions = sceneSlice.actions;

export type ISceneActions = ReturnType<(typeof sceneActions)[keyof typeof sceneActions]>;
