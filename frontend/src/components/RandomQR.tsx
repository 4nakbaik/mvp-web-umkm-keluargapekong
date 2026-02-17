import { useMemo } from 'react';

interface RandomQRProps {
  size?: number;
  color?: string;
  backgroundColor?: string;
}

export default function RandomQR({
  size = 200,
  color = '#000000',
  backgroundColor = '#ffffff',
}: RandomQRProps) {
  // Config
  const gridSize = 25; // Standard QR is often 21x21, 25x25, etc.

  // Memoize the grid data so it doesn't change on every render unless props change
  // Actually, we want it to stay constant for the component's valid lifecycle
  const grid = useMemo(() => {
    // Initialize grid
    const newGrid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(false));

    // Helper to add finder pattern
    const addFinderPattern = (row: number, col: number) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (
            r === 0 ||
            r === 6 || // Top/Bottom border
            c === 0 ||
            c === 6 || // Left/Right border
            (r >= 2 && r <= 4 && c >= 2 && c <= 4) // Inner block
          ) {
            newGrid[row + r][col + c] = true;
          } else {
            newGrid[row + r][col + c] = false;
          }
        }
      }
    };

    // Add 3 finder patterns
    addFinderPattern(0, 0); // Top Left
    addFinderPattern(0, gridSize - 7); // Top Right
    addFinderPattern(gridSize - 7, 0); // Bottom Left

    // Fill the rest randomly
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        // Skip finder pattern zones
        // Top Left (0-7, 0-7)
        if (r < 8 && c < 8) continue;
        // Top Right (0-8, gridSize-8 to gridSize)
        if (r < 8 && c >= gridSize - 8) continue;
        // Bottom Left (gridSize-8 to gridSize, 0-8)
        if (r >= gridSize - 8 && c < 8) continue;

        // Randomly fill
        newGrid[r][c] = Math.random() > 0.5;
      }
    }

    return newGrid;
  }, [gridSize]); // Only recreate if gridSize changes (which is constant here)

  const cellSize = size / gridSize;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ backgroundColor }}
      shapeRendering="crispEdges" // Prevents anti-aliasing artifacts between blocks
    >
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) =>
          cell ? (
            <rect
              key={`${rowIndex}-${colIndex}`}
              x={colIndex * cellSize}
              y={rowIndex * cellSize}
              width={cellSize}
              height={cellSize}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  );
}
