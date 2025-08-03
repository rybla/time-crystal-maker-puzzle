import Markdown from "react-markdown";

export default function Level() {
  return (
    <div className="Level">
      <div className="Markdown">
        <Markdown>
          {`
Welcome to the **Time Crystal Maker**!

This is a puzzle game where you manipulate some parameters in order to yield a [time crystal](https://en.wikipedia.org/wiki/Time_crystal) –– that is, a repeating **loop** of game states.

Since this game's rules are deterministic, then such a time crystal is infinite!

But of course, we can't just run the game _forever_ before deciding whether or not you successfully constructed a time crystal in a level. So, we detect that a time crystal has been constructed by checking to see if, after some number _N_ of simulation steps, there exists a game state _M_ such that _0 <= M < N_ and game state _M_ is the same as game state _N_. This is sufficient to show a time crystal has been constructed, because it demonstrates that updating the sequence of game states from _M_ to _N_ forms a [fixed-point](https://en.wikipedia.org/wiki/Fixed-point_theorem).

Have fun!
  `.trim()}
        </Markdown>
      </div>
    </div>
  );
}
