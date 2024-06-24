import { getDownloadURL, uploadBytesResumable, ref } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import { storage, db } from './firebaseConfig';

const upload = async (file, chatId) => {
  const date = new Date().toISOString();
  const storageRef = ref(storage, `images/${date}-${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        reject("Something went wrong! " + error.code);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        const photoDocRef = doc(db, 'photos', `${date}-${file.name}`);
        await setDoc(photoDocRef, {
          url: downloadURL,
          chatId: chatId,
          uploadedAt: date
        });
        resolve(downloadURL);
      }
    );
  });
};

export default upload;
