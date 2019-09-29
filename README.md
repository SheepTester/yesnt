# YES escape

Vagus nerves, activate!

Uses [three.js](https://threejs.org/) and [simple-reverb](https://github.com/web-audio-components/simple-reverb/).

## Audio credits

Sohum mantra track by [True Best News](https://www.youtube.com/watch?v=xOl7MWGjVRo).

Bloom pass code from the [three.js examples](https://threejs.org/examples/#webgl_postprocessing_unreal_bloom).

Exit sign font is [Teko](https://fonts.google.com/specimen/Teko).

Lights off sound by [Cyberkineticfilms](https://freesound.org/people/Cyberkineticfilms/sounds/135434/).

Floor creak sound by [TheBuilder15](https://freesound.org/people/TheBuilder15/sounds/367050/).

Key press sound by [junggle](https://freesound.org/people/junggle/sounds/26777/) (wrong sound is derived from this).

Correct sound by [pan14](https://freesound.org/people/pan14/sounds/263133/).

Caught sound by [onderwish](https://freesound.org/people/onderwish/sounds/469141/) (reversed and sped up).

Introduction is read by [Justin](https://ttsmp3.com/).

## URL parameters

`INHALE_OXYGEN_SPEED`, `BREATHING_SPEED`, `BREATHING_BOOST_SPEED`, `MAX_OXYGEN`, `LUNG_RANGE`, `LIVING_OXYGEN_USAGE`, `RUNNING_OXYGEN_USAGE`, `LOW_OXYGEN`, and `ASPHYXIATION` adjust breathing; refer to `main.js` for how they work.

`shaders=false` to turn off the glow effect

`freeze-instructor=false` to prevent the instructor from chasing you

`override-player-check=dont` to not trigger the instructor if your arm motions are not in sync

`override-player-check=omniscient` has the instructor always check your arm motions, even if she's not facing you

`unrealistic-breathing=true` to turn off breathing

`skip-to` either `expansion`, `power`, or `om`

`skip-eyes-closed=true` will skip the brief "eyes closed" scene at the beginning of a round

`log-loading=true` will log resources being loaded to the console

`lambert=true` will use a less intensive material, which will make the game look worse but perform better

`wireframe=true` turns on wireframe for everything

`stay-intro=true` doesn't start the game after the intro

`box-students=true` will make the students their hitbox, which is supposed to make the game perform better by reducing objects

`use-tts=false` will turn off the TTS voice

`fast-guess=true` will make the silent speech go by very quickly

`one-door-only=true` will not require you to test the code in a corridor

## To do

- sounds

  - instructor voices

  - footstep sounds

  - caught sounds (static or something)

- minor touches

  - better touch controls

  - options screen

    - should be while the game plays so player can live test

    - option to restart

  - betterify instructor's player model (hair)

  - Kleenex(r)

  - PE teacher sitting at the back
