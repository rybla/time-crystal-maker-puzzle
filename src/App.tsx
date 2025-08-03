import { useState } from "react";
import "./App.css";
import Level0 from "./level/Level0";
import Level1 from "./level/Level1";
import Level2 from "./level/Level2";

const levels = [Level0, Level1, Level2];

export default function App() {
  const [levelIndex, set_levelIndex] = useState(0);
  const Level = levels.at(levelIndex);

  return (
    <div className="App">
      <div className="controls">
        <button
          disabled={levelIndex === 0}
          onClick={() => set_levelIndex((x) => x - 1)}
        >
          prev
        </button>
        <div className="label">{`Level ${levelIndex}`}</div>
        <button
          disabled={levelIndex === levels.length}
          onClick={() => set_levelIndex((x) => x + 1)}
        >
          next
        </button>
      </div>
      <div className="level">
        {Level === undefined ? (
          <div>{"there are no more levels"}</div>
        ) : (
          <Level />
        )}
      </div>
    </div>
  );
}
