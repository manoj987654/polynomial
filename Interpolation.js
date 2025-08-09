import fs from "fs";

// Function to convert a string in any base (up to 36) to BigInt
function baseToBigInt(valueStr, base) {
  const digits = valueStr.toLowerCase();
  const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = 0n;
  for (let char of digits) {
    const digit = BigInt(chars.indexOf(char));
    if (digit < 0n || digit >= BigInt(base)) {
      throw new Error(`Invalid digit '${char}' for base ${base}`);
    }
    result = result * BigInt(base) + digit;
  }
  return result;
}

// Lagrange interpolation to find f(0)
function lagrangeInterpolationAtZero(points) {
  let secret = 0n;
  const k = points.length;

  for (let i = 0; i < k; i++) {
    let xi = BigInt(points[i][0]);
    let yi = points[i][1];

    let numerator = 1n;
    let denominator = 1n;

    for (let j = 0; j < k; j++) {
      if (i !== j) {
        let xj = BigInt(points[j][0]);
        numerator *= -xj; 
        denominator *= xi - xj;
      }
    }

    // yi * (numerator / denominator)
    let term = (yi * numerator) / denominator;
    secret += term;
  }
  return secret;
}

try {
  // Read JSON file
  const raw = fs.readFileSync("data.json", "utf8");
  const data = JSON.parse(raw);

  const n = data.keys?.n;
  const k = data.keys?.k;

  if (!n || !k) throw new Error("Invalid JSON: Missing 'n' or 'k'");

  let points = [];

  for (let i = 1; i <= n; i++) {
    const entry = data[i.toString()];
    if (!entry) {
      console.warn(`Warning: Missing entry for key ${i}`);
      continue;
    }
    const base = parseInt(entry.base, 10);
    const valueStr = entry.value;

    if (isNaN(base) || base < 2 || base > 36) {
      throw new Error(`Invalid base at entry ${i}`);
    }

    const yDecoded = baseToBigInt(valueStr, base);
    points.push([i, yDecoded]);
  }

  if (points.length < k) {
    throw new Error(
      `Not enough points to solve polynomial: have ${points.length}, need ${k}`
    );
  }

  const selectedPoints = points.slice(0, k);

  const secret = lagrangeInterpolationAtZero(selectedPoints);

  console.log("Decoded Points (first k used):");
  selectedPoints.forEach(([x, y]) => {
    console.log(`x=${x}, y=${y}`);
  });

  console.log("\nSecret (c) =", secret.toString());
} catch (err) {
  console.error("Error:", err.message);
}

/*  Test case 1 : o/p

Decoded Points (first k used):
x=1, y=4
x=2, y=7
x=3, y=12

Secret (c) = 3


*/

/*
Test case 2 : output
Decoded Points (first k used):
x=1, y=995085094601491
x=2, y=21394886326566393
x=3, y=196563650089608567
x=4, y=1016509518118225951
x=5, y=3711974121218449851
x=6, y=10788619898233492461
x=7, y=26709394976508342463

Secret (c) = 79836264049851





*/