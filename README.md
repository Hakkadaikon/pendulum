# Pendulum Rubber Action

A high-intensity, physics-based action game where you control a pendulum on a rubber string. This game is an homage to the classic "Pendulumania" by CANO-Lab / naruto.

## 🕹️ How to Play

### Basic Controls
- **Full Mouse / Touch Operation**: The anchor point of the rubber string follows your cursor.
- **Swing the Ball**: Move your mouse dynamically to swing the pendulum ball into the targets floating in the shaft.

### The Core Mechanic: Tension & Evaluation
The key to high scores is **stretching the rubber**. The further the rubber is stretched when you hit a target, the higher your evaluation and score.

| Evaluation | Stretch Level | Base Score |
| :--- | :--- | :--- |
| **PERFECT (完璧)** | 90% - 100% | 1,000 pts |
| **GREAT (秀逸)** | 70% - 89% | 500 pts |
| **GOOD (優良)** | 40% - 69% | 200 pts |
| **OK (可)** | 5% - 39% | 100 pts |
| **FAIL (不可)** | < 5% | 0 pts |

⚠️ **DANGER**: If you stretch the rubber beyond **100%**, a warning appears. Holding it in the danger zone for too long will cause the rubber to **SNAP**, leading to an immediate Mission End!

## 📈 Scoring & Combos
- **Combo System**: Every hit increases your combo.
- **Multiplier**: Your final score per hit is calculated as:  
  `Base Score × (1 + Combo × 0.1)`
- **Combo Timer**: Hits must be chained within 5 seconds to maintain the combo.

## 🎯 Target Types
Different targets provide various buffs to help you survive longer and reach higher scores:

- 🟡 **Yellow Target**: Standard target. Restores a small amount of time.
- 🟢 **Green Target**: Recovery. Increases the maximum load of your rubber string and restores more time.
- 🔴 **Red Target**: Power up. Increases the mass and radius of your ball, making it easier to hit targets, and restores a significant amount of time.

## ⚙️ System Calibration
In the **SETTINGS** menu, you can tweak the physics engine:
- **Gravity**: Change how fast the ball falls.
- **Rubber Elasticity (K)**: Adjust the "snappiness" of the string.
- **Natural Length**: Change the resting length of the rubber.
- **Collision Bounciness**: Adjust how much energy is retained when hitting walls.

---
*This game is a tribute to the mechanical beauty and addictive gameplay of "Pendulumania".*