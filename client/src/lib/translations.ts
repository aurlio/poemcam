export const translations = {
  en: {
    // App Title
    appTitle: "PoemLens",
    
    // Welcome Section
    welcomeTitle: "Create Poetry from Photos",
    welcomeDescription: "Take a photo or upload an image, and our AI will craft a beautiful poem inspired by what it sees.",
    
    // Recent Poems Section
    recentCreationsTitle: "Recent Creations",
    noPoemsMessage: "No poems yet. Create your first poem by taking a photo!",
    share: "Share",
    viewAllPoems: "View All Poems",
    
    // How It Works Section
    howItWorksTitle: "How It Works",
    step1Title: "Capture or Upload",
    step1Description: "Take a photo with your camera or upload from your gallery",
    step2Title: "AI Analysis",
    step2Description: "Our AI analyzes the image and understands its essence",
    step3Title: "Poetry Creation",
    step3Description: "Receive a beautiful poem in English or Chinese",
    
    // Action Buttons
    takePhoto: "Take Photo",
    upload: "Upload",
    
    // Time formatting
    justNow: "Just now",
    hoursAgo: (hours: number) => `${hours} hour${hours > 1 ? 's' : ''} ago`,
    daysAgo: (days: number) => `${days} day${days > 1 ? 's' : ''} ago`,
    
    // Loading
    creatingPoem: "Creating Your Poem",
    analyzingImage: "Our AI is analyzing your image and crafting a beautiful poem...",
    
    // Poem Result Modal
    yourPoem: "Your Poem",
    sharePoem: "Share Poem",
    saveToFavorites: "Save to Favorites",
    removeFromFavorites: "Remove from Favorites",
    generateAnotherStyle: "Generate Another Style",
    
    // Toast Messages
    addedToFavorites: "Added to Favorites",
    removedFromFavorites: "Removed from Favorites",
    poemSavedToFavorites: "Poem saved to your favorites.",
    poemRemovedFromFavorites: "Poem removed from favorites.",
    copiedToClipboard: "Copied to Clipboard",
    poemCopiedToClipboard: "Poem copied to clipboard for sharing.",
    error: "Error",
    failedToUpdateFavorite: "Failed to update favorite status.",
    failedToCopyToClipboard: "Failed to copy poem to clipboard.",
    cameraError: "Camera Error",
    failedToCapturePhoto: "Failed to capture photo. Please try again.",
    cameraAccessDenied: "Camera Access Denied",
    allowCameraAccess: "Please allow camera access to take photos.",
    failedToGeneratePoem: "Failed to generate poem. Please try again."
  },
  zh: {
    // App Title
    appTitle: "诗镜",
    
    // Welcome Section
    welcomeTitle: "用照片创作诗歌",
    welcomeDescription: "拍摄照片或上传图片，我们的AI将为您创作一首美妙的诗歌。",
    
    // Recent Poems Section
    recentCreationsTitle: "最近创作",
    noPoemsMessage: "还没有诗歌。拍摄照片来创作您的第一首诗吧！",
    share: "分享",
    viewAllPoems: "查看所有诗歌",
    
    // How It Works Section
    howItWorksTitle: "使用方法",
    step1Title: "拍摄或上传",
    step1Description: "用相机拍照或从相册上传图片",
    step2Title: "AI分析",
    step2Description: "我们的AI分析图像并理解其本质",
    step3Title: "创作诗歌",
    step3Description: "获得一首美丽的中英文诗歌",
    
    // Action Buttons
    takePhoto: "拍照",
    upload: "上传",
    
    // Time formatting
    justNow: "刚刚",
    hoursAgo: (hours: number) => `${hours}小时前`,
    daysAgo: (days: number) => `${days}天前`,
    
    // Loading
    creatingPoem: "正在创作诗歌",
    analyzingImage: "我们的AI正在分析您的图片并创作一首美妙的诗歌...",
    
    // Poem Result Modal
    yourPoem: "您的诗歌",
    sharePoem: "分享诗歌",
    saveToFavorites: "收藏",
    removeFromFavorites: "取消收藏",
    generateAnotherStyle: "生成另一种风格",
    
    // Toast Messages
    addedToFavorites: "已添加到收藏",
    removedFromFavorites: "已从收藏中移除",
    poemSavedToFavorites: "诗歌已保存到您的收藏夹。",
    poemRemovedFromFavorites: "诗歌已从收藏夹中移除。",
    copiedToClipboard: "已复制到剪贴板",
    poemCopiedToClipboard: "诗歌已复制到剪贴板供分享。",
    error: "错误",
    failedToUpdateFavorite: "更新收藏状态失败。",
    failedToCopyToClipboard: "复制诗歌到剪贴板失败。",
    cameraError: "相机错误",
    failedToCapturePhoto: "拍照失败。请重试。",
    cameraAccessDenied: "相机访问被拒绝",
    allowCameraAccess: "请允许相机访问以拍摄照片。",
    failedToGeneratePoem: "生成诗歌失败。请重试。"
  }
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;

export function t(language: Language, key: TranslationKey, ...args: number[]): string {
  const translation = translations[language][key];
  
  if (typeof translation === 'function') {
    return translation(args[0]);
  }
  
  return translation as string;
}