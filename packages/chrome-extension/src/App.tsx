import{ useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, User, signInWithEmailAndPassword } from 'firebase/auth';
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
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setUser(user);
      setUserName(user.displayName);
    } catch (error) {
      console.error("Error signing in: ", error);
    }
  };

  fetch('https://jsonplaceholder.typicode.com/todos/1')
      .then(response => response.json())
      .then(json => console.log(json))

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
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일 입력"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
          />
          <button onClick={handleLogin}>로그인</button>
        </div>
      )}
    </div>
  );
}

export default App;
