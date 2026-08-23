import * as FileSystem from 'expo-file-system';
import { auth } from '../config/firebase';

/**
 * Đọc ảnh từ URI cục bộ (file://) và chuyển thành chuỗi Base64
 * để lưu trực tiếp vào Cloud Firestore thay vì dùng Firebase Storage (tránh lỗi bắt buộc có thẻ thanh toán Blaze).
 * @param {string} uri - Đường dẫn ảnh cục bộ
 * @param {string} baseFolder - Không còn dùng đến
 * @returns {Promise<string|null>} - Trả về Data URL (Base64) hoặc null nếu lỗi
 */
export const uploadImageAsync = async (uri, baseFolder = 'images') => {
  if (!uri || !uri.startsWith('file://')) {
    // Nếu uri đã là URL (http/https/data:) hoặc null, trả về nguyên trạng
    return uri;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not logged in. Cannot process image.');
    }

    // Đọc file thành chuỗi Base64
    const base64 = await FileSystem.readAsStringAsync(uri, { 
      encoding: 'base64' 
    });

    // Đoán MIME type dựa trên đuôi file
    let mimeType = 'image/jpeg';
    const lowerUri = uri.toLowerCase();
    if (lowerUri.endsWith('.png')) mimeType = 'image/png';
    else if (lowerUri.endsWith('.gif')) mimeType = 'image/gif';
    else if (lowerUri.endsWith('.webp')) mimeType = 'image/webp';

    // Trả về chuỗi Data URL
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error('Lỗi chuyển ảnh sang Base64:', error);
    return null;
  }
};
