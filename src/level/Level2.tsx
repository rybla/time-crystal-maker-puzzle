import { Entity, ProtoEntity, ProtoWorld } from "@/ontology";
import { WorldView } from "@/WorldView";
import { useState } from "react";

export default function Level() {
  const [worldIndex, set_worldIndex] = useState(0);

  const e1_x_min = 0;
  const e1_x_max = 1;
  const [e1_x, set_e1_x] = useState(e1_x_min);

  const e2_x_min = 0;
  const e2_x_max = 1;
  const [e2_x, set_e2_x] = useState(e2_x_min);

  const protoEntities: ProtoWorld["protoEntities"] = (
    [
      {
        id: "LineStomper",
        description: "Moves forward and attacks one space at a time.",
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
      {
        id: "Rock",
        description: "Is invincible and doesn't do anything.",
        triggers: [],
      },
      {
        id: "CircleRunner",
        description: "Moves in circles.",
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
          e1_x:{" "}
          <input
            type="range"
            min={e1_x_min}
            max={e1_x_max}
            defaultValue={e1_x}
            onChange={(e) => {
              set_e1_x(parseInt(e.currentTarget.value));
              set_worldIndex((i) => i + 1);
            }}
          />
        </div>
        <div>
          e2_x:{" "}
          <input
            type="range"
            min={e2_x_min}
            max={e2_x_max}
            defaultValue={e2_x}
            onChange={(e) => {
              set_e2_x(parseInt(e.currentTarget.value));
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
              id: "E2",
              protoEntityId: protoEntities.LineStomper.id,
              pos: { x: 1 + e1_x, y: 1 },
              forward: 1,
            },
            {
              id: "E1",
              protoEntityId: protoEntities.LineStomper.id,
              pos: { x: 4 + e2_x, y: 1 },
              forward: 3,
            },
            {
              id: "E3",
              protoEntityId: protoEntities.Rock.id,
              pos: { x: 6, y: 1 },
              forward: 3,
              invincible: true,
            },
            {
              id: "E4",
              protoEntityId: protoEntities.CircleRunner.id,
              pos: { x: 1, y: 2 },
              forward: 2,
            },
          ] satisfies Entity[],
        }}
        checkStep={7}
      />
    </div>
  );
}
