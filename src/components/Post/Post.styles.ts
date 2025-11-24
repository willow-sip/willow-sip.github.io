import styled, { keyframes, css } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const PostContainer = styled.div<{ theme: string }>`
  background-color: var(--comp-bg-color);
  border: 2px solid var(--border-color);
  border-bottom: none;
  color: var(--text-color);
  padding: 24px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px;
    border-top: 2px solid var(--border-color);
    border-bottom: none;
    border-right: none;
    border-left: none;
    background-color: var(--bg-color);
  }
`;

export const Author = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

export const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
`;

export const LoadingAvatar = styled.div`
  width: 48px;
  height: 48px;
  background-color: var(--border-color);
  border-radius: 50%;
`;

export const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;
  line-height: 1.5;
  height: 48px;
  font-size: 16px;
`;

export const AuthorName = styled.p`
  font-weight: 500;
  margin: 0;
`;

export const PublishTime = styled.small`
  margin-top: 2px;
  color: var(--small-text-color);
`;

export const PostImage = styled.img`
  width: 652px;
  max-height: 458px;
  object-fit: cover;
  border-radius: 4px;

  @media (max-width: 768px) {
    width: 100%;
    min-height: 150px;
    max-height: 300px;
  }
`;

export const PostTitle = styled.h3`
  font-weight: normal;
  font-size: 20px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const PostContent = styled.p``;

export const PostButtons = styled.div`
  display: flex;
  font-size: 16px;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 12px;
  }
`;

export const Button = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--text-color);
  display: flex;
  align-items: center;
`;

export const Likes = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  height: 24px;
  min-width: 90px;
`;

export const Comments = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  .comment-text {
    color: var(--text-color);
  }
`;

export const CommentSection = styled.div`
  margin-top: 16px;
`;

export const AddComment = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  font-weight: 400;
  color: var(--text-color);
`;

export const AddCommentHeader = styled.div`
  font-size: 14px;
  font-weight: 400;
  display: flex;
  align-items: center;
  display: flex;
  justify-content: flex-start;
  gap: 8px;
`;

export const CommentTextarea = styled.textarea`
  width: 652px;
  height: 58px;
  background-color: var(--bg-color);
  border: 1px solid var(--border-color);
  font-family: inherit;
  color: var(--text-color);
  resize: none;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const AddCommentButton = styled.button<{ adding: string }>`
  width: 211px;
  height: 44px;
  color: var(--text-color);
  padding: 12px 48px;
  background-color: var(--footer-text-color);
  border: none;
  cursor: pointer;
  align-self: flex-start;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(var(--footer-text-color), 0.8);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    width: auto;
    padding: 8px 16px;
  }
`;

export const Spinner = styled.div`
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--footer-text-color);
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: ${spin} 1s linear infinite;
`;

const bounce = keyframes`
  0%   { transform: scale(1); }
  50%  { transform: scale(1.2); }
  100% { transform: scale(1); }
`;


export const AnimatedHeart = styled.div<{ animate: string }>`
  display: flex;
  align-self: center;
  cursor: pointer;
  transform-origin: center;
  animation: ${({ animate }) =>
    animate === 'true' ? css`${bounce} 0.4s ease` : 'none'};
`;