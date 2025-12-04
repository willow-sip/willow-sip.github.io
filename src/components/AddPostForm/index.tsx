'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { showNotification } from '@/components/notify';
import { useTranslation } from 'react-i18next';
import { Envelope, Important, Pencil, UploadFile } from '@/svgs';
import { useMutation } from '@tanstack/react-query';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { FieldErrors, useForm } from 'react-hook-form';
import { tokenApi } from '@/tokenApi';
import './style.css';

interface Props {
    close: () => void;
    postCreated: () => void;
}

interface FormInput {
    title: string;
    description: string;
}

const AddPostForm = ({ close, postCreated }: Props) => {
    const { theme } = useTheme();

    const [file, setFile] = useState<File | null>(null);
    const [focusedTitle, setFocusedTitle] = useState(false);
    const [focusedDesc, setFocusedDesc] = useState(false);
    const { t } = useTranslation();

    const addPostSchema = (t: (key: string) => string) => yup.object({
        title: yup.string().required(t('inputPostTitle')).max(100, t('maxTitleLength')),
        description: yup.string().required(t('inputPostDesc')).max(200, t("maxDescLength")),
    });

    const { handleSubmit, register, reset, formState: { errors, isSubmitting }, watch } = useForm<FormInput>({
        mode: 'onChange',
        resolver: yupResolver(addPostSchema(t)),
        defaultValues: {
            title: '',
            description: '',
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 10 * 1024 * 1024) {
                showNotification(t('fileSizeExceeded'), 'error', 3000);
                return;
            }

            const fileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!fileTypes.includes(selectedFile.type)) {
                showNotification(t('invalidFileType'), 'error', 3000);
                return;
            }

            setFile(selectedFile);
        }
    };

    const addPostLogic = async (data: FormInput) => {
        const response = await tokenApi.post('/posts', { title: data.title, content: data.description });
        return response;
    };

    const { mutate } = useMutation({
        mutationFn: addPostLogic,
        onSuccess: () => {
            showNotification(t('postCreated'), 'success', 3000);
            postCreated();
            reset();
            setFile(null);
            close();
        },
        onError: () => {
            showNotification(t('postNotCreated'), 'error', 3000);
        }
    });

    const onSubmit = (data: FormInput) => {
        mutate(data);
    };

    const onError = (errors: FieldErrors<FormInput>) => {
        Object.values(errors).forEach(error => {
            if (error?.message) {
                showNotification(error.message.toString(), 'error', 3000);
            }
        });
    };

    return (
        <div className="blur" data-theme={theme}>
            <div className="form-container">
                <div className="form-header">
                    <h2>{t('createNewPost')}</h2>
                    <button data-testid="close-form-btn" className="close-form-button" onClick={close}>×</button>
                </div>

                <form id="add-post" onSubmit={handleSubmit(onSubmit, onError)}>
                    <div className="form-group title">
                        <label htmlFor="postTitle">
                            <Envelope />
                            <p>{t('postTitle')}</p>
                        </label>
                        <input
                            data-testid="post-title"
                            id="postTitle"
                            type="text"
                            className={errors.title ? 'error' : ''}
                            placeholder={t('postTitlePlaceholder')}
                            {...register('title')}
                            onFocus={() => setFocusedTitle(true)}
                            onBlur={() => setFocusedTitle(false)}
                        />
                        <div className={"helper " + (errors.title ? 'error' : (focusedTitle ? 'idle' : ''))}>
                            <Important />
                            <p>
                                {errors.title ? t('lengthLimitSurpassed')
                                    : t('maxTitleLength', { max: 100 })}
                            </p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">
                            <Pencil />
                            <p>{t('description')}</p>
                        </label>
                        <textarea
                            data-testid="description"
                            id="description"
                            className={errors.description ? 'error' : 'idle'}
                            placeholder={t('descriptionPlaceholder')}
                            {...register('description')}
                            rows={4}
                            onFocus={() => setFocusedDesc(true)}
                            onBlur={() => setFocusedDesc(false)}
                        />
                        <div className={"helper " + (errors.description ? 'error' : (focusedDesc ? 'idle' : ''))}>
                            <Important />
                            <p>
                                {errors.description ? t('lengthLimitSurpassed')
                                    : t('maxDescLength', { max: 200 })}
                            </p>
                        </div>
                    </div>

                    <div className="upload-area">
                        <UploadFile />
                        <div className="upload-content">
                            <p>{file ? `Uploaded file: ${file.name}.` : t('uploadFile')}</p>
                            <p className="file-types">{t('fileTypes')}</p>
                        </div>
                        <input
                            data-testid="file-input"
                            type="file"
                            accept=".jpg,.png,.pdf"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                    </div>
                    <div className="create-post-container">
                        <button data-testid="create-post-btn" type="submit" className="create-btn">{t('create')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPostForm;