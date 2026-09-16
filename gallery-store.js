/*
  Хранилище галереи, подключённое к Supabase.
  Нужно один раз выполнить supabase-schema.sql в SQL Editor проекта.

  Впиши свои данные ниже (Project Settings → API):
*/
// === ЗАПОЛНИ СВОИ ДАННЫЕ ИЗ SUPABASE ===
const SUPABASE_URL = 'https://ВАШ_PROJECT_REF.supabase.co';
const SUPABASE_ANON_KEY = 'ВАШ_ANON_PUBLIC_KEY';
// =======================================

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getImages() {
  const { data, error } = await supabaseClient
    .from('gallery_images')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('GalleryStore.getImages error:', error);
    return [];
  }
  return data;
}

async function addImage({ url, caption }) {
  const { error } = await supabaseClient
    .from('gallery_images')
    .insert({ url, caption });
  if (error) console.error('GalleryStore.addImage error:', error);
  window.dispatchEvent(new CustomEvent('gallery:updated'));
}

async function updateImage(id, fields) {
  const { error } = await supabaseClient
    .from('gallery_images')
    .update(fields)
    .eq('id', id);
  if (error) console.error('GalleryStore.updateImage error:', error);
  window.dispatchEvent(new CustomEvent('gallery:updated'));
}

async function deleteImage(id) {
  const { error } = await supabaseClient
    .from('gallery_images')
    .delete()
    .eq('id', id);
  if (error) console.error('GalleryStore.deleteImage error:', error);
  window.dispatchEvent(new CustomEvent('gallery:updated'));
}

/**
 * Загружает файл в Storage bucket "gallery" и возвращает публичный URL.
 * file — объект File (например, из <input type="file">).
 */
async function uploadFile(file) {
  const path = `${Date.now()}-${file.name}`;
  const { error } = await supabaseClient.storage
    .from('gallery')
    .upload(path, file);
  if (error) {
    console.error('GalleryStore.uploadFile error:', error);
    return null;
  }
  const { data } = supabaseClient.storage.from('gallery').getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Фото в главной hero-карточке справа (не из галереи, а отдельная настройка).
 */
async function getHeroImage() {
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('value')
    .eq('key', 'hero_image_url')
    .maybeSingle();
  if (error) {
    console.error('GalleryStore.getHeroImage error:', error);
    return '';
  }
  return data?.value || '';
}

async function setHeroImage(url) {
  const { error } = await supabaseClient
    .from('site_settings')
    .upsert({ key: 'hero_image_url', value: url });
  if (error) console.error('GalleryStore.setHeroImage error:', error);
  window.dispatchEvent(new CustomEvent('hero-image:updated'));
}

function subscribe(callback) {
  window.addEventListener('gallery:updated', async () => callback(await getImages()));

  // Живое обновление между вкладками/устройствами через Supabase Realtime
  supabaseClient
    .channel('gallery_images_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery_images' }, async () => {
      callback(await getImages());
    })
    .subscribe();
}

function subscribeHeroImage(callback) {
  window.addEventListener('hero-image:updated', async () => callback(await getHeroImage()));

  supabaseClient
    .channel('site_settings_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, async () => {
      callback(await getHeroImage());
    })
    .subscribe();
}

window.GalleryStore = {
  getImages, addImage, updateImage, deleteImage, uploadFile, subscribe,
  getHeroImage, setHeroImage, subscribeHeroImage,
};
