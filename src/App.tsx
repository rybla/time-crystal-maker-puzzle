import { useRef, useState } from "react";
import "./App.css";
import { initializeWorld, WorldUpdateManager } from "./logic";
import {
  Entity,
  EntityId,
  eqWorld,
  fromDirToDegrees,
  ProtoEntity,
  ProtoEntityId,
  ProtoWorld,
  World,
} from "./ontology";
import { deepcopy, sleep } from "./utility";

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

const CircleRunner: ProtoEntity = {
  id: "CircleRunner" as ProtoEntityId,
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

const LineRunner: ProtoEntity = {
  id: "LineRunner" as ProtoEntityId,
  triggers: [
    {
      condition: () => true,
      action: {
        type: "sequence",
        actions: [{ type: "moveForward" }],
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
      <div className="section parameters">
        <div className="title">Controls</div>
        <div>
          runner1_x:{" "}
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
      <WorldView
        key={worldIndex}
        protoWorld={{
          protoEntities: {
            [CircleRunner.id]: CircleRunner,
            [LineRunner.id]: LineRunner,
          },
          initialEntities: [
            {
              id: "E1" as EntityId,
              protoEntityId: CircleRunner.id,
              pos: { x: runner1_x, y: 0 },
              forward: 2,
              alive: true,
              item: undefined,
            } satisfies Entity,
            // {
            //   id: "E2" as EntityId,
            //   protoEntityId: LineRunner.id,
            //   pos: { x: runner1_x + 2, y: 0 },
            //   forward: 2,
            //   health: 10,
            //   item: undefined,
            // } satisfies Entity,
          ],
        }}
        checkStep={10}
      />
    </div>
  );
}

type WorldViewConfig = {
  distance_unit: number;
  action_duration: number;
};

function WorldView(props: {
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
      history.push(deepcopy(world));
      const manager = new WorldUpdateManager(
        props.protoWorld,
        world,
        async (world) => {
          set_world({ ...world });
          await sleep(config.current.action_duration);
        },
      );
      await manager.run();
      stepIndex++;
      set_stepIndex(stepIndex);

      if (stepIndex === props.checkStep) {
        const world1 = world;
        if (history.find((world2) => eqWorld(world1, world2)) !== undefined) {
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
      {win === true ? (
        <div className="section Win">{"You Win!!!!"}</div>
      ) : win === false ? (
        <div className="section Lose">{"You Lose!!!!"}</div>
      ) : (
        <div className="section Pending">{`Steps till loop check: ${props.checkStep - stepIndex}`}</div>
      )}
      <div className="World-container">
        <div className="World">
          {Array.from(
            Object.values(world.entities).map((entity, i) => (
              <div
                className={`Entity ${entity.protoEntityId} ${entity.id}`}
                key={`entity-${i}`}
                style={{
                  width: `${1 * config.current.distance_unit}px`,
                  height: `${1 * config.current.distance_unit}px`,
                  left: entity.pos.x * config.current.distance_unit,
                  top: entity.pos.y * config.current.distance_unit,
                  transform: `rotate(${fromDirToDegrees(entity.forward)}deg)`,
                  transitionProperty: "left top transform",
                  transitionDuration: `${config.current.action_duration}ms`,
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
    </div>
  );
}
