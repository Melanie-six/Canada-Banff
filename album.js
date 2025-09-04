// script.js

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
const auth = getAuth(app); // 只在這裡初始化一次 auth

// --- DOM 元素 ---
const gallery = document.getElementById("gallery");
const uploadForm = document.getElementById("uploadForm"); // 取得整個上傳表單的參考
const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const loginButton = document.getElementById('loginButton');
const logoutButton = document.getElementById('logoutButton');
const userInfoDiv = document.getElementById('userInfo');

// --- 事件監聽 ---
uploadBtn.addEventListener("click", handleUpload);
loginButton.addEventListener('click', login);
logoutButton.addEventListener('click', logout);

// --- 核心功能函式 ---

// 📤 上傳圖片的函式
async function handleUpload() {
  const file = fileInput.files[0];
  if (!file) {
    alert("請先選擇檔案");
    return;
  }

  // 顯示上傳中的提示... (可選)
  uploadBtn.disabled = true;
  uploadBtn.innerText = "上傳中...";

  try {
    const storageRef = ref(storage, 'photos/' + file.name);
    await uploadBytes(storageRef, file);
    alert("上傳成功！");
    // 上傳成功後，重新載入一次相簿
    await loadPhotos();
  } catch (error) {
    console.error("上傳失敗:", error);
    alert("上傳失敗，請查看控制台錯誤訊息。");
  } finally {
    // 無論成功或失敗，都恢復按鈕狀態
    uploadBtn.disabled = false;
    uploadBtn.innerText = "上傳";
    fileInput.value = ""; // 清空檔案選擇
  }
}

// 📸 載入相簿圖片
async function loadPhotos() {
  gallery.innerHTML = "載入中..."; // 提供更好的用戶體驗
  const listRef = ref(storage, 'photos/');
  try {
    const res = await listAll(listRef);
    gallery.innerHTML = ""; // 清空「載入中」提示
    if (res.items.length === 0) {
      gallery.innerHTML = "相簿目前是空的，快上傳第一張照片吧！";
    }
    for (const itemRef of res.items) {
      const url = await getDownloadURL(itemRef);
      const img = document.createElement("img");
      img.src = url;
      img.classList.add("photo");
      gallery.appendChild(img);
    }
  } catch (error) {
    console.error("載入相簿失敗:", error);
    gallery.innerHTML = "無法載入相簿，請檢查權限或網路連線。";
  }
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

// 🕵️‍♂️ 監聽用戶登入狀態的變化 (最關鍵的一步！)
onAuthStateChanged(auth, (user) => {
  if (user) {
    // 用戶已登入
    userInfoDiv.innerText = `歡迎您, ${user.displayName}`;
    loginButton.style.display = 'none';
    logoutButton.style.display = 'block';
    uploadForm.style.display = 'block'; // 3. 顯示上傳表單
  } else {
    // 用戶已登出
    userInfoDiv.innerText = '請登入以上傳照片';
    loginButton.style.display = 'block';
    logoutButton.style.display = 'none';
    uploadForm.style.display = 'none'; // 3. 隱藏上傳表單
  }
});

// --- 初始載入 ---
loadPhotos();