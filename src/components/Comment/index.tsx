'use client';

import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, IconButton, Box, useTheme } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { animated, useSpring, config } from '@react-spring/web';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { tokenApi } from '@/tokenApi';

const AnimatedPaper = animated(Paper);

interface CommentProps {
    id: number;
    authorId: number;
    text: string;
    edit?: (newText: string, id?: number) => void;
    deleteComm?: (id?: number) => void;
}

const Comment = React.memo(({ id, authorId, text, edit, deleteComm }: CommentProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(text);
    const { user } = useSelector((state: RootState) => state.auth);

    const fadeInSpring = useSpring({
        from: { opacity: 0, transform: 'translateY(-10px)' },
        to: { opacity: 1, transform: 'translateY(0)' },
        config: config.gentle,
    });

    const { data: author } = useQuery({
        queryKey: ['get-comment-author', authorId],
        queryFn: async () => {
            const response = await tokenApi.get(`/users/${authorId}`);
            return response;
        }
    });

    const editMutation = useMutation({
        mutationFn: async () => {
            const response = await tokenApi.put(`/comments/${id}`, { text: editText.trim() });
            return response;
        },
        onSuccess: (newComment) => {
            edit?.(newComment.text, id);
            setIsEditing(false);
        },
        onError: (error) => {
            console.log(error);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async () => {
            const response = await tokenApi.delete(`/comments/${id}`);
            return response;
        },
        onSuccess: () => {
            deleteComm?.(id);
        },
        onError: (error) => {
            console.log(error);
        }
    });


    const canModify = user?.id === authorId;

    const handleEdit = () => {
        if (canModify) {
            setIsEditing(true);
            setEditText(text);
        }
    };

    const handleSaveEdit = () => {
        if (editText.trim()) {
            editMutation.mutate();
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditText(text);
    };

    const handleDelete = () => { deleteMutation.mutate() };

    return (
        <AnimatedPaper
            elevation={0}
            sx={{
                p: 0,
                mb: '8px',
                bgcolor: 'transparent',
                maxWidth: 652,
                width: '100%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
                color: 'var(--text-color)'
            }}
            style={fadeInSpring}
        >
            {isEditing ? (
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                    }}
                >
                    <TextField
                        fullWidth
                        multiline
                        minRows={2}
                        maxRows={4}
                        size="small"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        sx={{
                            width: '100%',
                            height: 63,
                            bgcolor: 'var(--bg-color)',
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'var(--border-color)',
                                    borderWidth: '1px',
                                    borderRadius: 0,
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: 'var(--border-color)',
                                    borderWidth: '1px',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'var(--border-color)',
                                },
                            },
                            '& .MuiInputBase-input': {
                                color: 'var(--text-color)',
                            },
                        }}
                    />

                    <Box
                        sx={{
                            display: 'flex',
                            gap: 1,
                            width: '100%',
                        }}
                    >
                        <Button
                            onClick={handleCancelEdit}
                            sx={{
                                flex: 1,
                                height: 44,
                                bgcolor: 'var(--footer-text-color)',
                                border: 'none',
                                borderRadius: 0,
                                color: 'var(--text-color)',
                                textTransform: 'none',
                                py: 1.5,
                                px: 2,
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={!editText.trim()}
                            sx={{
                                flex: 1,
                                height: 44,
                                bgcolor: 'var(--footer-text-color)',
                                border: 'none',
                                borderRadius: 0,
                                color: 'var(--text-color)',
                                textTransform: 'none',
                                py: 1.5,
                                px: 2,
                            }}
                        >
                            Save
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ fontFamily: 'inherit', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                        <Typography component="span" fontWeight="bold" sx={{ mr: 0.5 }}>
                            {author?.firstName} {author?.secondName}:
                        </Typography>
                        {text}
                    </Typography>
                    <>
                        {canModify && (
                            <Box sx={{ display: 'flex', gap: '8px' }}>
                                <IconButton
                                    data-testid="edit-button"
                                    onClick={handleEdit}
                                    sx={{ color: 'var(--text-color)' }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    data-testid="delete-button"
                                    onClick={handleDelete}
                                    sx={{ color: 'var(--text-color)' }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        )}
                    </>
                </Box>
            )}
        </AnimatedPaper>
    );
});

export default Comment;
