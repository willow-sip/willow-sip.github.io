'use client';

import React, { useState } from 'react';
import { Paper, Typography, TextField, Button, IconButton, Box } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { tokenApi } from '@/tokenApi';
import { useTranslation } from 'react-i18next';
import { Important } from '@/svgs';


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
    const [focused, setFocused] = useState(false);
    const [editLength, setEditLength] = useState(text.length);
    const { user } = useSelector((state: RootState) => state.auth);
    const { t } = useTranslation();

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
        <Paper
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
                color: 'var(--text-color)',
            }}
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
                        onChange={(e) => {
                            setEditText(e.target.value);
                            setEditLength(e.target.value.length)
                        }}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        sx={{
                            width: '100%',
                            '& .MuiOutlinedInput-root': {
                                padding: 0,
                                border: 'none',
                                '& fieldset': {
                                    border: 'none',
                                },
                                '&:hover fieldset': {
                                    border: 'none',
                                },
                                '&.Mui-focused fieldset': {
                                    border: 'none',
                                },
                            },
                            '& .MuiInputBase-input': {
                                padding: '8px 10px',
                                color: 'var(--text-color)',
                            },
                        }}
                    />
                    {editLength > 0 && (
                        <div className={`helper ${editLength > 200 ? 'error' : (focused ? 'idle' : '')}`}>
                            <Important />
                            <p>
                                {editLength > 200
                                    ? t('lengthLimitSurpassed')
                                    : t('maxDescLength')}
                            </p>
                        </div>
                    )}

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
                                bgcolor: 'var(--accent)',
                                border: 'none',
                                borderRadius: 0,
                                color: 'var(--text-color)',
                                textTransform: 'none',
                                py: 1.5,
                                px: 2,
                                transition: '0.2s ease-in',
                                '&:hover': {
                                    bgcolor: 'var(--btn-hover)',
                                    transition: '0.2s ease-in',
                                }
                            }}
                        >
                            {t("cancelEdit")}
                        </Button>
                        <Button
                            onClick={handleSaveEdit}
                            disabled={!editText.trim() || editLength > 200}
                            sx={{
                                flex: 1,
                                height: 44,
                                bgcolor: 'var(--accent)',
                                border: 'none',
                                borderRadius: 0,
                                color: 'var(--text-color)',
                                textTransform: 'none',
                                py: 1.5,
                                px: 2,
                                transition: '0.2s ease-in',
                                '&:hover': {
                                    bgcolor: 'var(--btn-hover)',
                                    transition: '0.2s ease-in',
                                }
                            }}
                        >
                            {t("saveEdit")}
                        </Button>
                    </Box>
                </Box>
            ) : (
                <Box sx={{ fontFamily: 'inherit', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        </Paper>
    );
});

export default Comment;
