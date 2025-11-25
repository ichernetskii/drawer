import type { ISizeDataModel } from "@adapters";
import type { IEntityDataModel } from "@adapters/dataModels/EntityDataModel.ts";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface EntityState {
	entities: IEntityDataModel[];
	drawingEntity: IEntityDataModel | null;
}

const initialState: EntityState = {
	entities: [],
	drawingEntity: null,
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
		setSize: (state, action: PayloadAction<{ entity: IEntityDataModel; size: ISizeDataModel }>) => {
			const entity = state.entities.find(entity => entity === action.payload.entity) ?? state.drawingEntity;
			if (entity) {
				entity.size = action.payload.size;
			}
		},
	},
	selectors: {
		selectEntities: state => state.entities,
		selectDrawingEntity: state => state.drawingEntity,
	},
});

export const entityActions = entitySlice.actions;

export type IEntityActions = ReturnType<(typeof entityActions)[keyof typeof entityActions]>;
