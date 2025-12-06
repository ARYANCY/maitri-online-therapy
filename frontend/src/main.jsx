import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./i18n";
import "../css/bootstrap-theme.css";
import "../css/mobile-responsive.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


function waitForStylesheets() {
  return new Promise((resolve) => {
    
    const checkStylesheetsLoaded = () => {
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])'));
      
      if (stylesheets.length === 0) {
        return true; 
      }

      
      return stylesheets.every((link) => {
        
        
        
        
        return link.sheet !== null || link.href === '' || link.href === window.location.href;
      });
    };

    
    if (document.readyState === 'complete') {
      if (checkStylesheetsLoaded()) {
        
        setTimeout(resolve, 50);
        return;
      }
      
      
      const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])'));
      let loadedCount = 0;
      const totalStylesheets = stylesheets.length;
      let resolved = false;

      const checkComplete = () => {
        if (resolved) return;
        loadedCount++;
        if (loadedCount >= totalStylesheets || checkStylesheetsLoaded()) {
          resolved = true;
          setTimeout(resolve, 50);
        }
      };

      stylesheets.forEach((link) => {
        if (link.sheet || link.href === '') {
          checkComplete();
        } else {
          link.addEventListener('load', checkComplete, { once: true });
          link.addEventListener('error', checkComplete, { once: true });
        }
      });

      
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 200);
      return;
    }

    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        
        const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])'));
        let loadedCount = 0;
        const totalStylesheets = stylesheets.length;
        let resolved = false;

        if (totalStylesheets === 0 || checkStylesheetsLoaded()) {
          setTimeout(resolve, 50);
          return;
        }

        const checkComplete = () => {
          if (resolved) return;
          loadedCount++;
          if (loadedCount >= totalStylesheets || checkStylesheetsLoaded()) {
            resolved = true;
            setTimeout(resolve, 50);
          }
        };

        stylesheets.forEach((link) => {
          if (link.sheet || link.href === '') {
            checkComplete();
          } else {
            link.addEventListener('load', checkComplete, { once: true });
            link.addEventListener('error', checkComplete, { once: true });
          }
        });

        
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        }, 200);
      }, { once: true });
      return;
    }

    
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]:not([media="print"])'));
    let loadedCount = 0;
    const totalStylesheets = stylesheets.length;
    let resolved = false;

    if (totalStylesheets === 0 || checkStylesheetsLoaded()) {
      setTimeout(resolve, 50);
      return;
    }

    const checkComplete = () => {
      if (resolved) return;
      loadedCount++;
      if (loadedCount >= totalStylesheets || checkStylesheetsLoaded()) {
        resolved = true;
        setTimeout(resolve, 50);
      }
    };

    stylesheets.forEach((link) => {
      if (link.sheet || link.href === '') {
        checkComplete();
      } else {
        link.addEventListener('load', checkComplete, { once: true });
        link.addEventListener('error', checkComplete, { once: true });
      }
    });

    
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve();
      }
    }, 200);
  });
}


async function initApp() {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('[FOUC] Root element not found');
    return;
  }
  
  
  await waitForStylesheets();
  
  
  if (document.readyState !== 'complete') {
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve, { once: true });
        
        setTimeout(resolve, 500);
      }
    });
  }
  
  
  rootElement.classList.add('styles-loaded');
  
  
  await new Promise(resolve => {
    
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 50);
      });
    });
  });
  
  
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}


initApp().catch(console.error);
