import { PrismaClient, User, Movie, Review, Genre } from '@prisma/client';
import { InsertUser, InsertMovie, InsertReview, InsertWatchlist } from '@shared/schema';
import { tmdbService } from './services/tmdb';

const prisma = new PrismaClient();

// Helper function to map TMDB genre IDs to your Genre enum
const mapTmdbGenreToEnum = (genreId: number): Genre | undefined => {
  const genreMap: { [key: number]: Genre } = {
    28: 'ACTION',
    12: 'ADVENTURE',
    16: 'ANIMATION',
    35: 'COMEDY',
    80: 'CRIME',
    99: 'DOCUMENTARY',
    18: 'DRAMA',
    10751: 'FAMILY',
    14: 'FANTASY',
    36: 'HISTORY',
    27: 'HORROR',
    10402: 'MUSIC',
    9648: 'MYSTERY',
    10749: 'ROMANCE',
    878: 'SCIENCE_FICTION',
    53: 'THRILLER',
    10752: 'WAR',
    37: 'WESTERN',
  };
  return genreMap[genreId];
};


export class Storage {
  // User methods
  async createUser(user: InsertUser): Promise<User> {
    return prisma.user.create({ data: user });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { username } });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async getUser(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  // Movie methods
  async createMovie(movie: InsertMovie): Promise<Movie> {
    return prisma.movie.create({ data: movie });
  }

  async getMovieByTmdbId(tmdbId: number): Promise<Movie | null> {
    return prisma.movie.findUnique({ where: { tmdbId } });
  }

  async getMovies(params: { search?: string; genre?: string; year?: number; minRating?: number; sort?: 'title' | 'year' | 'rating' | 'reviews'; page?: number; limit?: number; }): Promise<{ movies: Movie[], total: number }> {
    const { search, genre, year, minRating, sort, page = 1, limit = 20 } = params;
    const where: any = {};
    if (search) where.title = { contains: search, mode: 'insensitive' };
    if (genre) where.genres = { has: genre as Genre };
    if (year) where.releaseYear = year;
    if (minRating) where.averageRating = { gte: minRating };

    // Map frontend sort param names to actual Prisma model field names
    const sortFieldMap: Record<string, string> = {
      title: 'title',
      year: 'releaseYear',
      rating: 'averageRating',
      reviews: 'reviewCount',
    };
    const orderByField = sortFieldMap[sort || 'title'] || 'title';

    const movies = await prisma.movie.findMany({
      where,
      orderBy: { [orderByField]: sort === 'rating' || sort === 'reviews' ? 'desc' : 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.movie.count({ where });
    return { movies, total };
  }

  async getFeaturedMovies(): Promise<Movie[]> {
    const featuredMovies = await tmdbService.getFeaturedMovies();
    for (const movie of featuredMovies) {
      const movieDetails = await tmdbService.getMovieDetails(movie.id);
      const movieData = {
        tmdbId: movie.id,
        title: movie.title,
        synopsis: movie.overview,
        director: movieDetails.credits.crew.find(c => c.job === 'Director')?.name || '',
        cast: movieDetails.credits.cast.map(c => c.name).slice(0, 10),
        genres: movie.genre_ids.map(mapTmdbGenreToEnum).filter((g) => g !== undefined) as Genre[],
        releaseYear: new Date(movie.release_date).getFullYear(),
        duration: movieDetails.runtime,
        posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
        trailerUrl: movieDetails.videos.results.find(v => v.type === 'Trailer')?.key || '',
        averageRating: movie.vote_average / 2,
        featured: true,
      };
      // Use upsert to avoid P2002 unique constraint crash when a movie already exists
      await prisma.movie.upsert({
        where: { tmdbId: movie.id },
        create: { ...movieData, trending: false },
        update: { featured: true },
      });
    }
    return prisma.movie.findMany({ where: { featured: true } });
  }

  async getTrendingMovies(): Promise<Movie[]> {
    const trendingMovies = await tmdbService.getTrendingMovies();
    for (const movie of trendingMovies) {
      const movieDetails = await tmdbService.getMovieDetails(movie.id);
      const movieData = {
        tmdbId: movie.id,
        title: movie.title,
        synopsis: movie.overview,
        director: movieDetails.credits.crew.find(c => c.job === 'Director')?.name || '',
        cast: movieDetails.credits.cast.map(c => c.name).slice(0, 10),
        genres: movie.genre_ids.map(mapTmdbGenreToEnum).filter((g) => g !== undefined) as Genre[],
        releaseYear: new Date(movie.release_date).getFullYear(),
        duration: movieDetails.runtime,
        posterUrl: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
        trailerUrl: movieDetails.videos.results.find(v => v.type === 'Trailer')?.key || '',
        averageRating: movie.vote_average / 2,
        trending: true,
      };
      // Use upsert to avoid P2002 unique constraint crash when a movie already exists
      await prisma.movie.upsert({
        where: { tmdbId: movie.id },
        create: { ...movieData, featured: false },
        update: { trending: true },
      });
    }
    return prisma.movie.findMany({ where: { trending: true } });
  }

  async getMovie(id: string): Promise<(Movie & { reviews: (Review & { user: Pick<User, 'id' | 'username' | 'profilePicture'> })[] }) | null> {
    return prisma.movie.findUnique({ where: { id }, include: { reviews: { include: { user: { select: { id: true, username: true, profilePicture: true } } } } } });
  }

  // Review methods
  async getReviews(movieId: string): Promise<Review[]> {
    return prisma.review.findMany({ where: { movieId } });
  }

  async createReview(review: InsertReview): Promise<Review> {
    return prisma.review.create({ data: review });
  }

  async updateReview(id: string, updates: Partial<InsertReview>): Promise<Review | null> {
    return prisma.review.update({ where: { id }, data: updates });
  }

  async deleteReview(id: string): Promise<boolean> {
    await prisma.review.delete({ where: { id } });
    return true;
  }

  async likeReview(id: string): Promise<boolean> {
    await prisma.review.update({ where: { id }, data: { likes: { increment: 1 } } });
    return true;
  }

  async getUserReviews(userId: string): Promise<Review[]> {
    return prisma.review.findMany({ where: { userId } });
  }

  // Watchlist methods
  async getUserWatchlist(userId: string): Promise<any[]> {
    return prisma.watchlist.findMany({ where: { userId }, include: { movie: true } });
  }

  async addToWatchlist(watchlistData: InsertWatchlist): Promise<any> {
    return prisma.watchlist.create({ data: watchlistData });
  }

  async removeFromWatchlist(userId: string, movieId: string): Promise<boolean> {
    await prisma.watchlist.deleteMany({ where: { userId, movieId } });
    return true;
  }
}
