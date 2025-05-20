import fs from 'fs';
import path from 'path';

// This script converts the monster JSON format to the format needed for statblock.json

// Read the input file
const inputFile = path.join(__dirname, 'statblock (template for full).json');
const outputFile = path.join(__dirname, 'statblock.json');

try {
  const rawData = fs.readFileSync(inputFile, 'utf8');
  const monsterData = JSON.parse(rawData);
  
  // Transform the data
  const transformedData = monsterData.monster.map(monster => {
    // Get size as string
    const sizeMap = {
      'T': 'Tiny',
      'S': 'Small',
      'M': 'Medium',
      'L': 'Large',
      'H': 'Huge',
      'G': 'Gargantuan'
    };
    
    // Get alignment as string
    const alignmentMap = {
      'LG': 'Lawful Good',
      'NG': 'Neutral Good',
      'CG': 'Chaotic Good',
      'LN': 'Lawful Neutral',
      'N': 'Neutral',
      'CN': 'Chaotic Neutral',
      'LE': 'Lawful Evil',
      'NE': 'Neutral Evil',
      'CE': 'Chaotic Evil',
      'U': 'Unaligned',
      'A': 'Any Alignment'
    };
    
    // Format speed
    let speedString = '';
    if (monster.speed) {
      const speedParts = [];
      if (monster.speed.walk) speedParts.push(`${monster.speed.walk} ft.`);
      if (monster.speed.fly) speedParts.push(`Fly ${monster.speed.fly} ft.`);
      if (monster.speed.swim) speedParts.push(`Swim ${monster.speed.swim} ft.`);
      if (monster.speed.climb) speedParts.push(`Climb ${monster.speed.climb} ft.`);
      speedString = speedParts.join(', ');
    }
    
    // Build output object
    return {
      id: monster.name,
      HP: `${monster.hp.average} (${monster.hp.formula})`,
      AC: `${monster.ac[0]}`,
      Speed: speedString,
      avatarUrl: monster.avatarUrl || null,
      // Include the original data for the statblock popup
      ...monster
    };
  });
  
  // Write to output file
  fs.writeFileSync(outputFile, JSON.stringify(transformedData, null, 2));
  console.log(`Successfully created ${outputFile}`);
} catch (error) {
  console.error('Error processing the file:', error);
}