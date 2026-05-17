import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewCard } from "@/components/reviews/review-card";
import { MovieCard } from "@/components/movies/movie-card";
import { 
  User, 
  Calendar, 
  Star, 
  Film, 
  ArrowLeft,
  BookmarkIcon
} from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/auth/auth-context";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { ReviewWithUser } from "@shared/schema";
import { datetime } from "drizzle-orm/mysql-core";

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isOwnProfile = currentUser?.id === id;

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/users", id],
    queryFn: () => api.getUser(id!),
    enabled: !!id,
  });

  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["/api/users", id, "reviews"],
    queryFn: () => api.getUserReviews(id!),
    enabled: !!id,
  });

  const { data: watchlist = [], isLoading: watchlistLoading } = useQuery({
    queryKey: ["/api/users", id, "watchlist"],
    queryFn: () => api.getUserWatchlist(id!),
    enabled: !!id && isOwnProfile, // Only load watchlist for own profile
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (movieId: string) => api.removeFromWatchlist(id!, movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", id, "watchlist"] });
      toast({
        title: "Success",
        description: "Movie removed from watchlist",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove movie from watchlist",
        variant: "destructive",
      });
    },
  });

  const handleRemoveFromWatchlist = (movieId: string) => {
    if (window.confirm("Are you sure you want to remove this movie from your watchlist?")) {
      removeFromWatchlistMutation.mutate(movieId);
    }
  };

  if (userError) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">User Not Found</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, we couldn't find the user you're looking for.
            </p>
            <Link href="/">
              <Button data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-card rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-card rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-6">
            <Avatar className="w-24 h-24" data-testid="profile-avatar">
              <AvatarImage src={user.profilePicture || undefined} />
              <AvatarFallback className="text-2xl">
                {user.username.charAt(0).toUpperCase()||"?"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2" data-testid="profile-username">
                {user.username}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span data-testid="profile-join-date">
                    Joined {user.joinDate
                      ? `Joined ${formatDistanceToNow(new Date(user.joinDate), { addSuffix: true })}`
                      : "Join date unknown"}
                  </span>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground" data-testid="stats-reviews">
                    {reviews.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Reviews</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground flex items-center justify-center space-x-1">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span data-testid="stats-average-rating">{averageRating}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </div>
                
                {isOwnProfile && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground" data-testid="stats-watchlist">
                      {watchlist.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Watchlist</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="reviews" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="reviews" data-testid="tab-reviews">
              <Film className="w-4 h-4 mr-2" />
              Reviews ({reviews.length})
            </TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="watchlist" data-testid="tab-watchlist">
                <BookmarkIcon className="w-4 h-4 mr-2" />
                Watchlist ({watchlist.length})
              </TabsTrigger>
            )}
          </TabsList>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="mt-6">
            {reviewsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-background rounded-lg p-4">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg" data-testid="no-reviews">
                <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">
                  {isOwnProfile ? "You haven't written any reviews yet." : `${user.username} hasn't written any reviews yet.`}
                </p>
                {isOwnProfile && (
                  <p className="text-sm text-muted-foreground">
                    Start exploring movies and share your thoughts!
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-6" data-testid="reviews-list">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-card rounded-lg p-4">
                    {/* Movie Info Header */}
                    <Link href={`/movie/${review.movie.id}`}>
                      <div className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity">
                        <img 
                          src={review.movie.posterUrl} 
                          alt={`${review.movie.title} poster`}
                          className="w-12 h-16 rounded object-cover"
                        />
                        <div>
                          <h4 className="font-medium text-foreground">{review.movie.title}</h4>
                          <Badge variant="outline" className="text-xs">Review</Badge>
                        </div>
                      </div>
                    </Link>
                    
                    {/* Review Content */}
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Watchlist Tab (Only for own profile) */}
          {isOwnProfile && (
  <TabsContent value="watchlist" className="mt-6">
    {watchlistLoading ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    ) : watchlist.length === 0 ? (
      <div className="text-center py-12 bg-card rounded-lg" data-testid="no-watchlist">
        <BookmarkIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-2">Your watchlist is empty.</p>
        <p className="text-sm text-muted-foreground mb-4">
          Add movies to your watchlist to keep track of what you want to watch!
        </p>
        <Link href="/movies">
          <Button data-testid="button-browse-movies">Browse Movies</Button>
        </Link>
      </div>
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6" data-testid="watchlist-grid">
        {watchlist.map((item) => {
          // Map internal Movie -> MovieCard props
          const movieCardProps = {
            id: Number(item.movie.id),
            title: item.movie.title,
            overview: item.movie.synopsis ?? "",
            poster_path: item.movie.posterUrl 
              ? item.movie.posterUrl.replace(/^https?:\/\/image\.tmdb\.org\/t\/p\/w500/, "") // strip if full URL
              : null,
            backdrop_path: item.movie.backdropUrl 
              ? item.movie.backdropUrl.replace(/^https?:\/\/image\.tmdb\.org\/t\/p\/w780/, "")
              : null,
            release_date: item.movie.releaseYear ? `${item.movie.releaseYear}-01-01` : null,
            vote_average: item.movie.averageRating ? Number(item.movie.averageRating) : 0,
            genre_ids: [], // you can map these later if you want
            };



          return (
            <div key={item.id} className="relative group">
              <MovieCard movie={movieCardProps} />
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveFromWatchlist(item.movieId)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`remove-${item.movieId}`}
              >
                Remove
              </Button>
            </div>
          );
        })}
      </div>
    )}
  </TabsContent>
)}
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
