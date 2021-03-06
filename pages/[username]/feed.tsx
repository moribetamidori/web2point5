import PostFeed from '../../components/users/PostFeed';
import { communityToJSON, getCommunityWithSlug, getUserWithUsername, postToJSON } from '../../lib/firebaseConfig/init';
import { doc, startAfter, collection, collectionGroup, addDoc, setDoc, getDocs, query, where, limit, orderBy} from 'firebase/firestore';
import { firestore } from '../../lib/firebaseConfig/init' ;
import { fromMillis } from '../../lib/firebaseConfig/init';
import Loader from '../../components/misc/loader';
import {useState, useEffect} from 'react';
const LIMIT = 5;

export async function getServerSideProps(context:any) {
    const {params} = context;
    const {username} = params; // grab the slug from the url parameters
    // console.log("username",username);
    const userDoc = await getUserWithUsername(username)
    if (!userDoc) {
        return {
            notFound: true,
        };
    }

    let user = null;
    let slugs;
    let members:any[] = [];
    let temp :any[] = [];
    let posts:any[] = [];
    let uid:any;
    // console.log("uid",uid)
    if (userDoc) {
        user = userDoc.data();
        uid = user.uid! 
        //query communities the user is a member of and get a list of community slugs
        const communityQuery = query(
            collection(firestore, "users", uid, "communities"), 
            );
        const communitySnapshot = await getDocs(communityQuery);
        if(communityQuery){
            slugs = communitySnapshot.docs.map(d=>d.id);//get all membered-community
            // console.log("slugs",slugs);

            for (const slug of slugs) {
                const memberQuery = query(collection(firestore, "communities", slug, "members"))
                const membersSnapshot = (await getDocs(memberQuery));
                const memberBatch =  membersSnapshot.docs.map(d=>d.id);
                members.push(...memberBatch)             
            }
        }  
    }
    if(members.length > 0) {
        members = members.filter(item => item !== uid);
        members = members.filter((v:any, i:any, a:any) => a.indexOf(v) === i);

        temp = [...members];
        while(members.length){
            const batch = members.splice(0, 10);
            const postsQuery  = query(collectionGroup(firestore, "posts"), where("uid", "in", [...batch]), orderBy("createdAt", "desc"), limit(LIMIT));
            posts.push(...(await getDocs(postsQuery)).docs.map(postToJSON));
        }
    }

    let fetchedMembers = temp;



    return {
        props: {user, posts, fetchedMembers, slugs}
    }
    

}

interface User {
    user: any
    posts: any
    fetchedMembers: any
    slugs: any
}

export default function ExchangePage(props: User): any {

    const [posts, setPosts] = useState(props.posts);
    const [loading, setLoading] = useState(false);
    let fetchedMembers = props.fetchedMembers;
    const [postsEnd, setPostsEnd] = useState(false);
    let temp = [...fetchedMembers];

    const getMorePosts = async () => {
        setLoading(true);
        const last = posts[posts.length - 1];

        const cursor = typeof last?.createdAt === 'number' ? fromMillis(last.createdAt) : last.createdAt;
        while(fetchedMembers.length){
            const batch = fetchedMembers.splice(0, 10);
            const postsQuery = query(
                collectionGroup(firestore, "posts"), 
                where("uid", "in", [...batch]), 
                orderBy("createdAt", "desc"), 
                startAfter(cursor),
                limit(LIMIT));

            const newPosts=(await getDocs(postsQuery)).docs.map(postToJSON);
            setPosts(posts.concat(newPosts));
            setLoading(false);
            
            if (newPosts.length < LIMIT) {
                setPostsEnd(true);
              }
        }
        fetchedMembers = temp;
      };


    return (
    <>
    <div className="min-h-full">

     <h1 className="text-2xl font-semibold text-center text-gray-900">Exchange Feed</h1>
     <p className="text-sm text-center font-medium text-gray-500">All the posts from your communities.</p>

                <div className="mt-6 flex-shrink-0 flex border-t border-gray-200 p-4"/>

     <PostFeed posts={posts} admin={true} />
     
        <div className="mt-8 min-h-full">
                {!loading && !postsEnd && posts.length > 0 && 
                <button 
                    className=" w-full relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"

                    onClick={getMorePosts}>
                         <span className=" w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Load More Posts
              </span>
                        </button>}

                <Loader show={loading} />

                {(postsEnd || posts.length === 0) && 
              <button className=" w-full relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-pink-500 to-orange-400 group-hover:from-pink-500 group-hover:to-orange-400 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
              <span className=" w-full relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              You have reached the end!
              </span>
               </button>
                }
         </div>
     </div>

    </>
    )
}