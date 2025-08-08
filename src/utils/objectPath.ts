/**
 * Get a value from an object using a dot-notation path with array indices
 * Example: getByPath(obj, 'sections[0].data.metrics[1].label')
 */
export function getByPath(obj: any, path: string): any {
  if (!obj || !path) return undefined;
  
  const keys = path.split('.').map(key => {
    // Handle array indices like 'sections[0]'
    const match = key.match(/^(.+)\[(\d+)\]$/);
    if (match) {
      return { key: match[1], index: parseInt(match[2]) };
    }
    return { key, index: null };
  });

  let current = obj;
  
  for (const { key, index } of keys) {
    if (current === null || current === undefined) return undefined;
    
    if (index !== null) {
      // Handle array access
      if (!Array.isArray(current[key])) return undefined;
      current = current[key][index];
    } else {
      // Handle regular property access
      current = current[key];
    }
  }
  
  return current;
}

/**
 * Set a value in an object using a dot-notation path with array indices
 * Example: setByPath(obj, 'sections[0].data.metrics[1].label', 'New Label')
 */
export function setByPath(obj: any, path: string, value: any): void {
  if (!obj || !path) return;
  
  const keys = path.split('.').map(key => {
    // Handle array indices like 'sections[0]'
    const match = key.match(/^(.+)\[(\d+)\]$/);
    if (match) {
      return { key: match[1], index: parseInt(match[2]) };
    }
    return { key, index: null };
  });

  let current = obj;
  
  // Navigate to the parent of the target property
  for (let i = 0; i < keys.length - 1; i++) {
    const { key, index } = keys[i];
    
    if (index !== null) {
      // Handle array access
      if (!Array.isArray(current[key])) {
        current[key] = [];
      }
      if (!current[key][index]) {
        current[key][index] = {};
      }
      current = current[key][index];
    } else {
      // Handle regular property access
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
  }
  
  // Set the final value
  const lastKey = keys[keys.length - 1];
  if (lastKey.index !== null) {
    // Handle array access for the final property
    if (!Array.isArray(current[lastKey.key])) {
      current[lastKey.key] = [];
    }
    current[lastKey.key][lastKey.index] = value;
  } else {
    // Handle regular property access for the final property
    current[lastKey.key] = value;
  }
} 