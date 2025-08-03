import { useState } from "react";
import "./App.css";
import { initializeWorld, WorldUpdateManager } from "./logic";
import {
  Entity,
  EntityId,
  fromDirToDegrees,
  ProtoEntity,
  ProtoEntityId,
  ProtoWorld,
} from "./ontology";
import { sleep } from "./utility";

const distance_unit = 50; // px
const action_duration = 500; // ms
const max_distance = 10;

const RunnerFigure8: ProtoEntity = {
  id: "RunnerFigure8" as ProtoEntityId,
  triggers: [
    {
      condition: () => true,
      action: {
        type: "sequence",
        actions: [
          { type: "moveForward" },
          { type: "turnLeft" },
          { type: "moveForward" },
          { type: "moveForward" },
          { type: "turnRight" },
          { type: "moveForward" },
          { type: "turnRight" },
          { type: "moveForward" },
          { type: "turnRight" },
          { type: "moveForward" },
          { type: "moveForward" },
          { type: "turnLeft" },
          { type: "moveForward" },
          { type: "turnLeft" },
        ],
      },
    },
  ],
};

const Runner: ProtoEntity = {
  id: "Runner" as ProtoEntityId,
  triggers: [
    {
      condition: () => true,
      action: {
        type: "sequence",
        actions: [
          { type: "moveForward" },
          { type: "moveForward" },
          { type: "turnLeft" },
        ],
      },
    },
  ],
};

export default function App() {
  const [worldIndex, set_worldIndex] = useState(0);

  const runner1_x_min = 0;
  const runner1_x_max = 8;
  const [runner1_x, set_runner1_x] = useState(runner1_x_min);

  return (
    <div className="App">
      <div className="section controls">
        <div className="title">Controls</div>
        <div>
          <input
            type="range"
            min={runner1_x_min}
            max={runner1_x_max}
            defaultValue={runner1_x}
            onChange={(e) => {
              set_runner1_x(parseInt(e.currentTarget.value));
              set_worldIndex((i) => i + 1);
            }}
          />
        </div>
        <div>
          <button
            onClick={() => {
              set_worldIndex((i) => i + 1);
            }}
          >
            reset
          </button>
        </div>
      </div>
      <hr />
      <div className="section view">
        <div className="title">View</div>
        <WorldView
          key={worldIndex}
          protoWorld={{
            protoEntities: new Map(
              [Runner].map((protoEntity) => [protoEntity.id, protoEntity]),
            ),
            initialEntities: [
              {
                protoEntityId: Runner.id,
                id: "Runner1" as EntityId,
                forward: 2,
                health: 10,
                pos: { x: runner1_x, y: 2 },
              } satisfies Entity,
              {
                protoEntityId: Runner.id,
                id: "Runner2" as EntityId,
                forward: 2,
                health: 10,
                pos: { x: runner1_x + 2, y: 2 },
              } satisfies Entity,
            ],
          }}
        />
      </div>
    </div>
  );
}

function WorldView(props: { protoWorld: ProtoWorld }) {
  const [world, set_world] = useState(initializeWorld(props.protoWorld));

  async function start() {
    while (true) {
      const manager = new WorldUpdateManager(
        props.protoWorld,
        world,
        async (world) => {
          set_world({ ...world });
          await sleep(action_duration);
        },
      );
      await manager.run();
    }
  }

  return (
    <div className="WorldView">
      <div className="controls">
        <button
          onClick={() => {
            void start();
          }}
        >
          start
        </button>
      </div>
      <div className="World">
        {Array.from(
          world.entities.values().map((entity, i) => (
            <div
              className={`Entity ${entity.protoEntityId} ${entity.id}`}
              key={`entity-${i}`}
              style={{
                width: `${1 * distance_unit}px`,
                height: `${1 * distance_unit}px`,
                left: entity.pos.x * distance_unit,
                top: entity.pos.y * distance_unit,
                transform: `rotate(${fromDirToDegrees(entity.forward)}deg)`,
                transitionProperty: "left, top, transform",
                transitionDuration: `${action_duration}ms`,
                transitionTimingFunction: "linear",
              }}
            >
              <div>{entity.id}</div>
              <div>
                ({entity.pos.x}, {entity.pos.y})
              </div>
              <div>dir: {entity.forward}</div>
            </div>
          )),
        )}
      </div>
    </div>
  );
}
