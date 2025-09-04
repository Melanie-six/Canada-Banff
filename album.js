// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getStorage, ref, uploadBytes, getDownloadURL, listAll } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js";

// Firebase 設定
const firebaseConfig = {
  apiKey: "AIzaSyCLo8EuCx36nZ9-T9ZSFGb2cXqvkQa73Ig",
  authDomain: "banff-photo-album.firebaseapp.com",
  projectId: "banff-photo-album",
  storageBucket: "banff-photo-album.appspot.com", // ⚠️ 這裡要改成 .appspot.com
  messagingSenderId: "419522849632",
  appId: "1:419522849632:web:18c0d44dfb85a560370c05"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// 📤 上傳圖片的事件 (例子)
document.getElementById("uploadBtn").addEventListener("click", async () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return alert("請先選擇檔案");

  const storageRef = ref(storage, 'photos/' + file.name);
  await uploadBytes(storageRef, file);
  alert("上傳成功！");
});

// 📸 載入相簿圖片
async function loadPhotos() {
  const listRef = ref(storage, 'photos/');
  const res = await listAll(listRef);

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  for (const itemRef of res.items) {
    const url = await getDownloadURL(itemRef);
    const img = document.createElement("img");
    img.src = url;
    img.classList.add("photo");
    gallery.appendChild(img);
  }
}
loadPhotos();
