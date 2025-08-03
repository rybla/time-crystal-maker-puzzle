import { Entity, ProtoEntity, ProtoWorld } from "@/ontology";
import { WorldView } from "@/WorldView";
import { useState } from "react";

export default function Level() {
  const [worldIndex, set_worldIndex] = useState(0);

  const runner1_x_min = 0;
  const runner1_x_max = 8;
  const [runner1_x, set_runner1_x] = useState(runner1_x_min);

  const runner2_x_min = 0;
  const runner2_x_max = 8;
  const [runner2_x, set_runner2_x] = useState(runner2_x_min);

  const protoEntities: ProtoWorld["protoEntities"] = (
    [
      {
        id: "RunnerFigure8",
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
      },
      {
        id: "CircleRunner",
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
      },
      {
        id: "LineRunner",
        triggers: [
          {
            condition: () => true,
            action: {
              type: "sequence",
              actions: [{ type: "moveForward" }],
            },
          },
        ],
      },
      {
        id: "LineStomper",
        triggers: [
          {
            condition: () => true,
            action: {
              type: "sequence",
              actions: [{ type: "moveForward" }, { type: "attack" }],
            },
          },
        ],
      },
    ] satisfies ProtoEntity[]
  ).reduce(
    (acc, protoEntity) => {
      acc[protoEntity.id] = protoEntity;
      return acc;
    },
    {} as ProtoWorld["protoEntities"],
  );

  return (
    <div className="Level">
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
          runner2_x:{" "}
          <input
            type="range"
            min={runner2_x_min}
            max={runner2_x_max}
            defaultValue={runner2_x}
            onChange={(e) => {
              set_runner2_x(parseInt(e.currentTarget.value));
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
          protoEntities,
          initialEntities: [
            {
              id: "E1",
              protoEntityId: protoEntities.CircleRunner.id,
              pos: { x: runner1_x, y: 2 },
              forward: 2,
              item: undefined,
              alive: true,
            },
            // {
            //   id: "E2",
            //   protoEntityId: protoEntities.LineRunner.id,
            //   pos: { x: runner1_x + 2, y: 0 },
            //   forward: 2,
            //   health: 10,
            //   item: undefined,
            // } satisfies Entity,
            {
              id: "3",
              protoEntityId: protoEntities.LineStomper.id,
              alive: true,
              pos: { x: runner2_x, y: 1 },
              forward: 2,
              item: undefined,
            },
          ] satisfies Entity[],
        }}
        checkStep={10}
      />
    </div>
  );
}
