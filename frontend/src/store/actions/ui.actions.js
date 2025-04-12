import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
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
} from '../reducers/ui.reducer';

// Sidebar actions
export const toggleSidebarAction = createAction('ui/toggleSidebar', () => {
  return { payload: undefined };
});

export const setSidebarOpenAction = createAction('ui/setSidebarOpen', (isOpen) => {
  return { payload: isOpen };
});

// Dark mode actions
export const toggleDarkModeAction = createAction('ui/toggleDarkMode', () => {
  return { payload: undefined };
});

export const setDarkModeAction = createAction('ui/setDarkMode', (isDark) => {
  return { payload: isDark };
});

// Notification actions
export const addNotificationAction = createAction('ui/addNotification', (notification) => {
  const id = notification.id || Date.now().toString();
  return {
    payload: {
      id,
      type: notification.type || 'info',
      message: notification.message,
      duration: notification.duration !== undefined ? notification.duration : 5000
    }
  };
});

export const removeNotificationAction = createAction('ui/removeNotification', (id) => {
  return { payload: id };
});

export const clearNotificationsAction = createAction('ui/clearNotifications', () => {
  return { payload: undefined };
});

// Modal actions
export const openModalAction = createAction('ui/openModal', ({ content, title, size }) => {
  return {
    payload: {
      content,
      title,
      size
    }
  };
});

export const closeModalAction = createAction('ui/closeModal', () => {
  return { payload: undefined };
});

// Set theme
export const changeTheme = createAsyncThunk(
  'ui/changeTheme',
  async (theme, { dispatch }) => {
    dispatch(setTheme(theme));
    localStorage.setItem('theme', theme);
    return theme;
  }
);

// Toggle sidebar
export const toggleSidebarVisibility = createAsyncThunk(
  'ui/toggleSidebarVisibility',
  async (_, { dispatch }) => {
    dispatch(toggleSidebar());
    return true;
  }
);

// Set sidebar open state
export const setSidebarVisibility = createAsyncThunk(
  'ui/setSidebarVisibility',
  async (isOpen, { dispatch }) => {
    dispatch(setSidebarOpen(isOpen));
    return isOpen;
  }
);

// Show modal
export const openModal = createAsyncThunk(
  'ui/openModal',
  async ({ type, data = null }, { dispatch }) => {
    dispatch(showModal({ type, data }));
    return { type, data };
  }
);

// Hide modal
export const closeModal = createAsyncThunk(
  'ui/closeModal',
  async (_, { dispatch }) => {
    dispatch(hideModal());
    return true;
  }
);

// Show toast notification
export const displayToast = createAsyncThunk(
  'ui/displayToast',
  async ({ message, type = 'info', duration = 5000 }, { dispatch }) => {
    dispatch(showToast({ message, type, duration }));
    
    // Auto-hide the toast after the specified duration
    setTimeout(() => {
      dispatch(hideToast());
    }, duration);
    
    return { message, type, duration };
  }
);

// Close toast
export const closeToast = createAsyncThunk(
  'ui/closeToast',
  async (_, { dispatch }) => {
    dispatch(hideToast());
    return true;
  }
);

// Add notification
export const createNotification = createAsyncThunk(
  'ui/createNotification',
  async (notification, { dispatch }) => {
    dispatch(addNotification(notification));
    return notification;
  }
);

// Remove notification
export const deleteNotification = createAsyncThunk(
  'ui/deleteNotification',
  async (id, { dispatch }) => {
    dispatch(removeNotification(id));
    return id;
  }
);

// Mark notification as read
export const readNotification = createAsyncThunk(
  'ui/readNotification',
  async (id, { dispatch }) => {
    dispatch(markNotificationAsRead(id));
    return id;
  }
);

// Mark all notifications as read
export const readAllNotifications = createAsyncThunk(
  'ui/readAllNotifications',
  async (_, { dispatch }) => {
    dispatch(markAllNotificationsAsRead());
    return true;
  }
);

// Update search query
export const updateSearchQuery = createAsyncThunk(
  'ui/updateSearchQuery',
  async (query, { dispatch }) => {
    dispatch(setSearchQuery(query));
    return query;
  }
);

// Change view mode
export const changeViewMode = createAsyncThunk(
  'ui/changeViewMode',
  async (mode, { dispatch }) => {
    dispatch(setViewMode(mode));
    localStorage.setItem('viewMode', mode);
    return mode;
  }
);

// Change sort order
export const changeSortBy = createAsyncThunk(
  'ui/changeSortBy',
  async (sortBy, { dispatch }) => {
    dispatch(setSortBy(sortBy));
    return sortBy;
  }
);

// Set mobile state
export const detectMobileState = createAsyncThunk(
  'ui/detectMobileState',
  async (isMobile, { dispatch }) => {
    dispatch(setIsMobile(isMobile));
    return isMobile;
  }
);

// Add navigation history item
export const addNavHistoryItem = createAsyncThunk(
  'ui/addNavHistoryItem',
  async (item, { dispatch }) => {
    dispatch(addToNavHistory(item));
    return item;
  }
);

// Clear navigation history
export const resetNavHistory = createAsyncThunk(
  'ui/resetNavHistory',
  async (_, { dispatch }) => {
    dispatch(clearNavHistory());
    return true;
  }
);
