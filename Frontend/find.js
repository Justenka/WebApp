const fs = require('fs');
const path = require('path');

// Configuration
const rootDir = './'; // Your project root directory
const componentsDir = path.join(rootDir, 'components/ui'); // UI components directory
const fileExtensions = ['.js', '.jsx', '.ts', '.tsx']; // File extensions to scan
const excludeDirs = ['node_modules', '.next', 'out', 'build', 'dist']; // Directories to exclude

// Track components and their usage
const components = new Map();
const importStatements = [];

// Get all component files in the UI directory
function getComponentFiles() {
  try {
    if (!fs.existsSync(componentsDir)) {
      console.error(`Components directory not found: ${componentsDir}`);
      return [];
    }
    
    return fs.readdirSync(componentsDir)
      .filter(file => fileExtensions.includes(path.extname(file)))
      .map(file => ({
        name: path.basename(file, path.extname(file)),
        path: path.join(componentsDir, file)
      }));
  } catch (error) {
    console.error('Error reading components directory:', error);
    return [];
  }
}

// Scan a file for import statements
function scanFileForImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Look for import statements that reference our UI components
      if (line.includes('import') && line.includes('@/components/ui/')) {
        const match = line.match(/@\/components\/ui\/([a-zA-Z0-9-]+)/);
        if (match && match[1]) {
          const componentName = match[1];
          importStatements.push({
            component: componentName,
            file: filePath
          });
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error);
  }
}

// Recursively scan directory for files
function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip excluded directories
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          scanDirectory(fullPath);
        }
        continue;
      }
      
      // Scan files with matching extensions
      if (fileExtensions.includes(path.extname(entry.name))) {
        scanFileForImports(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }
}

// Main function
function findUnusedComponents() {
  console.log('Scanning for unused UI components...');
  
  // Get all component files
  const componentFiles = getComponentFiles();
  componentFiles.forEach(comp => {
    components.set(comp.name, {
      path: comp.path,
      used: false,
      usedIn: []
    });
  });
  
  // Scan project for imports
  scanDirectory(rootDir);
  
  // Mark components as used
  importStatements.forEach(imp => {
    if (components.has(imp.component)) {
      const component = components.get(imp.component);
      component.used = true;
      component.usedIn.push(imp.file);
    }
  });
  
  // Generate report
  console.log('\n=== COMPONENT USAGE REPORT ===\n');
  
  console.log('USED COMPONENTS:');
  let usedCount = 0;
  components.forEach((info, name) => {
    if (info.used) {
      usedCount++;
      console.log(`- ${name} (used in ${info.usedIn.length} files)`);
    }
  });
  
  console.log('\nUNUSED COMPONENTS:');
  let unusedCount = 0;
  components.forEach((info, name) => {
    if (!info.used) {
      unusedCount++;
      console.log(`- ${name} (${info.path})`);
    }
  });
  
  console.log(`\nSUMMARY: ${usedCount} used, ${unusedCount} unused out of ${components.size} total components`);
  
  // Generate removal command
  if (unusedCount > 0) {
    console.log('\nTo remove unused components, you can run:');
    const unusedFiles = Array.from(components.entries())
      .filter(([_, info]) => !info.used)
      .map(([_, info]) => info.path);
    
    console.log(`rm ${unusedFiles.join(' ')}`);
  }
}

// Run the script
findUnusedComponents();