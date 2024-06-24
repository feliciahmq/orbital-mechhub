import { create } from 'zustand';
import { useUserStore } from './userStore';

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,
    changeChat: (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;
        console.log('Current User:', currentUser);
        console.log('Selected User:', user);

        // Check if currentUser and user are defined and have the blocked property
        if (!currentUser || !Array.isArray(currentUser.blocked)) {
            console.error('Current user is undefined or does not have a blocked property');
            return;
        }

        if (!user || !Array.isArray(user.blocked)) {
            console.error('User is undefined or does not have a blocked property');
            return;
        }


        // Check if current user is blocked
        if (user.blocked.includes(currentUser.id)) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        }
        // Check if receiver is blocked
        else if (currentUser.blocked.includes(user.id)) {
            return set({
                chatId,
                user: user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        } else {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
    },

    changeBlock: () => {
        set(state => ({...state, isReceiverBlocked: !state.isReceiverBlocked}))
    },

}));