'use client';

import React, { Component } from 'react';
import Comment from '../Comment';
import { useTheme } from '@/context/ThemeContext';
import { showNotification } from '@/components/notify';
import { Post as PostType, User, Comment as CommentType } from '@/data/datatypes';
import { TFunction } from 'i18next';

import {
    PostContainer, Author, Avatar, LoadingAvatar, AuthorInfo, AuthorName, PublishTime, PostImage, PostTitle, PostContent, PostButtons,
    Button, Likes, Comments, CommentSection, AddComment, AddCommentHeader, CommentTextarea, AddCommentButton, Spinner, AnimatedHeart
} from './Post.styles';
import { ArrowDown, ArrowUp, CommentSvg, LikeSvg, Pencil } from '@/svgs';
import enableAuth from '../WithAuthAndTranslation';
import { tokenApi } from '@/tokenApi';


interface PostProps {
    post: PostType;
    user: User | null;
    userAuth: boolean;
    t: TFunction;
}

interface PostState {
    showComments: boolean;
    comments: CommentType[] | undefined;
    author: User;
    liked: boolean;
    likesCount: number;
    newComment: string;
    loading: boolean;
    addingComment: boolean;
    animateLike: boolean;
}

class Post extends Component<PostProps, PostState> {
    constructor(props: PostProps) {
        super(props);
        this.state = {
            showComments: false,
            comments: undefined,
            author: {
                id: NaN,
                username: '',
            },
            liked: false,
            likesCount: props.post.likesCount,
            newComment: '',
            loading: true,
            addingComment: false,
            animateLike: false,
        };
        this.editComment = this.editComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }

    editComment(newText: string, commentId?: number) {
        this.setState((prev) => ({
            comments: prev.comments?.map((c) =>
                c.id === commentId ? { ...c, text: newText } : c
            ),
        }));
        showNotification(this.props.t('updateComment'), 'success', 2000);
    }

    deleteComment(commentId?: number) {
        
        this.setState((prev) => ({
            comments: prev.comments?.filter((c) =>{
                return c.id !== commentId;
            } ),
        }));
        showNotification(this.props.t('deleteComment'), 'success', 2000);
    }

    calculatePublishTime = (): string => {
        const now = new Date();
        const published = new Date(this.props.post.creationDate);;
        const diffMs = now.getTime() - published.getTime();

        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

        if (seconds < 60) return rtf.format(-seconds, 'second');
        if (minutes < 60) return rtf.format(-minutes, 'minute');
        if (hours < 24) return rtf.format(-hours, 'hour');
        if (days < 7) return rtf.format(-days, 'day');
        if (days < 30) return rtf.format(-Math.floor(days / 7), 'week');
        if (days < 365) return rtf.format(-Math.floor(days / 30), 'month');
        return rtf.format(-Math.floor(days / 365), 'year');
    };

    toggleShowComments = () => {
        this.setState(prevState => ({
            showComments: !prevState.showComments
        }));
    };

    handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ newComment: e.target.value });
    };

    handleAddComment = () => {
        const { newComment, comments } = this.state;
        const { user } = this.props;
        const postId = this.props.post.id;

        if (!newComment.trim()) {
            console.log('Comment text is empty');
            return;
        }
        this.setState({ addingComment: true });

        const commentData = {
            postId: Number(postId),
            text: newComment.trim(),
        };

        tokenApi.post('/comments', commentData)
            .then(createdComment => {
                if (user) {
                    const fullComment: CommentType = {
                        id: createdComment.id,
                        text: createdComment.text,
                        authorId: user.id,
                        postId: createdComment.postId,
                        creationDate: createdComment.creationDate || new Date().toISOString(),
                        modifiedDate: createdComment.modifiedDate || new Date().toISOString(),
                    };
                    this.setState(prevState => ({
                        comments: prevState.comments
                            ? [...prevState.comments, fullComment]
                            : [fullComment],
                        newComment: '',
                        addingComment: false,
                    }));
                    showNotification('Comment updated!', 'success', 2000);
                }
            }).catch(err => console.error(err));
    };

    handleLike = () => {
        const { liked } = this.state;
        const postId = this.props.post.id;

        this.setState({ animateLike: true });
        setTimeout(() => {
            this.setState({ animateLike: false });
        }, 400);

        const endpoint = liked ? '/dislike' : '/like';

        tokenApi.post(endpoint, { postId })
            .then(data => {
                if (data) {
                    this.setState(prevState => ({
                        liked: !prevState.liked,
                        likesCount: prevState.liked
                            ? (prevState.likesCount - 1)
                            : prevState.likesCount + 1,
                    }));
                } else {
                    showNotification('Failed to toggle like', 'error', 2000);
                }
            })
            .catch(err => {
                console.error('Error toggling like:', err);
                showNotification('Network error', 'error', 2000);
            });
    };

    loadCommentsAndAuthor = () => {
        const id: number = this.props.post.id;
        const { user } = this.props;

        if (user) {
            tokenApi.get(`/posts/${id}/comments`)
                .then(data => {
                    this.setState(() => ({
                        comments: data,
                    }));
                })
                .catch(error => {
                    console.error(error);
                });

            tokenApi.get(`/users/${this.props.post.authorId}`)
                .then(data => {
                    this.setState(() => ({
                        author: data,
                        loading: false
                    }));
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    componentDidMount(): void {
        this.loadCommentsAndAuthor();
    }

    componentDidUpdate(prevProps: PostProps) {
        if (prevProps.post.id !== this.props.post.id) {
            this.loadCommentsAndAuthor();
        }
    }

    render() {
        const { showComments } = this.state;
        const { userAuth, t } = this.props;
        const { title, content, image } = this.props.post;
        const comments = this.state.comments;
        const commentsCount = this.state.comments?.length;
        const { profileImage, firstName, secondName } = this.state.author;
        const theme = useTheme.getState().theme;

        return (
            <PostContainer theme={theme}>
                {this.state.loading ? (
                    <Author>
                        <LoadingAvatar />
                        <AuthorInfo>
                            <Spinner data-testid="spinner" />
                        </AuthorInfo>
                    </Author>
                ) : (
                    <Author>
                        <Avatar
                            data-testid="avatar"
                            src={profileImage || './imgs/default-avatar.jpg'}
                            alt="Post author avatar"
                        />
                        <AuthorInfo>
                            <AuthorName data-testid="author-name">{firstName} {secondName}</AuthorName>
                            <PublishTime>{this.calculatePublishTime()}</PublishTime>
                        </AuthorInfo>
                    </Author>
                )}

                {image && <PostImage data-testid="post-img" src={image} alt="Post" />}
                <PostTitle data-testid="post-title">{title}</PostTitle>
                <PostContent data-testid="post-content">{content}</PostContent>

                <PostButtons>
                    <Likes>
                        <AnimatedHeart
                            animate={this.state.animateLike.toString()}
                            onClick={this.handleLike}
                        >
                            <LikeSvg className={this.state.liked ? '' : 'outline'} />
                        </AnimatedHeart>
                        <p>{this.state.likesCount} {t('likes')}</p>
                    </Likes>
                    <Comments>
                        <CommentSvg className="outline" />
                        <span className="comment-text">
                            {userAuth
                                ? commentsCount !== undefined
                                    ? `${commentsCount} ${t('commentsCount')}`
                                    : t('loadingComments')
                                : t('loginToSeeComments')}
                        </span>
                    </Comments>
                    {userAuth && (
                        <Button onClick={this.toggleShowComments}>
                            {showComments ? (
                                <ArrowDown />
                            ) : (
                                <ArrowUp />
                            )}
                        </Button>
                    )}
                </PostButtons>

                {showComments && (
                    <CommentSection>
                        {comments?.map((comment) => (
                            <Comment
                                key={comment.id}
                                id={comment.id}
                                authorId={comment.authorId}
                                text={comment.text}
                                edit={this.editComment}
                                deleteComm={this.deleteComment}
                            />
                        ))}

                        <AddComment>
                            <AddCommentHeader>
                                <Pencil />
                                <p>{t('addComment')}</p>
                            </AddCommentHeader>
                            <CommentTextarea
                                data-testid="comment-textarea"
                                name="commentText"
                                id="commentText"
                                placeholder={t('commentPlaceholder')}
                                value={this.state.newComment}
                                onChange={this.handleCommentChange}
                            />
                            <AddCommentButton
                                data-testid="add-comment-button"
                                onClick={this.handleAddComment}
                                disabled={this.state.addingComment}
                                adding={this.state.addingComment.toString()}
                            >
                                {this.state.addingComment ? t('addingComment') : t('addComment')}
                            </AddCommentButton>
                        </AddComment>
                    </CommentSection>
                )}
            </PostContainer>
        );
    }
}

export default enableAuth(Post);
export { Post as UnwrappedPost };
