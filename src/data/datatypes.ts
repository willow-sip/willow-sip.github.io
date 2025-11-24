export interface User {
  id: number;
  username: string;
  email?: string;
  password?: string;
  firstName?: string;
  secondName?: string;
  profileImage?: string;
  description?: string;
  bio?: string;
  likesCount?: number;
  lastLogin?: string;
  creationDate?: string;
  modifiedDate?: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  image?: string;
  authorId: number;
  likesCount: number;
  commentsCount: number;
  creationDate: string;
  modifiedDate: string;
}

export interface Comment {
  id: number;
  text: string;
  authorId: number;
  authorName?: string;
  postId: number;
  creationDate: string;
  modifiedDate: string;
}

export interface Like {
  id: number;
  postId: number;
  authorId: number;
  creationDate: string;
}

export interface Group {
  id: number;
  title: string;
  membersCount: number;
  photo: string;
}
