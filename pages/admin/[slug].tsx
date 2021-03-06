import AuthCheck from "../../components/misc/authcheck";
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { getAuth,onAuthStateChanged, signOut as signout } from "firebase/auth";
import { doc } from 'firebase/firestore';
import { firestore } from '../../lib/firebaseConfig/init'
import Link from 'next/link'
import { connectStorageEmulator } from 'firebase/storage';
import { useForm } from 'react-hook-form';
import { updateDoc, serverTimestamp } from "firebase/firestore";
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import EditForm from '../../components/form/EditForm';

export default function AdminPostEdit(props:any) {
    return (
      <AuthCheck>
          <PostManager />
      </AuthCheck>
    );
  }
  
function PostManager() {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;
  const realSlug:string = Array.isArray(slug)?slug[0]:slug!;
  const auth = getAuth();

  const uid:string = auth?.currentUser?.uid!;

  const postRef = doc(firestore, "users", uid, "posts", realSlug);    
  const [post] = useDocumentData(postRef);

  return (
    <main >
      {post && (
        <>
          <section>
            <PostForm postRef={postRef} defaultValues={post} preview={preview} />
          </section>
        </>
      )}
    </main>
  );
}

interface Props {
  defaultValues: any,
  postRef: any,
  preview: any
}
function PostForm(props:Props) {
  const {defaultValues, postRef, preview} =props;

  return (
    <>
    <EditForm postRef={postRef} defaultValues={defaultValues} preview={preview}/>
    </>
  );
}

