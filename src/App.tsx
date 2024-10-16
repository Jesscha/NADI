import{ useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

console.log("started")
// console.log(process.env.REACT_APP_FIREBASE_API_KEY)

// Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase initialization
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

function App() {
  const [text, setText] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    console.log("signing in", provider)
    const result = await signInWithPopup(auth, provider);
    console.log("signed in", result)
    setUser(result.user);
    setUserName(result.user.displayName);
  };

  const handleSubmit = async () => {
    if (text.length > 100) {
      alert("글은 100자 이내로 작성해주세요.");
      return;
    }
    if(!user){
      return
    }

    try {
      await addDoc(collection(db, 'posts'), {
        text,
        userId: user.uid,
        createdAt: new Date(),
        status: 'pending' // 검토 중인 상태로 저장
      });
      setText('');
      alert("글이 제출되었습니다.");
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div>
      <h1>
        Hello {userName}
      </h1>
      {user ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="100자 이내로 글을 작성해주세요."
          />
          <button onClick={handleSubmit}>글 올리기</button>
        </div>
      ) : (
        <button onClick={handleLogin}>구글 로그인</button>
      )}
    </div>
  );
}

export default App;
