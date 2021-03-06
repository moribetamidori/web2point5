import { getAuth,onAuthStateChanged, signOut as signout } from "firebase/auth";
import { useAuth } from '../../lib/authContext'
import { useContext, useState } from 'react';
import AuthCheck from "../../components/misc/authcheck";
import { useCollection, useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { doc, getDoc, collection, addDoc, setDoc, getDocs, query, where, limit, orderBy} from 'firebase/firestore';
import { firestore } from '../../lib/firebaseConfig/init'
import { authContext } from '../../lib/authContext'
import { getUserWithUsername, postToJSON } from '../../lib/firebaseConfig/init';
import PostFeed from "../../components/users/PostFeed";
import React from 'react'
import { SelectMenuOption } from '../../lib/types';
import ExchangeForm from "../../components/form/PostForm";
import { nanoid } from "nanoid";


export default function AdminPostsPage(props:any) {
    return (
      <main>
        <AuthCheck>
          {/* <PostList /> */}
          <CreateNewPost />
        </AuthCheck>
      </main>
    );
  }


export function CreateNewPost () {

  const slug = nanoid();

    return (
      <>
      <ExchangeForm slug={slug}/>
      </>
    );
}
