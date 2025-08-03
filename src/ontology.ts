import { and, Variant } from "./utility";

// -----------------------------------------------------------------------------
// ProtoWorld
// -----------------------------------------------------------------------------

export type ProtoWorld = {
  protoEntities: Record<ProtoEntityId, ProtoEntity>;
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
  entities: Record<EntityId, Entity>;
};

export type EntityId = string;

export type Entity = {
  protoEntityId: ProtoEntityId;
  id: EntityId;
  pos: Pos;
  alive: boolean;
  forward: Dir;
  item: Item | undefined;
};

type Item = string;

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
  // move
  moveForward: {};
  turnLeft: {};
  turnRight: {};
  // attack
  attack: { damage: number };
  // item
  generateItem: { item: Item };
  consumeItem: { item: Item };
  giveItem: { item: Item };
  //
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

// -----------------------------------------------------------------------------
// eq
// -----------------------------------------------------------------------------

export function eqWorld(world1: World, world2: World) {
  const entityIds = Array.from(Object.keys(world1.entities));
  for (const entityId of entityIds) {
    const entity1 = world1.entities[entityId];
    const entity2 = world2.entities[entityId];
    return eqEntity(entity1, entity2);
  }
}

export function eqEntity(entity1: Entity, entity2: Entity) {
  return and([
    entity1.id === entity2.id,
    entity1.alive === entity2.alive,
    eqDir(entity1.forward, entity2.forward),
    eqPos(entity1.pos, entity2.pos),
    entity1.item === entity2.item,
  ]);
}

export function eqPos(p1: Pos, p2: Pos): boolean {
  return p1.x === p2.x && p1.y === p2.y;
}

export function eqDir(v1: Dir, v2: Dir): boolean {
  return v1 % 4 === v2 % 4;
}
