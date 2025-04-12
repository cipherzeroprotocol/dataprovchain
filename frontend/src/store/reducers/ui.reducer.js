import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light',
  sidebarOpen: true,
  notifications: [],
  modal: {
    open: false,
    type: null,
    data: null
  },
  toast: {
    open: false,
    message: '',
    type: 'info',
    duration: 5000
  },
  searchQuery: '',
  viewMode: 'grid',
  sortBy: 'newest',
  isMobile: false,
  navHistory: []
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    showModal: (state, action) => {
      state.modal = {
        open: true,
        type: action.payload.type,
        data: action.payload.data || null
      };
    },
    hideModal: (state) => {
      state.modal = {
        ...state.modal,
        open: false
      };
    },
    showToast: (state, action) => {
      state.toast = {
        open: true,
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000
      };
    },
    hideToast: (state) => {
      state.toast = {
        ...state.toast,
        open: false
      };
    },
    addNotification: (state, action) => {
      const notificationId = Date.now().toString();
      state.notifications = [
        {
          id: notificationId,
          read: false,
          timestamp: new Date().toISOString(),
          ...action.payload
        },
        ...state.notifications
      ];
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
    },
    markNotificationAsRead: (state, action) => {
      state.notifications = state.notifications.map(notification =>
        notification.id === action.payload
          ? { ...notification, read: true }
          : notification
      );
    },
    markAllNotificationsAsRead: (state) => {
      state.notifications = state.notifications.map(notification => ({
        ...notification,
        read: true
      }));
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
    addToNavHistory: (state, action) => {
      state.navHistory = [action.payload, ...state.navHistory.slice(0, 9)];
    },
    clearNavHistory: (state) => {
      state.navHistory = [];
    }
  }
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  showModal,
  hideModal,
  showToast,
  hideToast,
  addNotification,
  removeNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  setSearchQuery,
  setViewMode,
  setSortBy,
  setIsMobile,
  addToNavHistory,
  clearNavHistory
} = uiSlice.actions;

export default uiSlice.reducer;