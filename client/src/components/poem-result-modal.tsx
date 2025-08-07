import { X, Share2, Heart, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Poem } from "@shared/schema";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PoemResultModalProps {
  isOpen: boolean;
  poem: Poem | null;
  language: 'en' | 'zh';
  onClose: () => void;
  onGenerateAnother: () => void;
}

export function PoemResultModal({ isOpen, poem, language, onClose, onGenerateAnother }: PoemResultModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorite, setIsFavorite] = useState(poem?.isFavorite || false);

  const favoriteMutation = useMutation({
    mutationFn: async (favorite: boolean) => {
      if (!poem) throw new Error('No poem available');
      const response = await apiRequest('PATCH', `/api/poems/${poem.id}/favorite`, { isFavorite: favorite });
      return response.json();
    },
    onSuccess: (updatedPoem) => {
      setIsFavorite(updatedPoem.isFavorite);
      queryClient.invalidateQueries({ queryKey: ['/api/poems'] });
      toast({
        title: updatedPoem.isFavorite ? "Added to Favorites" : "Removed from Favorites",
        description: updatedPoem.isFavorite ? "Poem saved to your favorites." : "Poem removed from favorites.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  });

  const handleShare = async () => {
    if (!poem) return;

    const currentPoem = language === 'zh' ? poem.poemChinese : poem.poemEnglish;
    const shareText = `${currentPoem}\n\nCreated with PoemLens - AI Poetry from Photos`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My AI-Generated Poem',
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Poem copied to clipboard for sharing.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy poem to clipboard.",
          variant: "destructive",
        });
      }
    }
  };

  const handleFavorite = () => {
    favoriteMutation.mutate(!isFavorite);
  };

  if (!isOpen || !poem) return null;

  const currentPoem = language === 'zh' ? poem.poemChinese : poem.poemEnglish;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" data-testid="poem-result-modal">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-poem-title">
            Your Poem
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-8 h-8 rounded-full"
            data-testid="button-close-poem"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {/* Photo preview */}
          <img 
            src={poem.imageUrl} 
            alt="User's photo" 
            className="w-full h-48 object-cover rounded-xl mb-6" 
            data-testid="img-poem-photo"
          />
          
          <div 
            className={`poem-text font-serif text-gray-800 dark:text-gray-200 text-lg leading-relaxed mb-6 ${
              language === 'zh' ? 'chinese-text' : ''
            }`}
            data-testid="text-poem-content"
          >
            <p className="italic whitespace-pre-line">
              {currentPoem}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleShare}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
              data-testid="button-share-poem"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Share Poem
            </Button>
            
            <Button
              onClick={handleFavorite}
              variant="outline"
              className="w-full py-3 rounded-xl font-medium transition-colors"
              disabled={favoriteMutation.isPending}
              data-testid="button-favorite-poem"
            >
              <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
              {isFavorite ? 'Remove from Favorites' : 'Save to Favorites'}
            </Button>
            
            <Button
              onClick={onGenerateAnother}
              className="w-full bg-secondary text-white py-3 rounded-xl font-medium hover:bg-secondary/90 transition-colors"
              data-testid="button-generate-another"
            >
              <Shuffle className="w-5 h-5 mr-2" />
              Generate Another Style
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
