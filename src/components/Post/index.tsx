'use client';

import React, { Component, createRef } from 'react';
import Comment from '../Comment';
import { useTheme } from '@/context/ThemeContext';
import { showNotification } from '@/components/notify';
import { Post as PostType, User, Comment as CommentType } from '@/data/datatypes';
import { TFunction } from 'i18next';
import { ArrowDown, ArrowUp, CommentSvg, Important, LikeSvg, Pencil } from '@/svgs';
import enableAuth from '../WithAuthAndTranslation';
import { tokenApi } from '@/tokenApi';
import { calculatePublishTime, mapEndings } from '@/utils';

import {
    PostContainer, Author, Avatar, LoadingAvatar, AuthorInfo, AuthorName, PublishTime, PostImage, PostTitle, PostContent, PostButtons,
    Button, Likes, Comments, CommentSection, AddComment, AddCommentHeader, CommentTextarea, AddCommentButton, Spinner, AnimatedHeart,
    AnimatedCommentSection
} from './Post.styles';

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
    focused: boolean;
    loading: boolean;
    addingComment: boolean;
    animateLike: boolean;
    commentLength: number;
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
            commentLength: 0,
            focused: false,
            loading: true,
            addingComment: false,
            animateLike: false,
        };
        this.editComment = this.editComment.bind(this);
        this.deleteComment = this.deleteComment.bind(this);
    }

    commentBlockRef = createRef<HTMLDivElement>();
    commentWrapperRef = createRef<HTMLDivElement>();

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
            comments: prev.comments?.filter((c) => {
                return c.id !== commentId;
            }),
        }));
        showNotification(this.props.t('deleteComment'), 'success', 2000);
    }

    toggleShowComments = () => {
        const content = this.commentBlockRef.current;
        const wrapper = this.commentWrapperRef.current;
        if (!content || !wrapper) {
            return;
        }

        if (!this.state.showComments) {
            wrapper.style.height = content.scrollHeight + "px";
            this.setState({ showComments: true });
        } else {
            wrapper.style.height = content.scrollHeight + "px";
            void wrapper.offsetHeight;
            wrapper.style.height = "0px";
            this.setState({ showComments: false });
        }
    };

    handleTransitionEnd = () => {
        const content = this.commentBlockRef.current;
        const wrapper = this.commentWrapperRef.current;
        if (!content || !wrapper) {
            return;
        }

        if (this.state.showComments) {
            wrapper.style.height = "auto";
        }
    };

    handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        this.setState({ newComment: e.target.value, commentLength: e.target.value.length });
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
                        commentLength: 0,
                        addingComment: false,
                    }));
                    showNotification(this.props.t('createComment'), 'success', 2000);
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
                showNotification(this.props.t('networkError'), 'error', 2000);
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

        const endings = mapEndings(this.state.likesCount, this.state.comments?.length || 0);
        let likeEnding = "";
        let commentEnding = "";

        switch (endings.likesEnding) {
            case "s":
                likeEnding = "likesSingular";
                break;
            case "p1":
                likeEnding = "likesPlural1";
                break;
            default:
                likeEnding = "likesPlural2";
        }
        switch (endings.commentEnding) {
            case "s":
                commentEnding = "commentsSingular";
                break;
            case "p1":
                commentEnding = "commentsPlural1";
                break;
            default:
                commentEnding = "commentsPlural2";
        }

        const { num, timeType } = calculatePublishTime(this.props.post.creationDate);

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
                            <PublishTime>{t(`time.${timeType}`, { count: num })}</PublishTime>
                        </AuthorInfo>
                    </Author>
                )}

                {image && <PostImage data-testid="post-img"
                    src={image} alt="Post" />}
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
                        <p>{this.state.likesCount} {t(likeEnding)}</p>
                    </Likes>
                    <Comments>
                        <CommentSvg className="outline" />
                        <span className="comment-text">
                            {userAuth
                                ? commentsCount !== undefined
                                    ? `${commentsCount} ${t(commentEnding)}`
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

                <AnimatedCommentSection ref={this.commentWrapperRef} onTransitionEnd={this.handleTransitionEnd}>
                    <CommentSection ref={this.commentBlockRef}>
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
                                onFocus={() => this.setState({ focused: true })}
                                onBlur={() => this.setState({ focused: false })}
                            />
                            {this.state.commentLength > 0 && (
                                <div className={`helper ${this.state.commentLength > 200 ? 'error' : (this.state.focused ? 'idle' : '')}`}>
                                    <Important />
                                    <p>
                                        {this.state.commentLength > 200
                                            ? t('lengthLimitSurpassed')
                                            : t('maxDescLength')}
                                    </p>
                                </div>
                            )}
                            <AddCommentButton
                                data-testid="add-comment-button"
                                onClick={this.handleAddComment}
                                disabled={this.state.addingComment || this.state.commentLength > 200}
                                adding={this.state.addingComment.toString()}
                            >
                                {this.state.addingComment ? t('addingComment') : t('addComment')}
                            </AddCommentButton>
                        </AddComment>
                    </CommentSection>
                </AnimatedCommentSection>
            </PostContainer>
        );
    }
}

export default enableAuth(Post);
export { Post as UnwrappedPost };
