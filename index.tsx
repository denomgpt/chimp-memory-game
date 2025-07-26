import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';

interface Box {
  id: number;
  row: number;
  col: number;
}

/**
 * Size of the square grid. A value of 4 will generate a 4×4 board.
 */
const GRID_SIZE = 4;

/**
 * Initial number of boxes to remember. The displayed level will be this
 * value minus two to give players a friendlier starting point (level 1).
 */
const INITIAL_BOX_COUNT = 3;

/**
 * Home component implementing a simple memory game inspired by the Chimp Test.
 * Numbers are shown briefly on random squares. Once hidden, the player must
 * click them in ascending order. Success increases the level, failure lowers
 * the difficulty.
 */
export default function Home() {
  const [level, setLevel] = useState(INITIAL_BOX_COUNT);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [showNumbers, setShowNumbers] = useState(true);
  const [sequence, setSequence] = useState<number[]>([]);
  const [userIndex, setUserIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');

  /**
   * Generate a list of unique positions within the GRID_SIZE × GRID_SIZE board.
   * Each position is represented by a row and column index. The count
   * parameter controls how many positions are returned.
   */
  const generateUniquePositions = (count: number): { row: number; col: number }[] => {
    const used = new Set<string>();
    const positions: { row: number; col: number }[] = [];
    while (positions.length < count) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      const key = `${row}-${col}`;
      if (!used.has(key)) {
        used.add(key);
        positions.push({ row, col });
      }
    }
    return positions;
  };

  /**
   * Initialize a new round whenever the level changes. Randomly place
   * numbered boxes, show them briefly, then hide and await user input.
   */
  useEffect(() => {
    const positions = generateUniquePositions(level);
    // Assign ids starting at 1 for display purposes
    const newBoxes = positions.map((pos, index) => ({ id: index + 1, row: pos.row, col: pos.col }));
    // Sequence is the ordered list of ids to click: 1, 2, 3, ...
    const newSequence = newBoxes.map((box) => box.id).sort((a, b) => a - b);
    setBoxes(newBoxes);
    setSequence(newSequence);
    setShowNumbers(true);
    setUserIndex(0);
    setStatus('playing');
    // Hide numbers after a delay that increases slightly with level
    const delay = 1000 + level * 200;
    const timeout = setTimeout(() => setShowNumbers(false), delay);
    return () => clearTimeout(timeout);
  }, [level]);

  /**
   * Handle user clicks on numbered cells. Ignores clicks during display phase.
   * Advances the level on success or reduces difficulty on failure.
   */
  const handleBoxClick = (id: number) => {
    if (showNumbers || status !== 'playing') return;
    // Correct click
    if (id === sequence[userIndex]) {
      const nextIndex = userIndex + 1;
      if (nextIndex === sequence.length) {
        // Completed all numbers
        setStatus('won');
        // Move to harder level after brief pause
        setTimeout(() => setLevel((l) => l + 1), 800);
      } else {
        setUserIndex(nextIndex);
      }
    } else {
      // Wrong click resets game down to a minimum difficulty
      setStatus('lost');
      setTimeout(() => setLevel((l) => Math.max(INITIAL_BOX_COUNT, l - 1)), 1200);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Chimp Memory Test</h1>
      <p className={styles.description}>
        Memoriza la posición de los números y haz clic en ellos en orden ascendente.
      </p>
      <p className={styles.level}>Nivel: {level - INITIAL_BOX_COUNT + 1}</p>
      {/* Render the grid */}
      <div className={styles.grid}>
        {Array.from({ length: GRID_SIZE }).map((_, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {Array.from({ length: GRID_SIZE }).map((_, colIndex) => {
              const box = boxes.find((b) => b.row === rowIndex && b.col === colIndex);
              return (
                <div
                  key={colIndex}
                  className={
                    styles.cell +
                    (box ? ` ${styles.active}` : '') +
                    (status === 'lost' && box && !showNumbers ? ` ${styles.wrong}` : '')
                  }
                  onClick={() => box && handleBoxClick(box.id)}
                >
                  {box && showNumbers ? box.id : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {/* Status messages */}
      {status === 'lost' && <p className={styles.gameover}>¡Incorrecto! Reiniciando…</p>}
      {status === 'won' && <p className={styles.won}>¡Bien hecho! Avanzando…</p>}
    </main>
  );
}