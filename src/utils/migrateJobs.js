import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { normalizeString } from '../db/database';

export const migrateJobs = async () => {
  try {
    const jobsRef = collection(db, 'jobs');
    const snapshot = await getDocs(jobsRef);
    let count = 0;
    
    for (const jobDoc of snapshot.docs) {
      const data = jobDoc.data();
      if (!data.title_normalized && data.title) {
        await updateDoc(doc(db, 'jobs', jobDoc.id), {
          title_normalized: normalizeString(data.title)
        });
        count++;
      }
    }
    
    console.log(`Đã migrate thành công ${count} tin tuyển dụng (thêm title_normalized).`);
    return true;
  } catch (error) {
    console.error("Lỗi khi migrate jobs:", error);
    return false;
  }
};
