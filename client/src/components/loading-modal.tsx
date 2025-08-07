interface LoadingModalProps {
  isOpen: boolean;
}

export function LoadingModal({ isOpen }: LoadingModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center" data-testid="loading-modal">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mx-4 max-w-sm w-full text-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" data-testid="loading-spinner" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2" data-testid="text-loading-title">
          Creating Your Poem
        </h3>
        <p className="text-gray-600 dark:text-gray-400" data-testid="text-loading-description">
          Our AI is analyzing your image and crafting a beautiful poem...
        </p>
      </div>
    </div>
  );
}
