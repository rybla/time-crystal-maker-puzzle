import { useEffect, useRef, useState } from "react";
import "./App.css";
import {
  Entity,
  EntityId,
  fromDirToDegrees,
  ProtoEntity,
  ProtoEntityId,
  ProtoWorld,
  World,
} from "./ontology";
import { initializeWorld, WorldUpdateManager } from "./logic";
import { do_, match, sleep, Variant } from "./utility";

const distance_unit = 50; // px
const action_duration = 500; // ms
const max_distance = 10;

const Box: ProtoEntity = {
  id: "Box" as ProtoEntityId,
  name: "Box",
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

export default function App() {
  const box1_x_min = 2;
  const box1_x_max = 4;
  const [box1_x, set_box1_x] = useState(box1_x_min);

  return (
    <div className="App">
      <div>
        <input
          type="range"
          min={box1_x_min}
          max={box1_x_max}
          defaultValue={box1_x}
          onChange={(e) => set_box1_x(parseInt(e.currentTarget.value))}
        />
      </div>
      <WorldView
        protoWorld={{
          protoEntities: new Map(
            [Box].map((protoEntity) => [protoEntity.id, protoEntity]),
          ),
          initialEntities: [
            {
              protoEntityId: Box.id,
              id: "box1" as EntityId,
              name: "Box #1",
              forward: 2,
              health: 10,
              pos: { x: box1_x, y: 2 },
            } satisfies Entity,
          ],
        }}
      />
    </div>
  );
}

type QueueItem = Variant<QueueItemRow>;
type QueueItemRow = {
  reset: {};
  update: {};
  updateLoop: {};
  stop: {};
};

function WorldView(props: { protoWorld: ProtoWorld }) {
  // const isUpdating = useRef(false);
  const [world, set_world] = useState(initializeWorld(props.protoWorld));
  const [queueUpdateCounter, set_queueUpdateCounter] = useState(0);

  async function update() {
    console.log("[update]");
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

  const queue = useRef<QueueItem[]>([]);

  async function updateQueue() {
    const x = queue.current.pop();
    if (x === undefined) return;
    await match<QueueItemRow, Promise<void>>(x, {
      reset: async () => {
        console.log("[reset]");
        queue.current.splice(0, queue.current.length);
        set_world(initializeWorld(props.protoWorld));
        await sleep(action_duration);
      },
      update: async () => {
        console.log("[updateOnce]");
        await update();
      },
      updateLoop: async () => {
        console.log("[updateLoop] BEGIN");
        queue.current.push({ type: "updateLoop" });
        await update();
        console.log("[updateLoop] END");
      },
      stop: async () => {
        queue.current.splice(0, queue.current.length);
      },
    });
  }

  useEffect(() => {
    void do_(async () => {
      await updateQueue();
      set_queueUpdateCounter((x) => x + 1);
    });
  }, [queueUpdateCounter]);

  useEffect(() => {
    queue.current.push({ type: "reset" });
    if (queue.current.length === 0) set_queueUpdateCounter((x) => x + 1);
  }, [props]);

  return (
    <div className="WorldView">
      <div>WorldView</div>
      <div>
        <button
          onClick={() => {
            queue.current.splice(0, 0, { type: "reset" });
          }}
        >
          reset
        </button>
        <button
          onClick={() => {
            queue.current.push({ type: "update" });
          }}
        >
          step
        </button>
        <button
          onClick={() => {
            queue.current.push({ type: "updateLoop" });
          }}
        >
          loop
        </button>
        <button
          onClick={() => {
            queue.current.push({ type: "stop" });
          }}
        >
          stop
        </button>
      </div>
      <div
        className="World"
        style={{
          width: `${(max_distance + 1) * distance_unit}px`,
          height: `${(max_distance + 1) * distance_unit}px`,
        }}
      >
        {Array.from(
          world.entities.values().map((entity, i) => (
            <div
              className="Entity"
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
              <div>{entity.name}</div>
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
