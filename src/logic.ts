import {
  Action,
  ActionRow,
  Entity,
  EntityId,
  eqPos,
  Pos,
  ProtoEntity,
  ProtoEntityId,
  ProtoWorld,
  rotateLeftDir,
  rotateRightDir,
  shiftPos,
  World,
} from "./ontology";
import { and, deepcopy, match } from "./utility";

// -----------------------------------------------------------------------------
// initializeWorld
// -----------------------------------------------------------------------------

export function initializeWorld(protoWorld: ProtoWorld): World {
  // const entities = new Map(
  //   protoWorld.initialEntities.map((entity) => [entity.id, deepcopy(entity)]),
  // );
  const entities: World["entities"] = {};
  for (const entity of protoWorld.initialEntities) {
    entities[entity.id] = entity;
  }
  return {
    entities,
  };
}

// -----------------------------------------------------------------------------
// updateWorld
// -----------------------------------------------------------------------------

export class WorldUpdateManager {
  submit: () => Promise<void>;

  constructor(
    public protoWorld: ProtoWorld,
    public world: World,
    submit: (world: World) => Promise<void>,
  ) {
    this.submit = () => submit(this.world);
  }

  /**
   * Update the world a single simulation step. Each entity gets a chance to be
   * triggered.
   */
  async run(): Promise<void> {
    for (const entity of Object.values(this.world.entities)) {
      const protoEntity = this.getProtoEntity(entity.protoEntityId);
      for (const trigger of protoEntity.triggers) {
        if (trigger.condition(this.world, entity.id)) {
          await this.runAction(entity, trigger.action);
          break; // only do one action per turn
        }
      }
    }
  }

  /**
   * Do an {@link Action}.
   */
  async runAction(self: Entity, action: Action): Promise<void> {
    if (!self.alive) return;

    return match<ActionRow, Promise<void>>(action, {
      sequence: async ({ actions }) => {
        for (const action of actions) {
          await this.runAction(self, action);
        }
      },
      moveForward: async ({}) => {
        // moves forward if the front space is empty
        const front = shiftPos(self.pos, self.forward);
        const other = this.getEntityAtPos(front);
        if (other === undefined) {
          self.pos = front;
        }
        await this.submit();
      },
      turnLeft: async ({}) => {
        self.forward = rotateLeftDir(self.forward);
        await this.submit();
      },
      turnRight: async ({}) => {
        self.forward = rotateRightDir(self.forward);
        await this.submit();
      },
      attack: async ({}) => {
        // kills entity in front
        const front = shiftPos(self.pos, self.forward);
        const other = this.getEntityAtPos(front);
        if (other !== undefined) {
          other.alive = false;
        }
        await this.submit();
      },
      giveItem: async ({ item }) => {
        // gives item to entity in front
        const front = shiftPos(self.pos, self.forward);
        const other = this.getEntityAtPos(front);
        if (other !== undefined) {
          if (self.item === item) {
            self.item = undefined;
            other.item = item;
          }
        }
        await this.submit();
      },
      consumeItem: async ({ item }) => {
        if (self.item === item) {
          self.item = undefined;
        }
      },
      generateItem: async ({ item }) => {
        self.item = item;
      },
    });
  }

  getEntity(entityId: EntityId): Entity {
    const entity = this.world.entities[entityId];
    return entity;
  }

  getProtoEntity(protoEntityId: ProtoEntityId): ProtoEntity {
    const protoEntity = this.protoWorld.protoEntities[protoEntityId];
    return protoEntity;
  }

  getEntityAtPos(pos: Pos): Entity | undefined {
    for (const entity of Object.values(this.world.entities)) {
      if (and([entity.alive, eqPos(entity.pos, pos)])) {
        return entity;
      }
    }
  }
}
