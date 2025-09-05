// album.js

// 1. 統一在此處匯入所有需要的 Firebase 模組，並確保版本號一致
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyCLo8EuCx36nZ9-T9ZSFGb2cXqvkQa73Ig",
  authDomain: "banff-photo-album.firebaseapp.com",
  projectId: "banff-photo-album",
  storageBucket: "banff-photo-album.firebasestorage.app",
  messagingSenderId: "419522849632",
  appId: "1:419522849632:web:18c0d44dfb85a560370c05"
};

// 2. 初始化 Firebase 服務
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

// --- DOM 元素 ---
const gallery = document.getElementById("gallery");
const uploadForm = document.getElementById("uploadForm");
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userInfoDiv = document.getElementById('userInfo');

// --- 事件監聽 ---
uploadBtn.addEventListener("click", handleUpload);
loginButton.addEventListener('click', login);
logoutButton.addEventListener('click', logout);

// --- 輔助函式 ---

// [新增] 輔助函式：讀取照片的 EXIF 日期，回傳 'YYYY-MM-DD' 格式
function getExifDate(file) {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const exifDate = EXIF.getTag(this, "DateTimeOriginal");
      if (exifDate) {
        const datePart = exifDate.split(' ')[0];
        resolve(datePart.replace(/:/g, '-'));
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        resolve(`${yyyy}-${mm}-${dd}`);
      }
    });
  });
}

// [新增] 輔助函式：透過 URL 觸發瀏覽器下載
async function downloadImage(url, filename) {
    const response = await fetch(url, { mode: 'cors' }); // 使用 CORS 模式來請求跨來源圖片
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}


// --- 核心功能函式 ---

// [修改] 📤 上傳圖片的函式 (加入 EXIF 日期分類)
async function handleUpload() {
  const file = fileInput.files[0];
  if (!file) return alert("請先選擇檔案");

  uploadBtn.disabled = true;
  uploadBtn.innerText = "分析照片中...";

  try {
    const dateString = await getExifDate(file);
    uploadBtn.innerText = "上傳中...";
    const storageRef = ref(storage, `photos/${dateString}/${file.name}`);
    await uploadBytes(storageRef, file);
    alert(`上傳成功！已歸類到 ${dateString} 的相簿。`);
    await loadAlbums(); // 上傳後重新載入相簿列表
  } catch (error) {
    console.error("上傳失敗:", error);
    alert("上傳失敗，請查看控制台錯誤訊息。");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerText = "上傳";
    fileInput.value = "";
  }
}

// [新增] 🏞️ 載入所有相簿封面
async function loadAlbums() {
  gallery.innerHTML = "<h1>我的相簿</h1><div class='album-grid'></div>";
  const albumGrid = gallery.querySelector('.album-grid');
  albumGrid.innerHTML = "正在載入相簿...";
  
  const listRef = ref(storage, 'photos/');
  try {
    const res = await listAll(listRef);
    albumGrid.innerHTML = "";
    
    if (res.prefixes.length === 0) {
      albumGrid.innerHTML = "目前沒有任何相簿，快上傳第一張照片吧！";
      return;
    }

    for (const folderRef of res.prefixes) {
      const albumName = folderRef.name;
      const albumDiv = document.createElement("div");
      albumDiv.className = "album-cover";
      albumDiv.innerHTML = `<div class="album-title">${albumName}</div>`;
      
      const firstImageItems = (await listAll(folderRef, { maxResults: 1 })).items;
      if (firstImageItems.length > 0) {
        const url = await getDownloadURL(firstImageItems[0]);
        albumDiv.style.backgroundImage = `url(${url})`;
      }
      
      albumDiv.onclick = () => loadPhotosInAlbum(albumName); 
      albumGrid.appendChild(albumDiv);
    }
  } catch (error) {
    console.error("載入相簿失敗:", error);
    albumGrid.innerHTML = "無法載入相簿。";
  }
}

// [新增] 🖼️ 載入特定相簿內的所有照片
async function loadPhotosInAlbum(albumName) {
  gallery.innerHTML = `
    <div class="album-header">
      <h2>${albumName}</h2>
      <div>
        <button id="downloadSelectedBtn">下載選取照片</button>
        <button id="backToAlbumsBtn">返回相簿列表</button>
      </div>
    </div>
    <div id="photo-grid">正在載入照片...</div>
  `;

  document.getElementById('backToAlbumsBtn').onclick = loadAlbums;
  document.getElementById('downloadSelectedBtn').onclick = downloadSelectedPhotos;

  const photoGrid = document.getElementById('photo-grid');
  const listRef = ref(storage, `photos/${albumName}/`);

  try {
    const res = await listAll(listRef);
    photoGrid.innerHTML = ""; // 清空載入提示
    for (const itemRef of res.items) {
      const url = await getDownloadURL(itemRef);
      const photoContainer = document.createElement("div");
      photoContainer.className = "photo-container";
      photoContainer.innerHTML = `
        <img src="${url}" data-filename="${itemRef.name}" class="photo" />
        <input type="checkbox" class="photo-checkbox" />
      `;
      photoGrid.appendChild(photoContainer);
    }
  } catch (error) {
     console.error("載入照片失敗:", error);
     photoGrid.innerHTML = "無法載入照片。";
  }
}

// [新增] 📥 下載選取的照片
function downloadSelectedPhotos() {
  const selectedCheckboxes = document.querySelectorAll('.photo-checkbox:checked');
  if (selectedCheckboxes.length === 0) {
    alert("請先勾選您想下載的照片。");
    return;
  }
  alert(`準備下載 ${selectedCheckboxes.length} 張照片...`);
  selectedCheckboxes.forEach(checkbox => {
    const container = checkbox.closest('.photo-container');
    const img = container.querySelector('img');
    downloadImage(img.src, img.dataset.filename);
  });
}

// 🔑 登入函式
async function login() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("登入失敗:", error);
  }
}

// 🚪 登出函式
function logout() {
  signOut(auth);
}

// 🕵️‍♂️ 監聽用戶登入狀態的變化
onAuthStateChanged(auth, (user) => {
  if (user) {
    userInfoDiv.innerText = `歡迎您, ${user.displayName}`;
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
    uploadForm.style.display = 'block';
  } else {
    userInfoDiv.innerText = '請登入以上傳照片';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    uploadForm.style.display = 'none';
  }
});

// --- 初始載入 ---
// [修改] 頁面初次載入時，執行 loadAlbums 而不是 loadPhotos
loadAlbums();