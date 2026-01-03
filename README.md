# Pendulum Rubber Action

Pendulum Rubber Action is a high-intensity, physics-based action game where you control a pendulum on a rubber string using mouse or touch movements to destroy targets. This work was created as an homage to the classic masterpiece "Pendulumania" by CANO-Lab / naruto.

## 🕹️ How to Play

### Basic Controls
- **Mouse / Touch Operation**: The rubber string's "anchor" follows your movement.
- **Swing the Ball**: Move the anchor quickly to swing the iron ball using centrifugal force and elasticity to hit targets.
- **Destroy Targets**: Hitting a target destroys it, adding to your score and recovering some remaining time.

### Core Mechanics: Tension and Evaluation
The key to high scores is **"how much you stretch the rubber"** when you hit a target.

| Evaluation | Stretch % | Base Score | Characteristics |
| :--- | :--- | :--- | :--- |
| **PERFECT** | 90% - 100% | 1,000 pts | Maximum sparks and score |
| **GREAT** | 70% - 89% | 500 pts | High score efficiency |
| **GOOD** | 40% - 69% | 200 pts | Standard hit |
| **OK** | 5% - 39% | 100 pts | Light hit |
| **FAIL** | < 5% | 0 pts | No score added |

⚠️ **Danger - Snap!**: Stretching the rubber over **100%** will trigger a warning. If you stay in this "DANGER" state for too long, the rubber will **snap**, resulting in an immediate Game Over.

## 📈 Score & Combo System
- **Combo**: Destroy targets within 5 seconds of each other to chain combos.
- **Multiplier**: For every 5 hits in a combo, your score multiplier increases (**x2, x4, x8...**).
- **Large Score Notation**: To handle astronomical scores, you can switch between "Kanji Notation" (Man, Oku, Cho...) and "Scientific Notation" in the settings.

## 🎯 Target Types
Destroying specific targets will strengthen your ball or change the game state.

- 🟡 **Yellow Target**: Standard target. Recovers a small amount of time.
- 🟢 **Green Target**: Recovery. Increases the rubber's maximum load (durability) and recovers time.
- 🔴 **Red Target**: Weight Increase. Makes the ball larger and heavier, making it easier to hit targets. Recovers significant time.

### 🌟 Special Targets (Appears at 10+ Combos)
Once you reach a 10-hit combo, special targets have a 15% chance to appear. Effects last for 10 seconds.

- ⚪ **White Target (Kinetic Chaos)**: All targets on the screen start moving and bouncing off walls as if they have a mind of their own.
- ⚫ **Black Target (Gravity Invert)**: Gravity is inverted, causing the ball and objects to "fall" upwards.

## ⚙️ Systems & Settings
- **Calibration**: In the settings screen, you can fine-tune physics constants like gravity, elasticity (K), natural length, and collision bounciness to match your playstyle.
- **Nostr Integration**: Features a global ranking system using the Nostr protocol (Kind 30078). Sync your high scores to relays and compete with players worldwide.
- **3D Background**: A cyber-space background rendered with Three.js that changes color and vibrates in sync with the game's tension.

---
*This game aims to capture the tactile satisfaction of physics simulation and the beauty of high-stakes gameplay found in "Pendulumania," expressed through modern web technology.*