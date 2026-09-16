/*
 * Foto bernomor bisa memakai JPG, JPEG, PNG, WEBP, GIF, AVIF, HEIC, atau HEIF.
 * HEIC/HEIF dikonversi di browser, menggunakan pustaka lokal, tanpa unggah.
 * Untuk HEIC/HEIF gunakan Live Server (HTTP), bukan membuka file:// langsung.
 */
(() => {
  'use strict';
  const formats = ['jpg','jpeg','png','webp','avif','gif','heic','heif'];
  const cache = new Map();
  const objectUrls = new Set();
  let decoder;
  let conversionQueue = Promise.resolve();

  function candidates(source) {
    const suffix = source.match(/\.(jpe?g|png|webp|avif|gif|heic|heif)$/i);
    const stem = suffix ? source.slice(0,-suffix[0].length) : source;
    const paths = suffix ? [source] : [];
    for (const ext of formats) {
      for (const variant of [ext,ext.toUpperCase(),ext[0].toUpperCase()+ext.slice(1)]) {
        paths.push(`${stem}.${variant}`);
      }
    }
    return [...new Set(paths)];
  }

  function imageLoads(source) {
    return new Promise(resolve => {
      const image = new Image();
      image.onload = () => resolve(image.naturalWidth > 0);
      image.onerror = () => resolve(false);
      image.src = source;
    });
  }

  function loadDecoder() {
    if (!decoder) {
      decoder = new Promise((resolve,reject) => {
        if (typeof window.HeicTo === 'function') { resolve(window.HeicTo); return; }
        const script = document.createElement('script');
        script.src = 'assets/vendor/heic-to-1.5.2.js';
        script.onload = () => typeof window.HeicTo === 'function'
          ? resolve(window.HeicTo)
          : reject(new Error('Pembaca HEIC tidak tersedia.'));
        script.onerror = () => reject(new Error('Pembaca HEIC gagal dimuat.'));
        document.head.append(script);
      });
    }
    return decoder;
  }

  async function heicImage(source) {
    if (location.protocol === 'file:') {
      return await imageLoads(source) ? source : null;
    }
    const response = await fetch(source, {cache:'no-cache'});
    if (!response.ok) return null;
    const blob = await response.blob();
    const convert = await loadDecoder();
    // Some file servers return an HTML error document with status 200.
    if (!(await convert.isHeic(blob))) return null;
    const task = conversionQueue.then(() => convert({blob,type:'image/jpeg',quality:.9}));
    conversionQueue = task.catch(() => {});
    const converted = await task;
    const url = URL.createObjectURL(converted);
    objectUrls.add(url);
    return url;
  }

  async function findPhoto(source) {
    if (typeof source !== 'string' || !source.trim()) throw new Error('Nama foto kosong.');
    if (/^(data:|blob:)/i.test(source)) {
      if (await imageLoads(source)) return source;
      throw new Error('Gambar tidak dapat dibaca.');
    }
    for (const path of candidates(source)) {
      try {
        if (/\.(heic|heif)$/i.test(path)) {
          const converted = await heicImage(path);
          if (converted) return converted;
        } else if (await imageLoads(path)) {
          return path;
        }
      } catch (error) {
        // A missing, damaged, or unsupported candidate must not stop other photos.
        console.warn('Foto belum dapat dibaca:',path,error.message);
      }
    }
    throw new Error(`Foto tidak ditemukan atau format tidak dapat dibaca: ${source}`);
  }

  window.MemoryPhotos = {
    load(source) {
      if (!cache.has(source)) cache.set(source,findPhoto(source));
      return cache.get(source);
    }
  };
  window.addEventListener('pagehide',event => {
    if (!event.persisted) objectUrls.forEach(url => URL.revokeObjectURL(url));
  });
})();
