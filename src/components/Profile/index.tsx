'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { showNotification } from '@/components/notify';
import { useTranslation } from 'react-i18next';
import { useForm, SubmitHandler, Resolver, FieldError, FieldErrors } from "react-hook-form";
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { logOut, updateUser } from '@/slices/authSlice';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import './style.css';
import { Envelope, Important, Pencil, Person } from '@/svgs';
import { tokenApi } from '@/tokenApi';
import Image from 'next/image';

interface FormInput {
    username: string;
    email: string;
    description?: string;
    profileImage: string;
    firstName?: string;
    secondName?: string;
}

const profileSchema = (t: (key: string) => string) => yup.object({
    username: yup.string().required(t('inputUsername')),
    email: yup.string().email(t('inputValidEmail')).required(t('inputEmail')),
    description: yup.string().max(200, t('descSize')).optional(),
    profileImage: yup.string().required(),
    firstName: yup.string().optional(),
    secondName: yup.string().optional(),
}).required();


const Profile = () => {
    const { theme, toggleTheme } = useTheme();
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewImage, setPreviewImage] = useState(user?.profileImage || './imgs/default-avatar.jpg');
    
    const router = useRouter();
    const { t } = useTranslation();

    const { handleSubmit, register, reset, formState: { errors, isSubmitting } } = useForm<FormInput>({
        mode: 'onChange',
        resolver: yupResolver(profileSchema(t)) as Resolver<FormInput>,
        defaultValues: {
            username: user?.username || '',
            email: user?.email || '',
            description: user?.description || '',
            profileImage: user?.profileImage || '/imgs/default-avatar.jpg',
            firstName: user?.firstName || '',
            secondName: user?.secondName || ''
        },
    });

    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setPreviewImage(url);
            return () => URL.revokeObjectURL(url);
        } else if (user?.profileImage) {
            setPreviewImage(user.profileImage);
        } else {
            setPreviewImage('/imgs/default-avatar.jpg');
        }
    }, [selectedFile, user?.profileImage]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showNotification(t('fileSizeExceeded'), 'error', 3000);
                return;
            }

            const fileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
            if (!fileTypes.includes(file.type)) {
                showNotification(t('invalidFileType'), 'error', 3000);
                return;
            }
            setSelectedFile(file);
        }
    };

    const updateUserRequest = useMutation({
        mutationFn: async (data: FormInput) => {
            const query = `
                mutation UpdateProfile($input: UpdateProfileInput!) {
                    updateProfile(input: $input) {
                        username
                        email
                        description
                        profileImage
                        firstName
                        secondName
                    }
                }
            `;
            
            const variables = { input: data };

            try {
                const response = await tokenApi.post('/graphql', { query, variables });
                return response.data.updateProfile;
            } catch (error) {
                console.error('Error updating profile:', error);
                showNotification(t('couldntUpdateProfile'), 'error', 2000);
                return [];
            }
        },
        onSuccess: (updatedUser) => {
            dispatch(updateUser(updatedUser));
            showNotification(t('updatedProfile'), 'success', 2000);
            reset({
                username: updatedUser.username,
                email: updatedUser.email,
                description: updatedUser.description,
                profileImage: updatedUser.profileImage
            });
        },
        onError: () => {
            showNotification(t('couldntUpdateProfile'), 'error', 2000);
            return;
        }
    });

    const onSubmit: SubmitHandler<FormInput> = async (data) => {
        try {
            updateUserRequest.mutate({
                ...data,
                profileImage: user?.profileImage || '/imgs/default-avatar.jpg',
                firstName: user?.firstName || '',
                secondName: user?.secondName || ''
            });
        } catch (err) {
            console.log('Couldnt update profile with error:', err);
            showNotification(t('couldntUpdateProfile'), 'error', 3000);
        }
    };

    const onError = (errors: FieldErrors<FormInput>) => {
        Object.values(errors).forEach(error => {
            if (error?.message) {
                showNotification(error.message.toString(), 'error', 3000);
            }
        });
    };

    return (
        <>
            <div className="profile" data-theme={theme}>
                <div className="edit-profile">
                    <h1>{t('editProfile')}</h1>

                    <form id="profile-form" onSubmit={handleSubmit(onSubmit, onError)}>
                        <div className="profile-header">
                            <Image
                                src={previewImage}
                                data-testid="profile-image-preview"
                                className="avatar"
                                alt="Profile"
                                width={64}
                                height={64}
                            />
                            <div className="profile-info">
                                <h3>{user?.firstName} {user?.secondName}</h3>
                                <label htmlFor="profileImage" className="change-photo">{t('changeProfilePhoto')}</label>
                                <input
                                    data-testid="change-photo"
                                    type="file"
                                    id="profileImage"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="username">
                                <Person />
                                <p>{t('username')}</p>
                            </label>
                            <input
                                data-testid="username"
                                type="text"
                                id="username"
                                placeholder="@username123"
                                {...register('username')}
                            />
                        </div>

                        <div className="form-group">                            
                            <label htmlFor="email">
                                <Envelope />
                                <p>{t('email')}</p>
                            </label>
                            <input
                                data-testid="email"
                                type="email"
                                id="email"
                                className={errors.email ? 'error' : 'idle'}
                                placeholder="email@domain.com"
                                {...register('email')}
                            />
                            {errors.email && (
                                <div className="helper error">
                                    <Important />
                                    <p>{t("invalidEmail")}</p>
                                </div>
                            )}
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
                            />
                            <div className={"helper " + (errors.description ? 'error' : 'idle')}>
                                <Important />
                                <p>
                                    {errors.description 
                                        ? t('lengthLimitSurpassed') 
                                        : t('maxDescLength', { max: 200 })}
                                </p>
                            </div>
                        </div>

                        <button data-testid="update-profile" type="submit" className="save-btn">{t('saveProfile')}</button>
                    </form>
                </div>
                <div className="preferences">
                    <h1> {t('preferencies')} </h1>
                    <div className="theme-toggle">
                        <label className="switch">
                            <input
                                data-testid="theme-toggle"
                                type="checkbox"
                                checked={theme === "dark"}
                                onChange={toggleTheme}
                            />
                            <span className="slider" />
                        </label>
                        <p>{t("darkTheme")}</p>
                    </div>
                    <h1>{t("actions")}</h1>
                    <button className="logout-button" onClick={() => {
                        dispatch(logOut());
                        router.push('/');
                    }}>{t("logout")}</button>
                </div>
            </div>
        </>
    );
};

export default Profile;