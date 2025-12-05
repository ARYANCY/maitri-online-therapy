import { copyFileSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

try {
  console.log('📦 Copying routing configuration files...\n');
  
  
  if (existsSync('static.json')) {
    copyFileSync('static.json', 'dist/static.json');
    console.log('✓ Copied static.json to dist/');
  } else {
    console.warn('⚠ static.json not found, creating default...');
    const defaultStatic = {
      "rewrites": [
        {
          "source": "/*",
          "destination": "/index.html"
        }
      ]
    };
    writeFileSync('dist/static.json', JSON.stringify(defaultStatic, null, 2));
    console.log('✓ Created default static.json in dist/');
  }

  
  const redirectsSource = join('public', '_redirects');
  const redirectsDest = join('dist', '_redirects');
  
  if (existsSync(redirectsSource)) {
    copyFileSync(redirectsSource, redirectsDest);
    console.log('✓ Copied _redirects from public/ to dist/');
  } else if (!existsSync(redirectsDest)) {
    
    const redirectsContent = '/*    /index.html   200\n';
    writeFileSync(redirectsDest, redirectsContent);
    console.log('✓ Created _redirects in dist/');
  } else {
    console.log('✓ _redirects already exists in dist/');
  }
  
  console.log('\n✅ All routing files ready in dist/');
  console.log('   - static.json (Render routing)');
  console.log('   - _redirects (Netlify/Render format)');
} catch (error) {
  console.error('✗ Failed to copy routing files:', error.message);
  process.exit(1);
}

