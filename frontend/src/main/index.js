import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import {spawn} from 'child_process'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import axios from "axios";
import path from 'path';
let pythonProcess;

// Enable verbose logging
app.commandLine.appendSwitch('enable-logging');
app.commandLine.appendSwitch('v', '1');
app.commandLine.appendSwitch('vmodule', 'console=1');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    title: 'SAMA',
    width: 1200,
    height: 800,
    minWidth: 1000,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // Enable DevTools in development
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Remove backend spawning logic
  electronApp.setAppUserModelId('com.electron');

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (pythonProcess) pythonProcess.kill();
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// Handle Holiday API requests
// Fetch holidays handler
// ipcMain.handle('fetch-holidays', async (event, { country, year }) => {
//   try {
//     const response = await axios.get('https://holidayapi.com/v1/holidays', {
//       params: {
//         key: '9dcc1985-6e08-4820-a535-370f403cc1de', // Your API key
//         country,
//         year: '2023',
//         public: true, // Only public holidays
//       },
//     });
//     // console.log('Full API Response:', response.data); // Log response to debug
//     // console.log('Holidays:', response.data.holidays); // Log holidays array
    
//     const holidayNames = response.data.holidays.map((holiday) => holiday.name);
//     // console.log('Holiday Names:', holidayNames); // Log mapped names
    
//     return holidayNames; // Send only the names
//     // return response.data.holidays.name; // Send only holidays array
//   } catch (err) {
//     console.error('Error fetching holidays:', err);
//     throw new Error('Failed to fetch holidays.');
//   }
// });