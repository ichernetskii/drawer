import { type ISceneRepository } from "@adapters";

import type { ToPlainObject } from "./ToPlainObject.d.ts";

export type ISceneDataModel = ToPlainObject<ISceneRepository>;
