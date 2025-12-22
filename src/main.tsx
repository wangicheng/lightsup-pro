import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 引入圖片 (這樣 Vite 才會把它轉成 Base64)
import favicon from './assets/lightsup.png'

// 動態將 favicon 寫入 head
const link = document.createElement('link');
link.rel = 'icon';
link.href = favicon; // 這裡的 favicon 已經是 data:image/png;base64,....
document.head.appendChild(link);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
