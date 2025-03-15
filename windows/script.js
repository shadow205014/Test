document.addEventListener('DOMContentLoaded', () => {
  const controlCenterButton = document.querySelector('.control-center-button');
  const controlCenter = document.querySelector('.control-center');

  controlCenterButton.addEventListener('click', () => {
    controlCenter.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!controlCenter.contains(e.target) && !controlCenterButton.contains(e.target)) {
      controlCenter.classList.remove('show');
    }
  });

  const slider = document.querySelector('.slider');
  const sliderThumb = document.querySelector('.slider-thumb');
  const sliderFill = document.querySelector('.slider-fill');
  let isDragging = false;

  sliderThumb.addEventListener('mousedown', () => {
    isDragging = true;
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const rect = slider.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width * 100;
      percent = Math.min(100, Math.max(0, percent));
      
      sliderThumb.style.left = `${percent}%`;
      sliderFill.style.width = `${percent}%`;
      
      // Adjust screen brightness (this is just for demonstration)
      document.body.style.filter = `brightness(${percent / 100})`;
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  const quickActions = document.querySelectorAll('.quick-action');
  quickActions.forEach(action => {
    action.addEventListener('click', () => {
      action.style.background = action.style.background ? '' : 'rgba(0, 120, 215, 0.6)';
    });
  });

  const bootScreen = document.querySelector('.boot-screen');
  const lockScreen = document.querySelector('.lock-screen');
  const loginScreen = document.querySelector('.login-screen');
  const desktop = document.querySelector('.desktop');
  const startButton = document.querySelector('.start-button');
  const startMenu = document.getElementById('startMenu');
  const time = document.querySelector('.time');

  // Boot sequence
  setTimeout(() => {
    bootScreen.style.opacity = '0';
    setTimeout(() => {
      bootScreen.style.display = 'none';
      lockScreen.classList.add('show');
    }, 500);
  }, 5000);

  // Lock screen click/keydown handler
  function unlockScreen() {
    if (lockScreen.classList.contains('show')) {
      lockScreen.classList.add('hide');
      setTimeout(() => {
        loginScreen.classList.add('show');
        setTimeout(() => {
          lockScreen.style.display = 'none';
        }, 500);
      }, 300); // Slight delay before showing login screen to allow animation to complete
    }
  }

  document.addEventListener('click', unlockScreen);
  document.addEventListener('keydown', unlockScreen);

  // Login handling
  const loginButton = document.querySelector('.login-button');
  const passwordInput = document.querySelector('.login-input');
  const loginError = document.querySelector('.login-error');

  function handleLogin() {
    // Simple password check - in a real app, this would be more secure
    if (passwordInput.value === '1234') {
      loginScreen.style.opacity = '0';
      desktop.style.opacity = '1';
      setTimeout(() => {
        loginScreen.style.display = 'none';
      }, 500);
    } else {
      loginError.classList.add('show');
      setTimeout(() => {
        loginError.classList.remove('show');
      }, 3000);
      passwordInput.value = '';
    }
  }

  loginButton.addEventListener('click', handleLogin);
  passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  // Start menu toggle with animation
  startButton.addEventListener('click', () => {
    startMenu.classList.toggle('show');
  });

  // Close start menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
      startMenu.classList.remove('show');
    }
  });

  // Update time for both taskbar and lock screen
  function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    time.textContent = timeString;
    
    // Update lock screen time and date
    const lockTime = document.querySelector('.time-display');
    const lockDate = document.querySelector('.date-display');
    if (lockTime) {
      lockTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (lockDate) {
      lockDate.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
    }
  }

  updateTime();
  setInterval(updateTime, 1000);

  function updateBattery() {
    if ('getBattery' in navigator) {
      navigator.getBattery().then(battery => {
        function updateAllBatteryInfo() {
          const batteryLevel = document.querySelector('.battery-level');
          const batteryText = document.querySelector('.battery-text');
          const batteryIcon = document.querySelector('.battery-icon');
          
          // Update battery level
          batteryLevel.style.width = `${battery.level * 100}%`;
          batteryText.textContent = `${Math.round(battery.level * 100)}%`;
          
          // Check if battery is at 20% and create warning window
          if (Math.round(battery.level * 100) === 20) {
            // Only create if warning window doesn't exist
            if (!document.querySelector('.battery-warning-window')) {
              const warningWindow = document.createElement('div');
              warningWindow.className = 'app-window battery-warning-window';
              warningWindow.style.zIndex = '1000';
              warningWindow.style.width = '400px';
              warningWindow.style.height = 'auto';
              
              warningWindow.innerHTML = `
                <div class="window-title-bar">
                  <div class="window-title">Battery Warning</div>
                  <div class="window-controls">
                    <button class="close">×</button>
                  </div>
                </div>
                <div class="window-content" style="padding: 20px;">
                  <div style="display: flex; align-items: start; gap: 15px;">
                    <svg viewBox="0 0 24 24" width="32" height="32" style="min-width: 32px;">
                      <path fill="#ff6b6b" d="M13,7h-2v6h2V7zm0 8h-2v2h2v-2zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    </svg>
                    <div>
                      <h3 style="margin: 0 0 10px 0;">Battery is at 20%</h3>
                      <p style="margin: 0;">You might want to charge your PC</p>
                    </div>
                  </div>
                </div>
              `;
              
              desktop.appendChild(warningWindow);
              
              // Make window draggable
              const titleBar = warningWindow.querySelector('.window-title-bar');
              let isDragging = false;
              let currentX;
              let currentY;
              let initialX;
              let initialY;
              let xOffset = 0;
              let yOffset = 0;

              titleBar.addEventListener('mousedown', dragStart);
              document.addEventListener('mousemove', drag);
              document.addEventListener('mouseup', dragEnd);

              function dragStart(e) {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
                if (e.target === titleBar || e.target.parentElement === titleBar) {
                  isDragging = true;
                }
              }

              function drag(e) {
                if (isDragging) {
                  e.preventDefault();
                  currentX = e.clientX - initialX;
                  currentY = e.clientY - initialY;
                  xOffset = currentX;
                  yOffset = currentY;
                  warningWindow.style.transform = `translate(${currentX}px, ${currentY}px)`;
                }
              }

              function dragEnd() {
                isDragging = false;
              }

              // Add close button functionality
              warningWindow.querySelector('.close').addEventListener('click', () => {
                warningWindow.remove();
              });

              // Add show animation
              requestAnimationFrame(() => {
                warningWindow.classList.add('show');
              });
            }
          }
          
          // Update charging status
          if (battery.charging) {
            batteryIcon.classList.add('charging');
          } else {
            batteryIcon.classList.remove('charging');
          }
        }

        // Update battery status initially
        updateAllBatteryInfo();

        // Add event listeners for battery status changes
        battery.addEventListener('levelchange', updateAllBatteryInfo);
        battery.addEventListener('chargingchange', updateAllBatteryInfo);
      });
    } else {
      // Fallback for browsers that don't support the Battery API
      const batteryIndicator = document.querySelector('.battery-indicator');
      batteryIndicator.style.display = 'none';
    }
  }

  updateBattery();

  // Taskbar icon hover effect
  const taskbarIcons = document.querySelectorAll('.taskbar-icon');
  taskbarIcons.forEach(icon => {
    icon.addEventListener('mouseenter', () => {
      icon.style.backgroundColor = '#333';
    });
    icon.addEventListener('mouseleave', () => {
      icon.style.backgroundColor = 'transparent';
    });
  });

  // Window management system
  let zIndex = 1000;
  const appWindows = new Map();

  function initializeResizeObserver(windowEl) {
    try {
      const resizeObserver = new ResizeObserver((entries) => {
        try {
          if (!entries || !entries.length) return;
          
          window.requestAnimationFrame(() => {
            for (let entry of entries) {
              if (!entry.target.isConnected) continue;
              
              const width = entry.contentRect.width;
              const height = entry.contentRect.height;
              
              const browserFrame = entry.target.querySelector('.browser-frame');
              if (browserFrame) {
                browserFrame.style.width = '100%';
                browserFrame.style.height = `${height - 80}px`; // Adjust for toolbar
              }
            }
          });
        } catch (err) {
          console.warn('ResizeObserver callback error:', err);
        }
      });

      resizeObserver.observe(windowEl);

      // Cleanup observer when window is closed
      windowEl.addEventListener('remove', () => {
        try {
          resizeObserver.disconnect();
        } catch (err) {
          console.warn('ResizeObserver disconnect error:', err);
        }
      });
    } catch (err) {
      console.warn('ResizeObserver initialization error:', err);
    }
  }

  function createWindow(appName, content) {
    const windowEl = document.createElement('div');
    windowEl.className = 'app-window';
    windowEl.style.zIndex = ++zIndex;

    // Add taskbar icon animation and indicator
    const taskbarIconsContainer = document.querySelector('.icons');
    const existingIcon = document.getElementById(`taskbar-${appName.toLowerCase().replace(/\s+/g, '-')}`);
    
    let taskbarIcon;
    if (!existingIcon) {
      taskbarIcon = document.createElement('div');
      taskbarIcon.className = 'taskbar-icon bounce';
      taskbarIcon.id = `taskbar-${appName.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Get appropriate icon based on app name
      let iconContent = '';
      switch(appName) {
        case 'Chrome':
          iconContent = '<img src="/Google_Chrome_icon_(September_2014).svg.png" alt="Chrome">';
          break;
        case 'Edge':
          iconContent = `<svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M21.86 11.16c-.08-.52-.3-1-.67-1.37-.37-.37-.86-.59-1.37-.67-.96-.15-1.92.15-2.64.86l-7.36 7.36c-.71.71-1.01 1.68-.86 2.64.08.51.3 1 .67 1.37.37.37.86.59 1.37.67.96.15 1.92-.15 2.64-.86l7.36-7.36c.71-.72 1.01-1.68.86-2.64z"/>
          </svg>`;
          break;
        case 'YouTube':
          iconContent = '<img src="/YouTube_icon_2015.svg" alt="YouTube">';
          break;
        case 'This PC':
          iconContent = '<img src="/thumb_14339670430This_PC__1_-removebg-preview.png" alt="This PC">';
          break;
        case 'Task Manager':
          iconContent = `<svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M13,7H19V9H13V7M13,11H19V13H13V11M13,15H19V17H13V15M5,7H11V9H5V7M5,11H11V13H5V11M5,15H11V17H5V15Z"/>
          </svg>`;
          break;
        case 'Wallpaper':
          iconContent = `<svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,3.89 20.1,3 19,3Z"/>
          </svg>`;
          break;
        case 'Calculator':
          iconContent = `<svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
          </svg>`;
          break;
        case 'Mail':
          iconContent = `<svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"/>
          </svg>`;
          break;
        case 'Settings':
          iconContent = `<svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
          </svg>`;
          break;
        default:
          iconContent = `<svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="white" d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z"/>
          </svg>`;
      }
      
      taskbarIcon.innerHTML = iconContent;
      taskbarIconsContainer.appendChild(taskbarIcon);

      // Add click handler to bring window to front
      taskbarIcon.addEventListener('click', () => {
        if (windowEl.style.display === 'none') {
          windowEl.style.display = 'flex';
          windowEl.classList.add('show');
          taskbarIcon.classList.add('active');
        } else {
          windowEl.classList.remove('show');
          windowEl.classList.add('closing');
          setTimeout(() => {
            windowEl.style.display = 'none';
            windowEl.classList.remove('closing');
          }, 200);
          taskbarIcon.classList.remove('active');
        }
        windowEl.style.zIndex = ++zIndex;
      });

      // Remove bounce animation after it completes
      setTimeout(() => {
        taskbarIcon.classList.remove('bounce');
      }, 500);
    } else {
      taskbarIcon = existingIcon;
      taskbarIcon.classList.add('bounce');
      setTimeout(() => {
        taskbarIcon.classList.remove('bounce');
      }, 500);
    }

    // Add active indicator
    taskbarIcon.classList.add('active');

    initializeResizeObserver(windowEl);

    const titleBar = document.createElement('div');
    titleBar.className = 'window-title-bar';
    
    const title = document.createElement('div');
    title.className = 'window-title';
    title.textContent = appName;

    const controls = document.createElement('div');
    controls.className = 'window-controls';
    controls.innerHTML = `
      <button class="minimize">−</button>
      <button class="maximize">□</button>
      <button class="close">×</button>
    `;

    titleBar.appendChild(title);
    titleBar.appendChild(controls);
    windowEl.appendChild(titleBar);

    const windowContent = document.createElement('div');
    windowContent.className = 'window-content';
    windowContent.innerHTML = content;
    windowEl.appendChild(windowContent);

    // Make window draggable
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 100;
    let yOffset = 100;

    titleBar.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      if (e.target === titleBar || e.target === title) {
        isDragging = true;
        windowEl.style.zIndex = ++zIndex;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        windowEl.style.transform = `translate(${currentX}px, ${currentY}px)`;
      }
    }

    function dragEnd() {
      isDragging = false;
    }

    // Window controls
    controls.querySelector('.close').addEventListener('click', () => {
      windowEl.classList.remove('show');
      windowEl.classList.add('closing');
      setTimeout(() => {
        windowEl.remove();
        appWindows.delete(appName);
        const taskbarIcon = document.getElementById(`taskbar-${appName.toLowerCase().replace(/\s+/g, '-')}`);
        if (taskbarIcon) {
          taskbarIcon.remove();
        }
      }, 200);
    });

    controls.querySelector('.minimize').addEventListener('click', () => {
      windowEl.classList.remove('show');
      windowEl.classList.add('closing');
      setTimeout(() => {
        windowEl.style.display = 'none';
        windowEl.classList.remove('closing');
      }, 200);
      taskbarIcon.classList.remove('active');
    });

    windowEl.addEventListener('click', () => {
      windowEl.style.zIndex = ++zIndex;
    });

    // Add maximize functionality
    controls.querySelector('.maximize').addEventListener('click', () => {
      if (windowEl.classList.contains('maximized')) {
        // Restore to previous size
        windowEl.classList.remove('maximized');
        windowEl.style.width = '';
        windowEl.style.height = '';
        windowEl.style.top = '';
        windowEl.style.left = '';
        windowEl.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        windowEl.style.borderRadius = '6px';
      } else {
        // Save current position
        const rect = windowEl.getBoundingClientRect();
        xOffset = rect.left;
        yOffset = rect.top;
        
        // Maximize
        windowEl.classList.add('maximized');
        windowEl.style.width = '100vw';
        windowEl.style.height = 'calc(100vh - 40px)'; // Account for taskbar
        windowEl.style.top = '0';
        windowEl.style.left = '0';
        windowEl.style.transform = 'none';
        windowEl.style.borderRadius = '0';
      }
    });

    // Add browser navigation functionality for Chrome and Edge
    if (appName === 'Chrome' || appName === 'Edge') {
      const urlInput = windowEl.querySelector('.url-input');
      const browserFrame = windowEl.querySelector('.browser-frame');
      const backBtn = windowEl.querySelector('.back');
      const forwardBtn = windowEl.querySelector('.forward');
      const reloadBtn = windowEl.querySelector('.reload');

      let history = [];
      let currentIndex = -1;

      urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          let url = urlInput.value;
          
          // Handle search vs URL
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (!url.includes('.')) {
              // It's a search query
              url = appName === 'Chrome' 
                ? `https://www.google.com/search?q=${encodeURIComponent(url)}`
                : `https://www.bing.com/search?q=${encodeURIComponent(url)}`;
            } else {
              // It's a URL without protocol
              url = 'https://' + url;
            }
          }

          browserFrame.src = url;
          history = history.slice(0, currentIndex + 1);
          history.push(url);
          currentIndex++;
          updateNavButtons();
        }
      });

      backBtn.addEventListener('click', () => {
        if (currentIndex > 0) {
          currentIndex--;
          browserFrame.src = history[currentIndex];
          updateNavButtons();
        }
      });

      forwardBtn.addEventListener('click', () => {
        if (currentIndex < history.length - 1) {
          currentIndex++;
          browserFrame.src = history[currentIndex];
          updateNavButtons();
        }
      });

      reloadBtn.addEventListener('click', () => {
        browserFrame.src = browserFrame.src;
      });

      function updateNavButtons() {
        backBtn.disabled = currentIndex <= 0;
        forwardBtn.disabled = currentIndex >= history.length - 1;
        urlInput.value = history[currentIndex] || '';
      }

      // Initialize history with starting page
      history.push(browserFrame.src);
      currentIndex = 0;
      updateNavButtons();
    }

    if (appName === 'Wallpaper') {
      setTimeout(() => {
        handleWallpaperSelect();
      }, 100);
    }

    // Show window with animation
    desktop.appendChild(windowEl);
    requestAnimationFrame(() => {
      windowEl.classList.add('show');
    });

    appWindows.set(appName, windowEl);
    return windowEl;
  }

  function handleWallpaperSelect() {
    const wallpaperOptions = document.querySelectorAll('.wallpaper-option');
    wallpaperOptions.forEach(option => {
      option.addEventListener('click', () => {
        const wallpaperUrl = option.dataset.wallpaper;
        const desktop = document.querySelector('.desktop');
        desktop.style.backgroundImage = `url('${wallpaperUrl}')`;
        
        wallpaperOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');

        const lockScreen = document.querySelector('.lock-screen');
        if (lockScreen) {
          lockScreen.style.backgroundImage = `url('${wallpaperUrl}')`;
        }
      });
    });
  }

  // App content templates
  const appContent = {
    'Chrome': `<div class="edge-app">
      <div class="edge-toolbar">
        <button class="nav-button back" disabled>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
          </svg>
        </button>
        <button class="nav-button forward" disabled>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
          </svg>
        </button>
        <button class="nav-button reload">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
          </svg>
        </button>
        <div class="edge-address-bar">
          <input type="text" class="url-input" placeholder="Search Google or enter a URL">
        </div>
      </div>
      <div class="edge-content">
        <iframe class="browser-frame" src="https://www.google.com/search?igu=1" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
      </div>
    </div>`,
    'Edge': `<div class="edge-app">
      <div class="edge-toolbar">
        <button class="nav-button back" disabled>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
          </svg>
        </button>
        <button class="nav-button forward" disabled>
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
          </svg>
        </button>
        <button class="nav-button reload">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="#666" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
          </svg>
        </button>
        <div class="edge-address-bar">
          <input type="text" class="url-input" placeholder="Search with Bing or enter a URL">
        </div>
      </div>
      <div class="edge-content">
        <iframe class="browser-frame" src="https://www.bing.com" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
      </div>
    </div>`,
    'Mail': `<div class="mail-app">
      <div class="sidebar">
        <div class="folder">Inbox</div>
        <div class="folder">Sent</div>
        <div class="folder">Drafts</div>
      </div>
      <div class="mail-content">
        <h3>Welcome to Mail</h3>
        <p>Select a folder to view messages</p>
      </div>
    </div>`,
    'Calendar': `<div class="calendar-app">
      <h3>Calendar</h3>
      <div class="calendar-grid">
        <div class="calendar-header">
          May 2024
        </div>
        <div class="calendar-days">
          <!-- Calendar grid would go here -->
          <div class="day">1</div>
          <div class="day">2</div>
          <div class="day">3</div>
          <!-- ... more days ... -->
        </div>
      </div>
    </div>`,
    'Photos': `<div class="photos-app">
      <h3>Photos</h3>
      <div class="photo-grid">
        <div class="empty-state">
          No photos available
        </div>
      </div>
    </div>`,
    'Microsoft Store': `<div class="store-app">
      <h3>Microsoft Store</h3>
      <div class="featured">
        <h4>Featured Apps</h4>
        <div class="app-grid">
          <div class="store-app-card">Coming soon...</div>
        </div>
      </div>
    </div>`,
    'Settings': `<div class="settings-app">
      <div class="settings-sidebar">
        <div class="setting-item">System</div>
        <div class="setting-item">Personalization</div>
        <div class="setting-item">Network</div>
      </div>
      <div class="settings-content">
        <h3>Settings</h3>
        <p>Select a category to begin</p>
      </div>
    </div>`,
    'Calculator': `<div class="calculator-app">
      <div class="calc-display">0</div>
      <div class="calc-buttons">
        <button>7</button>
        <button>8</button>
        <button>9</button>
        <button>÷</button>
        <button>4</button>
        <button>5</button>
        <button>6</button>
        <button>×</button>
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>-</button>
        <button>0</button>
        <button>.</button>
        <button>=</button>
        <button>+</button>
      </div>
    </div>`,
    'This PC': `
      <div style="padding: 20px;">
        <h3>This PC</h3>
        <div style="margin-top: 20px;">
          <div style="margin-bottom: 15px;">
            <strong>Devices and drives</strong>
          </div>
          <div style="display: flex; gap: 20px;">
            <div style="text-align: center;">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <path fill="#0078D7" d="M19,16H5V8H19M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z"/>
              </svg>
              <div>Local Disk (C:)</div>
              <small>237 GB free of 476 GB</small>
            </div>
          </div>
        </div>
        <div style="margin-top: 30px;">
          <div style="margin-bottom: 15px;">
            <strong>Network locations</strong>
          </div>
          <div>No network locations available</div>
        </div>
      </div>
    `,
    'Wallpaper': `
      <div class="wallpaper-app">
        <div class="wallpaper-grid">
          <div class="wallpaper-option" data-wallpaper="/wp14828648-windows-10-wallpapers.webp">
            <img src="/wp14828648-windows-10-wallpapers.webp" alt="Default Windows">
            <div class="wallpaper-name">Default Blue</div>
          </div>
          <div class="wallpaper-option" data-wallpaper="/wp2543305-microsoft-windows-10-wallpapers.jpg">
            <img src="/wp2543305-microsoft-windows-10-wallpapers.jpg" alt="Sea Cave">
            <div class="wallpaper-name">Sea Cave</div>
          </div>
          <div class="wallpaper-option" data-wallpaper="/Windows10bgW.jpg">
            <img src="/Windows10bgW.jpg" alt="Windows 10">
            <div class="wallpaper-name">Windows Logo</div>
          </div>
          <div class="wallpaper-option" data-wallpaper="/wp1809082-windows-10-wallpapers.jpg">
            <img src="/wp1809082-windows-10-wallpapers.jpg" alt="Windows 10 2015">
            <div class="wallpaper-name">Windows 2015</div>
          </div>
        </div>
      </div>
    `,
    'YouTube': `
    <div class="youtube-app">
      <div class="youtube-header">
        <img src="/download (17).jpeg" alt="YouTube" class="youtube-logo">
        <div class="youtube-search">
          <input type="text" placeholder="Search">
          <button>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#606060" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
        <div class="youtube-upload">
          <img src="/Upload.png" alt="Upload">
          Upload
        </div>
      </div>
      <div class="youtube-content">
        <div class="youtube-sidebar">
          <div class="youtube-menu-item active">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M13.5,7H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20V7M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
            </svg>
            Home
          </div>
          <div class="youtube-menu-item">
            <svg viewBox="0 0 24 24">
              <path fill="currentColor" d="M17.53 11.2c-.23-.3-.5-.56-.76-.82-.65-.6-1.4-1.03-2.03-1.66-1.46-1.46-1.78-3.87-.85-5.72-.9.23-1.75.75-2.45 1.32C8.9 6.4 7.9 10.07 9.1 13.22c.04.1.08.2.08.33 0 .22-.15.42-.35.5-.22.1-.46.04-.64-.12-.06-.05-.1-.1-.15-.17-1.1-1.43-1.28-3.48-.53-5.12C5.87 10 5 12.3 5.12 14.47c.04.5.1 1 .27 1.5.14.6.4 1.2.72 1.73 1.04 1.73 2.87 2.97 4.84 3.22 2.1.27 4.35-.12 5.96-1.6 1.8-1.66 2.45-4.3 1.5-6.6l-.13-.26c-.2-.45-.47-.87-.78-1.25zm-3.1 6.3c-.28.24-.73.5-1.08.6-1.1.38-2.2-.16-2.88-.82 1.2-.28 1.9-1.16 2.1-2.05.17-.8-.14-1.46-.27-2.23-.12-.74-.1-1.37.2-2.06.15.38.35.76.58 1.06.76 1 1.95 1.44 2.2 2.8.04.14.06.28.06.43.03.82-.32 1.72-.92 2.26z"/>
        </svg>
        Trending
      </div>
      <div class="youtube-menu-item">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M13.5,7H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20V7M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
        </svg>
        Subscriptions
      </div>
      <div class="youtube-menu-item">
        <svg viewBox="0 0 24 24">
          <path fill="currentColor" d="M17.53 11.2c-.23-.3-.5-.56-.76-.82-.65-.6-1.4-1.03-2.03-1.66-1.46-1.46-1.78-3.87-.85-5.72-.9.23-1.75.75-2.45 1.32C8.9 6.4 7.9 10.07 9.1 13.22c.04.1.08.2.08.33 0 .22-.15.42-.35.5-.22.1-.46.04-.64-.12-.06-.05-.1-.1-.15-.17-1.1-1.43-1.28-3.48-.53-5.12C5.87 10 5 12.3 5.12 14.47c.04.5.1 1 .27 1.5.14.6.4 1.2.72 1.73 1.04 1.73 2.87 2.97 4.84 3.22 2.1.27 4.35-.12 5.96-1.6 1.8-1.66 2.45-4.3 1.5-6.6l-.13-.26c-.2-.45-.47-.87-.78-1.25zm-3.1 6.3c-.28.24-.73.5-1.08.6-1.1.38-2.2-.16-2.88-.82 1.2-.28 1.9-1.16 2.1-2.05.17-.8-.14-1.46-.27-2.23-.12-.74-.1-1.37.2-2.06.15.38.35.76.58 1.06.76 1 1.95 1.44 2.2 2.8.04.14.06.28.06.43.03.82-.32 1.72-.92 2.26z"/>
      </svg>
      Library
    </div>
  </div>
  <div class="youtube-main">
    <div style="text-align: center; color: #606060; padding: 40px;">
      <img src="/BouYute logo with color.png" alt="BouYute" style="width: 200px; margin-bottom: 20px;">
      <h2>Welcome to YouTube!</h2>
      <p>Sign in to see your personalized content</p>
      <img src="/link_signup.gif" alt="Sign up" style="margin: 20px auto;">
      <br>
      <img src="/IMG_2525.jpeg" alt="Subscribe" style="width: 120px;">
    </div>
  </div>
</div>
`,
    'Task Manager': `
    <div class="task-manager-app">
      <div class="task-manager-tabs">
        <div class="tab active" data-tab="processes">Processes</div>
        <div class="tab" data-tab="performance">Performance</div>
      </div>
      <div class="tab-content processes active">
        <div class="process-header">
          <div class="process-name">Name</div>
          <div class="process-cpu">CPU</div>
          <div class="process-memory">Memory</div>
          <div class="process-disk">Disk</div>
          <div class="process-network">Network</div>
        </div>
        <div class="process-list">
          <div class="process-item">
            <div class="process-name">System Idle Process</div>
            <div class="process-cpu">0%</div>
            <div class="process-memory">0.1 MB</div>
            <div class="process-disk">0 MB/s</div>
            <div class="process-network">0 Mbps</div>
          </div>
          <div class="process-item">
            <div class="process-name">System</div>
            <div class="process-cpu">0.1%</div>
            <div class="process-memory">8.5 MB</div>
            <div class="process-disk">0.1 MB/s</div>
            <div class="process-network">0.1 Mbps</div>
          </div>
          <div class="process-item running">
            <div class="process-name">Chrome.exe</div>
            <div class="process-cpu">12%</div>
            <div class="process-memory">325 MB</div>
            <div class="process-disk">1.2 MB/s</div>
            <div class="process-network">2.4 Mbps</div>
          </div>
          <div class="process-item running">
            <div class="process-name">Edge.exe</div>
            <div class="process-cpu">8%</div>
            <div class="process-memory">245 MB</div>
            <div class="process-disk">0.8 MB/s</div>
            <div class="process-network">1.6 Mbps</div>
          </div>
        </div>
      </div>
      <div class="tab-content performance">
        <div class="performance-grid">
          <div class="performance-card">
            <div class="card-header">CPU</div>
            <div class="usage-chart">
              <div class="chart-bar" style="height: 30%"></div>
            </div>
            <div class="usage-text">30% Utilization</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Memory</div>
            <div class="usage-chart">
              <div class="chart-bar" style="height: 45%"></div>
            </div>
            <div class="usage-text">3.2/8.0 GB (45%)</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Disk</div>
            <div class="usage-chart">
              <div class="chart-bar" style="height: 15%"></div>
            </div>
            <div class="usage-text">15% Active time</div>
          </div>
          <div class="performance-card">
            <div class="card-header">Network</div>
            <div class="usage-chart">
              <div class="chart-bar" style="height: 25%"></div>
            </div>
            <div class="usage-text">25 Mbps</div>
          </div>
        </div>
      </div>
    </div>
  `,
    'Word': `
      <div class="word-app">
        <div class="word-toolbar">
          <div class="word-menu-bar">
            <div class="menu-item">File</div>
            <div class="menu-item">Home</div>
            <div class="menu-item">Insert</div>
            <div class="menu-item">Layout</div>
            <div class="menu-item">References</div>
            <div class="menu-item">Review</div>
            <div class="menu-item">View</div>
            <div class="menu-item">Help</div>
          </div>
          <div class="formatting-toolbar">
            <select class="font-select">
              <option>Calibri</option>
              <option>Arial</option>
              <option>Times New Roman</option>
            </select>
            <select class="font-size">
              <option>11</option>
              <option>12</option>
              <option>14</option>
              <option>16</option>
            </select>
            <button class="format-btn">B</button>
            <button class="format-btn">I</button>
            <button class="format-btn">U</button>
          </div>
        </div>
        <div class="word-content">
          <div class="document-page" contenteditable="true">
            <div class="default-text">Click here to start typing...</div>
          </div>
        </div>
      </div>
    `,
    'File Explorer': `
    <div style="height: 100%; display: flex; flex-direction: column;">
      <div style="padding: 10px; border-bottom: 1px solid #ddd;">
        <div style="display: flex; gap: 10px;">
          <button style="padding: 5px 10px; border: 1px solid #ddd; background: white; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="#666" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
            </svg>
          </button>
          <button style="padding: 5px 10px; border: 1px solid #ddd; background: white; cursor: pointer;">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="#666" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
            </svg>
          </button>
          <input type="text" value="This PC" style="flex: 1; padding: 5px 10px; border: 1px solid #ddd;">
        </div>
      </div>
      <div style="display: flex; flex: 1;">
        <div style="width: 200px; padding: 10px; border-right: 1px solid #ddd;">
          <div style="margin-bottom: 20px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Quick Access</div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 5px; cursor: pointer;">
              <img src="/file explorer.jpg" alt="File Explorer" style="width: 16px; height: 16px;">
              Desktop
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 5px; cursor: pointer;">
              <img src="/Videos-folder.webp" alt="Videos" style="width: 16px; height: 16px;">
              Videos
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 5px; cursor: pointer;">
              <img src="/Music Folder.png" alt="Music" style="width: 16px; height: 16px;">
              Music
            </div>
          </div>
          <div>
            <div style="font-weight: bold; margin-bottom: 10px;">This PC</div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 5px; cursor: pointer;">
              <img src="/File2.png" alt="Documents" style="width: 16px; height: 16px;">
              Documents
            </div>
            <div style="display: flex; align-items: center; gap: 10px; padding: 5px; cursor: pointer;">
              <img src="/FIle.png" alt="Downloads" style="width: 16px; height: 16px;">
              Downloads
            </div>
          </div>
        </div>
        <div style="flex: 1; padding: 20px;">
          <div style="margin-bottom: 20px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Folders</div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 20px;">
              <div style="text-align: center; cursor: pointer;">
                <img src="/File2.png" alt="Documents" style="width: 48px; height: 48px; margin-bottom: 5px;">
                <div>Documents</div>
              </div>
              <div style="text-align: center; cursor: pointer;">
                <img src="/FIle.png" alt="Downloads" style="width: 48px; height: 48px; margin-bottom: 5px;">
                <div>Downloads</div>
              </div>
              <div style="text-align: center; cursor: pointer;">
                <img src="/Videos-folder.webp" alt="Videos" style="width: 48px; height: 48px; margin-bottom: 5px;">
                <div>Videos</div>
              </div>
              <div style="text-align: center; cursor: pointer;">
                <img src="/Music Folder.png" alt="Music" style="width: 48px; height: 48px; margin-bottom: 5px;">
                <div>Music</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  };

  appContent['Microsoft Edge'] = `<div class="edge-app">
  <div class="edge-toolbar">
    <button class="nav-button back" disabled>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#666" d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z"/>
      </svg>
    </button>
    <button class="nav-button forward" disabled>
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#666" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
      </svg>
    </button>
    <button class="nav-button reload">
      <svg viewBox="0 0 24 24" width="20" height="20">
        <path fill="#666" d="M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z"/>
      </svg>
    </button>
    <div class="edge-address-bar">
      <input type="text" class="url-input" placeholder="Search with Bing or enter a URL">
    </div>
  </div>
  <div class="edge-content">
    <iframe class="browser-frame" src="https://www.bing.com" sandbox="allow-same-origin allow-scripts allow-forms"></iframe>
  </div>
</div>`;

  appContent['MS Paint'] = `
    <div class="paint-app">
      <div class="paint-toolbar">
        <div class="tool-group">
          <button class="paint-tool" data-tool="pencil">
            <svg viewBox="0 0 24 24">
              <path fill="#666" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
            </svg>
          </button>
          <button class="paint-tool" data-tool="eraser">
            <svg viewBox="0 0 24 24">
              <path fill="#666" d="M16.24,3.56L21.19,8.5C21.97,9.29 21.97,10.55 21.19,11.34L12,20.53C10.44,22.09 7.91,22.09 6.34,20.53L2.81,17C2.03,16.21 2.03,14.95 2.81,14.16L13.41,3.56C14.2,2.78 15.46,2.78 16.24,3.56M4.22,15.58L7.76,19.11C8.54,19.9 9.8,19.9 10.59,19.11L14.12,15.58L9.17,10.63L4.22,15.58Z"/>
            </svg>
          </button>
          <button class="paint-tool" data-tool="fill">
            <svg viewBox="0 0 24 24">
              <path fill="#666" d="M19,11.5C19,11.5 17,13.67 17,15A2,2 0 0,0 19,17A2,2 0 0,0 21,15C21,13.67 19,11.5 19,11.5M5.21,10L10,5.21L14.79,10M16.56,8.94L7.62,0L6.21,1.41L8.59,3.79L3.44,8.94C2.85,9.5 2.85,10.47 3.44,11.06L8.94,16.56C9.23,16.85 9.62,17 10,17C10.38,17 10.77,16.85 11.06,16.56L16.56,11.06C17.15,10.47 17.15,9.5 16.56,8.94Z"/>
          </svg>
        </button>
      </div>
      <div class="color-picker">
        <div class="color" style="background: #000000"></div>
        <div class="color" style="background: #ff0000"></div>
        <div class="color" style="background: #00ff00"></div>
        <div class="color" style="background: #0000ff"></div>
        <div class="color" style="background: #ffff00"></div>
      </div>
    </div>
    <canvas class="paint-canvas"></canvas>
  `;

  // Function to handle double-click on desktop icons
  function handleDesktopIconDoubleClick(appName) {
    if (!appWindows.has(appName)) {
      createWindow(appName, appContent[appName]);
    } else {
      const window = appWindows.get(appName);
      window.style.display = 'block';
      window.style.zIndex = ++zIndex;
    }
  }

  document.getElementById('chrome').addEventListener('click', () => {
    if (!appWindows.has('Chrome')) {
      createWindow('Chrome', appContent['Chrome']);
    } else {
      const window = appWindows.get('Chrome');
      window.style.display = 'block';
      window.style.zIndex = ++zIndex;
    }
  });

  document.getElementById('edge').addEventListener('click', () => {
    if (!appWindows.has('Edge')) {
      createWindow('Edge', appContent['Edge']);
    } else {
      const window = appWindows.get('Edge');
      window.style.display = 'block';
      window.style.zIndex = ++zIndex;
    }
  });

  // Add after the start button event listener
  document.querySelector('.cortana').addEventListener('click', () => {
    const existingWindow = appWindows.get('Cortana');
    if (existingWindow) {
      existingWindow.style.display = 'block';
      existingWindow.style.zIndex = ++zIndex;
      return;
    }

    const content = `
      <div style="padding: 20px; text-align: center;">
        <svg viewBox="0 0 24 24" style="width: 48px; height: 48px;">
          <circle cx="12" cy="12" r="10" fill="#0078D7"/>
        </svg>
        <h2 style="margin: 20px 0;">Hi! I'm Cortana</h2>
        <p style="color: #666;">Please sign in to your Microsoft account to use Cortana.</p>
        <button class="login-button" style="margin-top: 20px;">Sign in</button>
      </div>
    `;
    
    createWindow('Cortana', content);
  });

  // Add desktop icon double-click handlers after DOM load
  document.querySelector('.desktop-icon').addEventListener('dblclick', () => {
    handleDesktopIconDoubleClick('This PC');
  });

  // Add click handlers to tiles
  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const appName = tile.textContent.trim();
      if (!appWindows.has(appName)) {
        createWindow(appName, appContent[appName]);
      } else {
        const window = appWindows.get(appName);
        window.style.display = 'block';
        window.style.zIndex = ++zIndex;
      }
      startMenu.classList.remove('show');
    });
  });

  const startTiles = document.querySelector('.start-tiles');
  const paintTile = document.createElement('div');
  paintTile.className = 'tile';
  paintTile.innerHTML = `
    <img src="/MSPaint.png" alt="MS Paint" style="width: 24px; height: 24px;">
    MS Paint
  `;
  startTiles.appendChild(paintTile);

  paintTile.addEventListener('click', () => {
    if (!appWindows.has('MS Paint')) {
      const window = createWindow('MS Paint', appContent['MS Paint']);
      initPaint(window);
    } else {
      const window = appWindows.get('MS Paint');
      window.style.display = 'block';
      window.style.zIndex = ++zIndex;
    }
    startMenu.classList.remove('show');
  });

  function initPaint(window) {
    const canvas = window.querySelector('.paint-canvas');
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'pencil';
    let currentColor = '#000000';

    function resizeCanvas() {
      const content = window.querySelector('.window-content');
      canvas.width = content.clientWidth;
      canvas.height = content.clientHeight - 40; // Account for toolbar
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    function startDrawing(e) {
      isDrawing = true;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    }

    function draw(e) {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (currentTool === 'pencil') {
        ctx.lineTo(x, y);
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();
      } else if (currentTool === 'eraser') {
        ctx.clearRect(x - 10, y - 10, 20, 20);
      }
    }

    function stopDrawing() {
      isDrawing = false;
    }

    const tools = window.querySelectorAll('.paint-tool');
    tools.forEach(tool => {
      tool.addEventListener('click', () => {
        tools.forEach(t => t.classList.remove('active'));
        tool.classList.add('active');
        currentTool = tool.dataset.tool;
      });
    });

    const colors = window.querySelectorAll('.color');
    colors.forEach(color => {
      color.addEventListener('click', () => {
        colors.forEach(c => c.classList.remove('active'));
        color.classList.add('active');
        currentColor = color.style.backgroundColor;
      });
    });
  }

  // Power functionality with enhanced animations and loading GIF
  document.getElementById('shutdown').addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0078D7';
    overlay.style.zIndex = '10000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 2s ease-in';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.gap = '20px';
    overlay.style.cursor = 'none';
    document.body.appendChild(overlay);

    const powerAnimation = document.createElement('div');
    powerAnimation.innerHTML = `
      <img src="/windows-loandig-cargando.gif" alt="Windows Loading" style="width: 50px; height: 50px;">
      <div style="color: white; font-family: 'Segoe UI'; margin-top: 20px; text-align: center;">
        Shutting down...
      </div>
    `;
    overlay.appendChild(powerAnimation);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => {
        document.body.style.backgroundColor = 'black';
        overlay.remove();
      }, 3000);
    });
  });

  document.getElementById('restart').addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0078D7';
    overlay.style.zIndex = '10000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 1s ease-in';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.gap = '20px';
    overlay.style.cursor = 'none';
    document.body.appendChild(overlay);

    const powerAnimation = document.createElement('div');
    powerAnimation.innerHTML = `
      <img src="/windows-loandig-cargando.gif" alt="Windows Loading" style="width: 50px; height: 50px;">
      <div style="color: white; font-family: 'Segoe UI'; margin-top: 20px; text-align: center;">
        Restarting...
      </div>
    `;
    overlay.appendChild(powerAnimation);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => {
        location.reload();
      }, 2000);
    });
  });

  document.getElementById('sleep').addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = '#0078D7';
    overlay.style.zIndex = '10000';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 1s ease-in';
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'column';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.gap = '20px';
    overlay.style.cursor = 'none';
    document.body.appendChild(overlay);

    const powerAnimation = document.createElement('div');
    powerAnimation.innerHTML = `
      <img src="/windows-loandig-cargando.gif" alt="Windows Loading" style="width: 50px; height: 50px;">
      <div style="color: white; font-family: 'Segoe UI'; margin-top: 20px; text-align: center;">
        Going to sleep...
      </div>
    `;
    overlay.appendChild(powerAnimation);

    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      setTimeout(() => {
        const wakeUp = () => {
          overlay.style.opacity = '0';
          setTimeout(() => {
            overlay.remove();
          }, 1000);
          document.removeEventListener('click', wakeUp);
          document.removeEventListener('keydown', wakeUp);
        };
        document.addEventListener('click', wakeUp);
        document.addEventListener('keydown', wakeUp);
      }, 2000);
    });
  });

  // Task View functionality
  const taskViewButton = document.querySelector('.task-view');
  const taskViewOverlay = document.querySelector('.task-view-overlay');
  const taskViewGrid = document.querySelector('.task-view-grid');
  const newDesktopBtn = document.querySelector('.new-desktop-btn');

  taskViewButton.addEventListener('click', () => {
    updateTaskView();
    taskViewOverlay.classList.add('show');
  });

  taskViewOverlay.addEventListener('click', (e) => {
    if (!newDesktopBtn.contains(e.target) && !taskViewGrid.contains(e.target)) {
      taskViewOverlay.classList.remove('show');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && taskViewOverlay.classList.contains('show')) {
      taskViewOverlay.classList.remove('show');
    }
  });

  function updateTaskView() {
    taskViewGrid.innerHTML = '';
    
    // Get all open windows
    const windows = document.querySelectorAll('.app-window');
    
    windows.forEach(window => {
      if (window.style.display !== 'none') {
        const preview = document.createElement('div');
        preview.className = 'task-preview';
        
        const header = document.createElement('div');
        header.className = 'task-preview-header';
        
        const title = window.querySelector('.window-title').textContent;
        header.innerHTML = `
          <span>${title}</span>
          <button class="task-preview-close">×</button>
        `;
        
        const content = document.createElement('div');
        content.className = 'task-preview-content';
        
        // Create a preview of the window content
        const windowContent = window.querySelector('.window-content').cloneNode(true);
        content.appendChild(windowContent);
        
        preview.appendChild(header);
        preview.appendChild(content);
        
        // Click handler to focus window
        preview.addEventListener('click', (e) => {
          if (!e.target.classList.contains('task-preview-close')) {
            window.style.display = 'flex';
            window.style.zIndex = ++zIndex;
            taskViewOverlay.classList.remove('show');
          }
        });
        
        // Close button handler
        preview.querySelector('.task-preview-close').addEventListener('click', () => {
          window.remove();
          appWindows.delete(title);
          const taskbarIcon = document.getElementById(`taskbar-${title.toLowerCase().replace(/\s+/g, '-')}`);
          if (taskbarIcon) {
            taskbarIcon.remove();
          }
          preview.remove();
        });
        
        taskViewGrid.appendChild(preview);
      }
    });
  }

  newDesktopBtn.addEventListener('click', () => {
    // Placeholder for multiple desktop functionality
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '80px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.background = 'rgba(0,0,0,0.8)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.zIndex = '10000';
    notification.textContent = 'Multiple desktops coming soon!';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2000);
  });

  // Search functionality
  const searchInput = document.querySelector('.search input');
  const searchResults = document.querySelector('.search-results');

  const searchData = [
    { name: 'Chrome', type: 'App', icon: '/Google_Chrome_icon_(September_2014).svg.png' },
    { name: 'Edge', type: 'App', icon: '/windows-loandig-cargando.gif' },
    { name: 'This PC', type: 'System', icon: '/thumb_14339670430This_PC__1_-removebg-preview.png' },
    { name: 'Settings', type: 'System', icon: '/Windows_logo_-_2012_(dark_blue).svg.png' },
    { name: 'Calculator', type: 'App', icon: '/Windows_logo_-_2012_(dark_blue).svg.png' },
    { name: 'Calendar', type: 'App', icon: '/Windows_logo_-_2012_(dark_blue).svg.png' },
    { name: 'Mail', type: 'App', icon: '/Windows_logo_-_2012_(dark_blue).svg.png' },
    { name: 'YouTube', type: 'App', icon: '/YouTube_icon_2015.svg' },
    { name: 'Task Manager', type: 'System', icon: '/Windows_logo_-_2012_(dark_blue).svg.png' },
    { name: 'Wallpaper', type: 'System', icon: '/Windows_logo_-_2012_(dark_blue).svg.png' },
    { name: 'Word', type: 'App', icon: '/Windows_logo_-_2012_(dark_blue).svg.png' },
    { name: 'File Explorer', type: 'System', icon: '/file explorer.jpg' },
  ];

  let searchTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    
    searchTimeout = setTimeout(() => {
      const query = e.target.value.toLowerCase();
      
      if (query.length === 0) {
        searchResults.classList.remove('show');
        return;
      }

      const filteredResults = searchData.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.type.toLowerCase().includes(query)
      );

      if (filteredResults.length > 0) {
        searchResults.innerHTML = filteredResults.map(item => `
          <div class="search-result-item" data-app="${item.name}">
            <img class="search-result-icon" src="${item.icon}" alt="${item.name}">
            <div class="search-result-text">
              <div>${item.name}</div>
              <div class="search-result-type">${item.type}</div>
            </div>
          </div>
        `).join('');
        
        searchResults.classList.add('show');

        document.querySelectorAll('.search-result-item').forEach(item => {
          item.addEventListener('click', () => {
            const appName = item.dataset.app;
            if (!appWindows.has(appName)) {
              createWindow(appName, appContent[appName]);
            } else {
              const window = appWindows.get(appName);
              window.style.display = 'block';
              window.style.zIndex = ++zIndex;
            }
            searchInput.value = '';
            searchResults.classList.remove('show');
          });
        });
      } else {
        searchResults.classList.remove('show');
      }
    }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('show');
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const errorWindow = document.createElement('div');
      errorWindow.className = 'app-window';
      errorWindow.style.zIndex = '1000';
      errorWindow.style.width = '400px';
      errorWindow.style.height = 'auto';
      
      errorWindow.innerHTML = `
        <div class="window-title-bar">
          <div class="window-title">Windows File Explorer</div>
          <div class="window-controls">
            <button class="close">×</button>
          </div>
        </div>
        <div class="window-content" style="padding: 20px;">
          <div style="display: flex; align-items: start; gap: 15px;">
            <svg viewBox="0 0 24 24" width="32" height="32" style="min-width: 32px;">
              <path fill="#ffd700" d="M12 2L1 21h22M12 6l7.53 13H4.47M11 10v4h2v-4m-2 6v2h2v-2"/>
            </svg>
            <div>
              <h3 style="margin: 0 0 10px 0;">Search Error</h3>
              <p style="margin: 0 0 15px 0;">Error Code: be2928193203832</p>
              <p style="margin: 0 0 15px 0;">The requested search cannot be completed because you are not signed in to your Microsoft account.</p>
              <button class="login-button" style="background: #0078D7; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Sign in</button>
            </div>
          </div>
        </div>
      `;
      
      desktop.appendChild(errorWindow);
      
      const titleBar = errorWindow.querySelector('.window-title-bar');
      let isDragging = false;
      let currentX;
      let currentY;
      let initialX;
      let initialY;
      let xOffset = 0;
      let yOffset = 0;

      titleBar.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);

      function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === titleBar || e.target.parentElement === titleBar) {
          isDragging = true;
        }
      }

      function drag(e) {
        if (isDragging) {
          e.preventDefault();
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
          xOffset = currentX;
          yOffset = currentY;
          errorWindow.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
      }

      function dragEnd() {
        isDragging = false;
      }

      errorWindow.querySelector('.close').addEventListener('click', () => {
        errorWindow.remove();
      });

      searchInput.value = '';
    }
  });

  document.getElementById('file-explorer').addEventListener('click', () => {
    if (!appWindows.has('File Explorer')) {
      createWindow('File Explorer', appContent['File Explorer']);
    } else {
      const window = appWindows.get('File Explorer');
      window.style.display = 'block';
      window.style.zIndex = ++zIndex;
    }
  });

  // Add to Start Menu tiles
  const taskManagerTile = document.createElement('div');
  taskManagerTile.className = 'tile';
  taskManagerTile.innerHTML = `
    <svg viewBox="0 0 24 24">
      <path fill="white" d="M3,3H21V21H3V3M13,7H19V9H13V7M13,11H19V13H13V11M13,15H19V17H13V15M5,7H11V9H5V7M5,11H11V13H5V11M5,15H11V17H5V15Z"/>
    </svg>
    Task Manager
  `;
  startTiles.appendChild(taskManagerTile);

  // Add click handler for Task Manager tile
  taskManagerTile.addEventListener('click', () => {
    if (!appWindows.has('Task Manager')) {
      const window = createWindow('Task Manager', appContent['Task Manager']);
      initTaskManager(window);
    } else {
      const window = appWindows.get('Task Manager');
      window.style.display = 'block';
      window.style.zIndex = ++zIndex;
    }
    startMenu.classList.remove('show');
  });

  function initTaskManager(window) {
    const tabs = window.querySelectorAll('.tab');
    const tabContents = window.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const tabName = tab.dataset.tab;
        window.querySelector(`.tab-content.${tabName}`).classList.add('active');
      });
    });

    // Simulate real-time updates for performance charts
    let cpuUsage = 30;
    let memoryUsage = 45;
    let diskUsage = 15;
    let networkUsage = 25;

    setInterval(() => {
      cpuUsage = Math.max(0, Math.min(100, cpuUsage + (Math.random() - 0.5) * 10));
      memoryUsage = Math.max(0, Math.min(100, memoryUsage + (Math.random() - 0.5) * 5));
      diskUsage = Math.max(0, Math.min(100, diskUsage + (Math.random() - 0.5) * 8));
      networkUsage = Math.max(0, Math.min(100, networkUsage + (Math.random() - 0.5) * 15));

      const charts = window.querySelectorAll('.chart-bar');
      charts[0].style.height = `${cpuUsage}%`;
      charts[1].style.height = `${memoryUsage}%`;
      charts[2].style.height = `${diskUsage}%`;
      charts[3].style.height = `${networkUsage}%`;

      const texts = window.querySelectorAll('.usage-text');
      texts[0].textContent = `${Math.round(cpuUsage)}% Utilization`;
      texts[1].textContent = `${(memoryUsage * 0.08).toFixed(1)}/8.0 GB (${Math.round(memoryUsage)}%)`;
      texts[2].textContent = `${Math.round(diskUsage)}% Active time`;
      texts[3].textContent = `${Math.round(networkUsage)} Mbps`;

      const processList = window.querySelector('.process-list');
      if (processList) {
        const processes = processList.querySelectorAll('.process-item.running');
        processes.forEach(process => {
          const cpu = process.querySelector('.process-cpu');
          const memory = process.querySelector('.process-memory');
          const disk = process.querySelector('.process-disk');
          const network = process.querySelector('.process-network');

          cpu.textContent = `${Math.round(Math.random() * 15)}%`;
          memory.textContent = `${Math.round(200 + Math.random() * 200)} MB`;
          disk.textContent = `${(Math.random() * 2).toFixed(1)} MB/s`;
          network.textContent = `${(Math.random() * 3).toFixed(1)} Mbps`;
        });
      }
    }, 1000);
  }

  const edgeDesktopIcon = document.getElementById('edge-desktop');
  if (edgeDesktopIcon) {
    edgeDesktopIcon.addEventListener('dblclick', () => {
      if (!appWindows.has('Microsoft Edge')) {
        createWindow('Microsoft Edge', appContent['Microsoft Edge']);
      } else {
        const window = appWindows.get('Microsoft Edge');
        window.style.display = 'block';
        window.style.zIndex = ++zIndex;
      }
    });
  }

  document.getElementById('store').addEventListener('click', () => {
    if (!appWindows.has('Microsoft Store')) {
      createWindow('Microsoft Store', appContent['Microsoft Store']);
    } else {
      const window = appWindows.get('Microsoft Store');
      window.style.display = 'block';
      window.style.zIndex = ++zIndex;
    }
  });
});