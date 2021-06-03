import { Cache, constructorName } from "./util";
import { Json, JsonElement } from "./decorators/Json";

export const Metadata: Cache<string, JsonElement> = new Cache();
export function metadataElementsFor(target: any) { Json(target); return Metadata.get(constructorName(target))!.elements; }