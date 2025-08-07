import { useState, useRef } from "react";
import { Camera, Upload, BookOpen, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Poem } from "@shared/schema";
import { useCamera } from "@/hooks/use-camera";
import { CameraModal } from "@/components/camera-modal";
import { LoadingModal } from "@/components/loading-modal";
import { PoemResultModal } from "@/components/poem-result-modal";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState<Poem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isOpen: isCameraOpen,
    videoRef,
    openCamera,
    closeCamera,
    capturePhoto,
    flipCamera
  } = useCamera();

  // Fetch recent poems
  const { data: poems = [], isLoading: poemsLoading } = useQuery<Poem[]>({
    queryKey: ['/api/poems'],
  });

  // Create poem mutation
  const createPoemMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('language', language);
      
      const response = await apiRequest('POST', '/api/poems/analyze', formData);
      return response.json();
    },
    onSuccess: (poem) => {
      setIsLoading(false);
      setSelectedPoem(poem);
      queryClient.invalidateQueries({ queryKey: ['/api/poems'] });
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to generate poem. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCameraCapture = async () => {
    try {
      const file = await capturePhoto();
      closeCamera();
      setIsLoading(true);
      createPoemMutation.mutate(file);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      createPoemMutation.mutate(file);
    }
  };

  const handleCameraOpen = async () => {
    try {
      await openCamera();
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to take photos.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (poem: Poem) => {
    const currentPoem = language === 'zh' ? poem.poemChinese : poem.poemEnglish;
    const shareText = `${currentPoem}\n\nCreated with PoemLens - AI Poetry from Photos`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI-Generated Poem',
          text: shareText,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen shadow-xl">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-effect border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white" data-testid="text-app-title">
              PoemLens
            </h1>
          </div>
          
          {/* Language Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={language === 'en' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('en')}
              className="px-3 py-1 text-sm font-medium"
              data-testid="button-language-en"
            >
              EN
            </Button>
            <Button
              variant={language === 'zh' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setLanguage('zh')}
              className="px-3 py-1 text-sm font-medium"
              data-testid="button-language-zh"
            >
              中文
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        {/* Welcome Section */}
        <div className="p-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2" data-testid="text-welcome-title">
            Create Poetry from Photos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed" data-testid="text-welcome-description">
            Take a photo or upload an image, and our AI will craft a beautiful poem inspired by what it sees.
          </p>
        </div>

        {/* Recent Poems Section */}
        <div className="px-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4" data-testid="text-recent-poems-title">
            Recent Creations
          </h3>
          
          {poemsLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 mb-4" />
                </div>
              ))}
            </div>
          ) : poems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400" data-testid="text-no-poems">
                No poems yet. Create your first poem by taking a photo!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {poems.slice(0, 3).map((poem) => (
                <Card key={poem.id} className="overflow-hidden" data-testid={`card-poem-${poem.id}`}>
                  <img 
                    src={poem.imageUrl} 
                    alt="Poem inspiration" 
                    className="w-full h-40 object-cover"
                    data-testid={`img-poem-thumbnail-${poem.id}`}
                  />
                  <CardContent className="p-4">
                    <div 
                      className={`poem-text font-serif text-gray-800 dark:text-gray-200 mb-3 ${
                        language === 'zh' ? 'chinese-text' : ''
                      }`}
                      data-testid={`text-poem-preview-${poem.id}`}
                    >
                      <p className="italic line-clamp-3">
                        {language === 'zh' ? poem.poemChinese : poem.poemEnglish}
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span data-testid={`text-poem-time-${poem.id}`}>
                        {formatTimeAgo(new Date(poem.createdAt))}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(poem)}
                        className="hover:text-primary transition-colors"
                        data-testid={`button-share-${poem.id}`}
                      >
                        <Share2 className="w-4 h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {poems.length > 3 && (
                <Button 
                  variant="outline" 
                  className="w-full py-3 rounded-xl"
                  data-testid="button-view-all-poems"
                >
                  View All Poems
                </Button>
              )}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="px-6 py-8 bg-gray-50 dark:bg-gray-800 mx-4 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center" data-testid="text-how-it-works-title">
            How It Works
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                1
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Capture or Upload</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Take a photo with your camera or upload from your gallery</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                2
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">AI Analysis</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Our AI analyzes the image and understands its essence</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                3
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Poetry Creation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Receive a beautiful poem in English or Chinese</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
        <div className="glass-effect border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex space-x-3">
            {/* Camera Button */}
            <Button
              onClick={handleCameraOpen}
              className="flex-1 bg-primary hover:bg-primary/90 text-white rounded-xl py-4 px-6 font-semibold shadow-lg transition-all"
              data-testid="button-camera"
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            
            {/* Upload Button */}
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-secondary hover:bg-secondary/90 text-white rounded-xl py-4 px-6 font-semibold shadow-lg transition-all"
              data-testid="button-upload"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        data-testid="input-file-upload"
      />

      {/* Modals */}
      <CameraModal
        isOpen={isCameraOpen}
        videoRef={videoRef}
        onClose={closeCamera}
        onCapture={handleCameraCapture}
        onFlip={flipCamera}
      />

      <LoadingModal isOpen={isLoading} />

      <PoemResultModal
        isOpen={!!selectedPoem}
        poem={selectedPoem}
        language={language}
        onClose={() => setSelectedPoem(null)}
        onGenerateAnother={() => {
          setSelectedPoem(null);
          // Could trigger re-analysis of the same image with different style
        }}
      />
    </div>
  );
}
