import type { ISizeDataModel } from "@adapters";
import type { IEntityDataModel } from "@adapters/dataModels/EntityDataModel.ts";
import { Rectangle, type Tool } from "@domain";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface IEntityState {
	entities: IEntityDataModel[];
	drawingEntity: IEntityDataModel | null;
	tool: Tool;
}

const initialState: IEntityState = {
	entities: [],
	drawingEntity: null,
	tool: Rectangle.type,
};

export const entitySlice = createSlice({
	name: "entities",
	initialState,
	reducers: {
		add: (state, action: PayloadAction<IEntityDataModel>) => {
			state.entities.push(action.payload);
		},
		remove: (state, action: PayloadAction<string>) => {
			state.entities = state.entities.filter(entity => entity.id !== action.payload);
		},
		clear: state => {
			state.entities = [];
		},
		setDrawingEntity: (state, action: PayloadAction<IEntityDataModel | null>) => {
			state.drawingEntity = action.payload;
		},
		setSize: (state, action: PayloadAction<{ id: string; size: ISizeDataModel }>) => {
			const entity = state.entities.find(entity => entity.id === action.payload.id) ?? state.drawingEntity;
			if (entity) {
				entity.size = action.payload.size;
			}
		},
		setTool: (state, action: PayloadAction<Tool>) => {
			state.tool = action.payload;
		},
	},
	selectors: {
		selectEntities: state => state.entities,
		selectDrawingEntity: state => state.drawingEntity,
	},
});

export const entityActions = entitySlice.actions;

export type IEntityActions = ReturnType<(typeof entityActions)[keyof typeof entityActions]>;
