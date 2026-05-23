import { Storage } from "./storage";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function seed(storage: Storage) {
  // 1. Seed Users (all with password: password123 hashed)
  const passwordHash = await bcrypt.hash("password123", 10);
  
  const usersToSeed = [
    {
      username: "default",
      email: "default@example.com",
      password: passwordHash,
      profilePicture: "https://i.pravatar.cc/150?u=default",
    },
    {
      username: "stacey_fakename",
      email: "stacey.fakename@example.com",
      password: passwordHash,
      profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=stacey",
    },
    {
      username: "nautreal_pearson",
      email: "nautreal.pearson@example.com",
      password: passwordHash,
      profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=nautreal",
    },
    {
      username: "arthur_pendelton",
      email: "arthur.pendelton@example.com",
      password: passwordHash,
      profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=arthur",
    },
    {
      username: "elena_rostova",
      email: "elena.rostova@example.com",
      password: passwordHash,
      profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=elena",
    },
    {
      username: "marcus_aurelius",
      email: "marcus.aurelius@example.com",
      password: passwordHash,
      profilePicture: "https://api.dicebear.com/7.x/adventurer/svg?seed=marcus",
    },
  ];

  const seededUsers: Record<string, string> = {}; // username -> id

  for (const userData of usersToSeed) {
    let user = await prisma.user.findUnique({
      where: { username: userData.username },
    });
    if (!user) {
      user = await prisma.user.create({
        data: userData,
      });
    }
    seededUsers[userData.username] = user.id;
  }

  // 2. Seed Movies
  const movies = [
    {
      tmdbId: 27205,
      title: "Inception",
      synopsis: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      director: "Christopher Nolan",
      cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
      genres: ["ACTION", "ADVENTURE", "SCIENCE_FICTION"] as const,
      releaseYear: 2010,
      duration: 148,
      posterUrl: "/inception.jpg",
      featured: true,
      trending: false,
      backdropUrl: "",
      trailerUrl: "",
    },
    {
      tmdbId: 278,
      title: "The Shawshank Redemption",
      synopsis: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      director: "Frank Darabont",
      cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
      genres: ["DRAMA"] as const,
      releaseYear: 1994,
      duration: 142,
      posterUrl: "/shawshank.jpg",
      trending: true,
      featured: false,
      backdropUrl: "",
      trailerUrl: "",
    },
    {
      tmdbId: 155,
      title: "The Dark Knight",
      synopsis: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham.",
      director: "Christopher Nolan",
      cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
      genres: ["ACTION", "CRIME", "DRAMA"] as const,
      releaseYear: 2008,
      duration: 152,
      posterUrl: "/dark_knight.jpg",
      featured: true,
      trending: false,
      backdropUrl: "",
      trailerUrl: "",
    },
  ];

  const seededMovies: Record<number, string> = {}; // tmdbId -> id

  for (const movieData of movies) {
    let movie = await prisma.movie.findUnique({
      where: { tmdbId: movieData.tmdbId },
    });
    if (!movie) {
      movie = await prisma.movie.create({
        data: movieData,
      });
    }
    seededMovies[movieData.tmdbId] = movie.id;
  }

  // 3. Define the Reviews to Seed (10 per movie, distributed among our profiles)
  const reviewsToSeed = [
    // --- The Shawshank Redemption (tmdbId: 278) ---
    {
      tmdbId: 278,
      username: "stacey_fakename",
      rating: 5,
      title: "An absolute masterpiece of cinema",
      content: "This is a film that was not only incredibly well acted but it has such a profound meaning. It teaches us about hope and what it means to be truly free. Tim Robbins and Morgan Freeman are perfect.",
    },
    {
      tmdbId: 278,
      username: "stacey_fakename",
      rating: 5,
      title: "The definition of a perfect film",
      content: "There is no doubt that this is one of the best movies ever made. The story of Andy Dufresne's struggle and his friendship with Red is timeless and inspiring. I can watch it again and again.",
    },
    {
      tmdbId: 278,
      username: "nautreal_pearson",
      rating: 5,
      title: "Unforgettable, emotional, and inspiring",
      content: "A slow, deep, and highly emotional story of perseverance. The narration by Morgan Freeman adds so much weight to the story. The ending scene is one of the most beautiful in history.",
    },
    {
      tmdbId: 278,
      username: "nautreal_pearson",
      rating: 5,
      title: "A beautiful message of hope",
      content: "Some birds aren't meant to be caged, and Andy Dufresne was definitely one of them. This movie does an amazing job depicting the harsh reality of prison while keeping the theme of hope alive.",
    },
    {
      tmdbId: 278,
      username: "arthur_pendelton",
      rating: 5,
      title: "Lived up to all the hype",
      content: "I can't believe it took me so long to watch this film. The pacing is deliberate, the acting is top-notch, and the script is brilliant. It completely deserves its spot as the top movie.",
    },
    {
      tmdbId: 278,
      username: "arthur_pendelton",
      rating: 5,
      title: "Phenomenal character development",
      content: "The relationship between Andy and Red is the core of the film. Watching their friendship grow over the decades in such a bleak environment was incredibly touching and well portrayed.",
    },
    {
      tmdbId: 278,
      username: "elena_rostova",
      rating: 5,
      title: "Masterful directing and acting",
      content: "This movie is a masterpiece in every sense of the word. The cinematography, the directing by Frank Darabont, the score—everything is flawlessly put together to tell a perfect story.",
    },
    {
      tmdbId: 278,
      username: "elena_rostova",
      rating: 5,
      title: "A timeless classic that everyone must see",
      content: "The Shawshank Redemption is a powerful movie about the human spirit. It is filled with iconic lines and scenes that will stay with you forever. Get busy living, or get busy dying.",
    },
    {
      tmdbId: 278,
      username: "marcus_aurelius",
      rating: 5,
      title: "A triumph of the human spirit",
      content: "A deeply moving film that manages to be inspiring without being overly sentimental. It shows that even in the worst conditions, a person can maintain their dignity and hope.",
    },
    {
      tmdbId: 278,
      username: "marcus_aurelius",
      rating: 5,
      title: "Satisfying from start to finish",
      content: "An outstanding movie. The cinematography is beautiful and the acting by the entire cast is great. The climax is one of the most satisfying and cathartic moments in film history.",
    },

    // --- The Dark Knight (tmdbId: 155) ---
    {
      tmdbId: 155,
      username: "stacey_fakename",
      rating: 5,
      title: "Transcends the superhero genre",
      content: "The Dark Knight is a spectacular superhero film that transcends the genre. Heath Ledger's performance as the Joker is legendary and absolutely mesmerizing. He completely steals the show.",
    },
    {
      tmdbId: 155,
      username: "stacey_fakename",
      rating: 5,
      title: "A gripping and dark crime masterpiece",
      content: "Christopher Nolan created a dark, gritty, and complex crime thriller that happens to feature Batman. The acting is superb, and the pacing is relentless from the opening scene.",
    },
    {
      tmdbId: 155,
      username: "nautreal_pearson",
      rating: 5,
      title: "The gold standard of comic book movies",
      content: "This is easily the best comic book movie ever made. The story is intelligent, the action sequences are incredible, and the conflict between Batman and the Joker is legendary.",
    },
    {
      tmdbId: 155,
      username: "nautreal_pearson",
      rating: 5,
      title: "Heath Ledger's legendary performance",
      content: "Heath Ledger's Joker is a masterclass in acting. He is chaotic, terrifying, and deeply compelling. His performance makes the movie an absolute masterpiece of modern cinema.",
    },
    {
      tmdbId: 155,
      username: "arthur_pendelton",
      rating: 5,
      title: "Flawless cast and screenplay",
      content: "A perfect film with a stellar cast. Christian Bale is great as a conflicted Batman, Aaron Eckhart shines as Harvey Dent, and Gary Oldman is perfect. The script is brilliant.",
    },
    {
      tmdbId: 155,
      username: "arthur_pendelton",
      rating: 5,
      title: "Intense atmosphere and deep themes",
      content: "The score by Hans Zimmer is intense and elevates every scene. The film handles complex moral dilemmas about security, chaos, and heroism in a very mature and engaging way.",
    },
    {
      tmdbId: 155,
      username: "elena_rostova",
      rating: 5,
      title: "An action-packed, thrilling ride",
      content: "I was completely blown away by this film. It is a dense, high-stakes thriller that doesn't hold back. The cinematography of Gotham is stunning and the action is amazing.",
    },
    {
      tmdbId: 155,
      username: "elena_rostova",
      rating: 5,
      title: "Nolan at his absolute best",
      content: "A masterpiece of directing. Nolan's vision is executed flawlessly. The pacing, the sound design, the editing—everything works together to create an unforgettable experience.",
    },
    {
      tmdbId: 155,
      username: "marcus_aurelius",
      rating: 5,
      title: "Sets a benchmark for sequels",
      content: "The Dark Knight is a rare sequel that far surpasses the original. It is a smart, complex, and dark film that sets a benchmark that few movies have ever come close to reaching.",
    },
    {
      tmdbId: 155,
      username: "marcus_aurelius",
      rating: 5,
      title: "Holds up perfectly over time",
      content: "A true classic. It has everything you could want in a film: drama, action, great performances, and a memorable villain. It holds up incredibly well on multiple viewings.",
    },

    // --- Inception (tmdbId: 27205) ---
    {
      tmdbId: 27205,
      username: "stacey_fakename",
      rating: 5,
      title: "A mind-bending sci-fi masterpiece",
      content: "Inception is a mind-bending masterpiece that keeps you guessing until the very end. The concept of dream sharing is brilliant and executed with absolute precision.",
    },
    {
      tmdbId: 27205,
      username: "stacey_fakename",
      rating: 5,
      title: "Visually stunning and narratively complex",
      content: "Christopher Nolan does it again. Inception is a visual marvel with an incredibly complex and engaging story. Leonardo DiCaprio is fantastic as the lead.",
    },
    {
      tmdbId: 27205,
      username: "nautreal_pearson",
      rating: 5,
      title: "Stunning visuals and iconic score",
      content: "A spectacular sci-fi thriller. The visual effects are breathtaking, the action sequences are highly creative, and the Hans Zimmer score is absolutely iconic.",
    },
    {
      tmdbId: 27205,
      username: "nautreal_pearson",
      rating: 5,
      title: "Incredibly original and creative",
      content: "Inception is one of the most original and creative movies ever made. The rules of the dream worlds are well-established and lead to incredible tension throughout.",
    },
    {
      tmdbId: 27205,
      username: "arthur_pendelton",
      rating: 5,
      title: "Cinematic history in the making",
      content: "A masterpiece of visual storytelling. The folding city, the rotating hallway fight, and the zero-gravity sequences are all cinematic history. Highly recommended.",
    },
    {
      tmdbId: 27205,
      username: "arthur_pendelton",
      rating: 5,
      title: "A smart thriller that demands attention",
      content: "An absolute thriller that requires your full attention. The layers of dreams and the concept of time dilation are handled brilliantly by Nolan. A must-watch.",
    },
    {
      tmdbId: 27205,
      username: "elena_rostova",
      rating: 5,
      title: "Great cast with a strong emotional core",
      content: "Leonardo DiCaprio leads a stellar cast in this mind-bending heist film. The emotional core of Cobb trying to get back to his kids is what makes the movie work.",
    },
    {
      tmdbId: 27205,
      username: "elena_rostova",
      rating: 5,
      title: "Perfect blend of action and sci-fi",
      content: "Inception is a perfect blend of high-concept science fiction and blockbuster action. The ending is legendary and still debated to this day. Absolute genius.",
    },
    {
      tmdbId: 27205,
      username: "marcus_aurelius",
      rating: 5,
      title: "Nolan's direction is flawless",
      content: "A brilliant, original, and deeply engaging film. Christopher Nolan's direction is at its best, and the cast's chemistry is outstanding. A modern classic.",
    },
    {
      tmdbId: 27205,
      username: "marcus_aurelius",
      rating: 5,
      title: "One of the best of the 21st century",
      content: "A visual and narrative triumph. It's a complex, smart, and thrilling ride that remains one of the best and most influential movies of the 21st century.",
    },
  ];

  // 4. Insert reviews and avoid duplication
  for (const reviewData of reviewsToSeed) {
    const userId = seededUsers[reviewData.username];
    const movieId = seededMovies[reviewData.tmdbId];

    if (!userId || !movieId) {
      console.warn(`Skipping review seeding due to missing references: username=${reviewData.username}, tmdbId=${reviewData.tmdbId}`);
      continue;
    }

    // Check if user has already written a review with this title for this movie
    const existingReview = await prisma.review.findFirst({
      where: {
        userId,
        movieId,
        title: reviewData.title,
      },
    });

    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId,
          movieId,
          rating: reviewData.rating,
          title: reviewData.title,
          content: reviewData.content,
          spoilerWarning: false,
        },
      });
    }
  }

  // 5. Update each movie's averageRating and reviewCount fields to reflect the reviews
  for (const movieData of movies) {
    const movieId = seededMovies[movieData.tmdbId];
    if (movieId) {
      const movieReviews = await prisma.review.findMany({
        where: { movieId },
      });
      const reviewCount = movieReviews.length;
      const averageRating = reviewCount > 0
        ? movieReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

      await prisma.movie.update({
        where: { id: movieId },
        data: {
          averageRating,
          reviewCount,
        },
      });
    }
  }

  console.log("Database seeded successfully with users, movies, and real reviews!");
}

