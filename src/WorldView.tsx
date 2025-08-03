import { useRef, useState } from "react";
import {
  Entity,
  eqWorld,
  fromDirToDegrees,
  ProtoWorld,
  World,
} from "./ontology";
import { initializeWorld, WorldUpdateManager } from "./logic";
import { deepcopy, sleep } from "./utility";
import Markdown from "react-markdown";

export type WorldViewConfig = {
  distance_unit: number;
  action_duration: number;
};

export function WorldView(props: {
  // the step at which to check for a loop
  checkStep: number;
  protoWorld: ProtoWorld;
}) {
  const config = useRef<WorldViewConfig>({
    distance_unit: 50, // px
    action_duration: 500, // ms
  });
  const [stepIndex, set_stepIndex] = useState<number>(0);
  const [started, set_started] = useState(false);
  const [world, set_world] = useState(initializeWorld(props.protoWorld));
  const [win, set_win] = useState<boolean | undefined>(undefined);

  async function start() {
    set_started(true);
    set_stepIndex(0);
    let stepIndex = 0;
    let history: World[] = [];
    while (true) {
      console.log(`[update] ${stepIndex}`);
      history.push(deepcopy(world));
      const manager = new WorldUpdateManager(
        props.protoWorld,
        world,
        async (world) => {
          set_world({ ...world });
          await sleep(config.current.action_duration);
        },
      );
      await Promise.all([manager.run(), sleep(config.current.action_duration)]);
      stepIndex++;
      set_stepIndex(stepIndex);

      if (stepIndex === props.checkStep) {
        const world1 = world;
        const matchingWorld = history.find((world2) => eqWorld(world1, world2));
        if (matchingWorld !== undefined) {
          set_win(true);
        } else {
          set_win(false);
        }
      }
    }
  }

  return (
    <div className="section WorldView">
      <div className="title">View</div>
      <div className="section">
        <div className="title">Entities</div>
        {Array.from(
          Object.values(props.protoWorld.protoEntities).map(
            (protoEntity, i) => (
              <div className="ProtoEntity" key={protoEntity.id}>
                <div className="entity">
                  {renderEntity(config.current, {
                    protoEntityId: protoEntity.id,
                    id: "",
                    forward: 0,
                    pos: { x: 0, y: 0 },
                  })}
                </div>
                <div className="description Markdown">
                  <Markdown>{protoEntity.description}</Markdown>
                </div>
              </div>
            ),
          ),
        )}
      </div>
      {win === true ? (
        <div className="section Win">{"You Win!!!!"}</div>
      ) : win === false ? (
        <div className="section Lose">{"You Lose!!!!"}</div>
      ) : (
        <div className="section Pending">{`Steps till loop check: ${props.checkStep - stepIndex}`}</div>
      )}
      <div className="section config">
        <div className="title">Configuration</div>
        <div>
          action_duration:{" "}
          <input
            type="range"
            min={1}
            max={1000}
            defaultValue={config.current.action_duration}
            onChange={(e) => {
              config.current.action_duration = parseInt(e.currentTarget.value);
            }}
          />
        </div>
        <div>
          distance_unit:{" "}
          <input
            type="range"
            min={1}
            max={100}
            defaultValue={config.current.distance_unit}
            onChange={(e) => {
              config.current.distance_unit = parseInt(e.currentTarget.value);
            }}
          />
        </div>
        <div>
          <button
            disabled={started}
            onClick={() => {
              void start();
            }}
          >
            start
          </button>
        </div>
      </div>
      <div className="World-container">
        <div className="World">
          {Array.from(
            Object.values(world.entities).map((entity) =>
              !entity.dead ? renderEntity(config.current, entity) : [],
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function renderEntity(config: WorldViewConfig, entity: Entity) {
  return (
    <div
      className={`Entity ${entity.protoEntityId} ${entity.id}`}
      key={`entity-${entity.id}`}
      style={{
        width: `${1 * config.distance_unit}px`,
        height: `${1 * config.distance_unit}px`,
        left: entity.pos.x * config.distance_unit,
        top: entity.pos.y * config.distance_unit,
        transform: `rotate(${fromDirToDegrees(entity.forward)}deg)`,
        transitionDuration: `${config.action_duration}ms`,
      }}
    >
      <div>{entity.id}</div>
    </div>
  );
}
