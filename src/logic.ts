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
import { deepcopy, match } from "./utility";

// -----------------------------------------------------------------------------
// initializeWorld
// -----------------------------------------------------------------------------

export function initializeWorld(protoWorld: ProtoWorld): World {
  const entities = new Map(
    protoWorld.initialEntities.map((entity) => [entity.id, deepcopy(entity)]),
  );
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
    for (const entity of this.world.entities.values()) {
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
  async runAction(entity: Entity, action: Action): Promise<void> {
    return match<ActionRow, Promise<void>>(action, {
      sequence: async ({ actions }) => {
        for (const action of actions) {
          await this.runAction(entity, action);
        }
      },
      moveForward: async ({}) => {
        // moves forward if the front space is empty
        const front = shiftPos(entity.pos, entity.forward);
        const entities = this.getEntitiesAtPos(front).filter(
          (e) => e.id !== entity.id,
        );
        if (entities.length === 0) {
          entity.pos = front;
        }
        await this.submit();
      },
      turnLeft: async ({}) => {
        entity.forward = rotateLeftDir(entity.forward);
        await this.submit();
      },
      turnRight: async ({}) => {
        entity.forward = rotateRightDir(entity.forward);
        await this.submit();
      },
      attack: async ({ damage }) => {
        // deals damage to entities in front
        const front = shiftPos(entity.pos, entity.forward);
        const entities = this.getEntitiesAtPos(front).filter(
          (e) => e.id !== entity.id,
        );
        for (const entity of entities) {
          entity.health -= damage;
        }
        await this.submit();
      },
    });
  }

  getEntity(entityId: EntityId): Entity {
    const entity = this.world.entities.get(entityId);
    if (entity === undefined) throw new Error(`Entity ${entityId} not found`);
    return entity;
  }

  getProtoEntity(protoEntityId: ProtoEntityId): ProtoEntity {
    const protoEntity = this.protoWorld.protoEntities.get(protoEntityId);
    if (protoEntity === undefined)
      throw new Error(`ProtoEntity ${protoEntityId} not found`);
    return protoEntity;
  }

  getEntitiesAtPos(pos: Pos): Entity[] {
    return Array.from(
      this.world.entities
        .values()
        .flatMap((entity) => (eqPos(entity.pos, pos) ? [entity] : [])),
    );
  }
}
