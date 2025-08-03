import { Variant } from "./utility";

// -----------------------------------------------------------------------------
// ProtoWorld
// -----------------------------------------------------------------------------

export type ProtoWorld = {
  protoEntities: Map<ProtoEntityId, ProtoEntity>;
  initialEntities: Entity[];
};

export type ProtoEntityId = string;

export type ProtoEntity = {
  id: ProtoEntityId;
  triggers: Trigger[];
};

export type Trigger = {
  condition: Condition;
  action: Action;
};

// -----------------------------------------------------------------------------
// World
// -----------------------------------------------------------------------------

export type World = {
  entities: Map<EntityId, Entity>;
};

export type EntityId = string;

export type Entity = {
  protoEntityId: ProtoEntityId;
  id: EntityId;
  pos: Pos;
  health: number;
  forward: Dir;
};

// -----------------------------------------------------------------------------
// Condition
// -----------------------------------------------------------------------------

// IDEA: defunctionalize this so can be presented to the user somehow?
export type Condition = (world: World, entityId: EntityId) => boolean;

// -----------------------------------------------------------------------------
// Action
// -----------------------------------------------------------------------------

export type Action = Variant<ActionRow>;
export type ActionRow = {
  // move: { ve: DirExpr };
  moveForward: {};
  turnLeft: {};
  turnRight: {};
  attack: { damage: number };
  sequence: { actions: Action[] };
};

// -----------------------------------------------------------------------------
// Dir
// -----------------------------------------------------------------------------

export type Dir = number; // * 90 = degrees

export function fromDirToDegrees(v: Dir): number {
  return v * 90;
}

export function fromDirToRadians(v: Dir): number {
  return (v * Math.PI) / 2;
}

export function rotateLeftDir(v: Dir): Dir {
  return v - 1;
}

export function rotateRightDir(v: Dir): Dir {
  return v + 1;
}

export function eqDirExpr(v1: Dir, v2: Dir): boolean {
  return v1 % 4 === v2 % 4;
}

// -----------------------------------------------------------------------------
// Pos
// -----------------------------------------------------------------------------

export type Pos = { x: number; y: number };

export function shiftPos(p: Pos, v: Dir): Pos {
  return {
    x: Math.round(p.x + Math.sin(fromDirToRadians(v))),
    y: Math.round(p.y - Math.cos(fromDirToRadians(v))),
  };
}

export function eqPos(p1: Pos, p2: Pos): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}
