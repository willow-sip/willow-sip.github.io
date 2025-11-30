'use client';

import { useTheme } from '@/context/ThemeContext';
import AddPost from '@/components/AddPost';
import Sidebar from '@/components/Sidebar';
import { Post as PostType } from '@/data/datatypes';
import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { tokenApi } from '@/tokenApi';
import { useTranslation } from 'react-i18next';

const LazyPost = React.lazy(() => import('@/components/Post'));

export default function HomePage() {
  const { user, userAuth } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  const { data: posts = [], refetch, isLoading } = useQuery({
    queryKey: ['get-posts'],
    queryFn: async () => {
      const response = await tokenApi.get('/posts');
      return response;
    },
  });

  return (
    <>
      {userAuth && user && <AddPost avatar={user?.profileImage} postCreated={refetch} />} 
      <div className="main-page">
        <div className="posts">
          <Suspense fallback={<p>Loading posts...</p>}>
            {posts.map((post: PostType) => (
              <LazyPost
                key={post.id}
                post={post}
                user={user}
                userAuth={userAuth}
                t={t}
              />
            ))}
          </Suspense>
          {userAuth && user && <Sidebar />}
        </div>
      </div>
    </>
  );
}