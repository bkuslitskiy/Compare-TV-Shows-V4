// Sample TV shows for testing
export const sampleTVShows = [
  {
    id: 1396,
    name: "Breaking Bad",
    overview: "When Walter White, a New Mexico chemistry teacher, is diagnosed with Stage III cancer and given a prognosis of only two years left to live. He becomes filled with a sense of fearlessness and an unrelenting desire to secure his family's financial future at any cost as he enters the dangerous world of drugs and crime.",
    poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
    first_air_date: "2008-01-20",
    media_type: "tv"
  },
  {
    id: 1399,
    name: "Game of Thrones",
    overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north. Amidst the war, a neglected military order of misfits, the Night's Watch, is all that stands between the realms of men and icy horrors beyond.",
    poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
    first_air_date: "2011-04-17",
    media_type: "tv"
  },
  {
    id: 66732,
    name: "Better Call Saul",
    overview: "Six years before Saul Goodman meets Walter White. We meet him when the man who will become Saul Goodman is known as Jimmy McGill, a small-time lawyer searching for his destiny, and, more immediately, hustling to make ends meet. Working alongside, and, often, against Jimmy, is 'fixer' Mike Ehrmantraut.",
    poster_path: "/fC2HDm5t0kHl7mTm7jxMR1ceWvY.jpg",
    first_air_date: "2015-02-08",
    media_type: "tv"
  }
];

// Sample movies for testing
export const sampleMovies = [
  {
    id: 278,
    title: "The Shawshank Redemption",
    overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, where he puts his accounting skills to work for an amoral warden. During his long stretch in prison, Dufresne comes to be admired by the other inmates -- including an older prisoner named Red -- for his integrity and unquenchable sense of hope.",
    poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
    release_date: "1994-09-23",
    media_type: "movie"
  },
  {
    id: 238,
    title: "The Godfather",
    overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family. When organized crime family patriarch, Vito Corleone barely survives an attempt on his life, his youngest son, Michael steps in to take care of the would-be killers, launching a campaign of bloody revenge.",
    poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    release_date: "1972-03-14",
    media_type: "movie"
  },
  {
    id: 424,
    title: "Schindler's List",
    overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves in his factory during World War II.",
    poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
    release_date: "1993-12-15",
    media_type: "movie"
  }
];

// Sample shared cast members for testing
export const sampleSharedCast = [
  {
    id: 17419,
    name: "Bryan Cranston",
    profile_path: "/7Jahy5LZX2Vx37l9sL8sWaliXwT.jpg",
    roles: [
      {
        character: "Walter White",
        media: {
          id: 1396,
          name: "Breaking Bad",
          type: "tv"
        },
        order: 0,
        episodeCount: 62
      },
      {
        character: "Walter White",
        media: {
          id: 66732,
          name: "Better Call Saul",
          type: "tv"
        },
        order: 10,
        episodeCount: 2
      }
    ],
    projectCount: 2,
    importanceScore: 124
  },
  {
    id: 53724,
    name: "Bob Odenkirk",
    profile_path: "/dQIpWOLyZUxQQsRXbKtSKKdZxpv.jpg",
    roles: [
      {
        character: "Saul Goodman",
        media: {
          id: 1396,
          name: "Breaking Bad",
          type: "tv"
        },
        order: 5,
        episodeCount: 43
      },
      {
        character: "Jimmy McGill / Saul Goodman",
        media: {
          id: 66732,
          name: "Better Call Saul",
          type: "tv"
        },
        order: 0,
        episodeCount: 63
      }
    ],
    projectCount: 2,
    importanceScore: 116
  }
];

// Sample shared crew members for testing
export const sampleSharedCrew = [
  {
    id: 66633,
    name: "Vince Gilligan",
    profile_path: "/uFh3OrBvkwKSU3N5y0XnXOhqBJz.jpg",
    roles: [
      {
        job: "Creator",
        department: "Production",
        media: {
          id: 1396,
          name: "Breaking Bad",
          type: "tv"
        },
        episodeCount: 62
      },
      {
        job: "Executive Producer",
        department: "Production",
        media: {
          id: 66732,
          name: "Better Call Saul",
          type: "tv"
        },
        episodeCount: 63
      }
    ],
    projectCount: 2,
    importanceScore: 1125
  },
  {
    id: 1280071,
    name: "Peter Gould",
    profile_path: "/nDlV7u0QGgkzPK8zVLHYgXOBG3P.jpg",
    roles: [
      {
        job: "Producer",
        department: "Production",
        media: {
          id: 1396,
          name: "Breaking Bad",
          type: "tv"
        },
        episodeCount: 62
      },
      {
        job: "Creator",
        department: "Production",
        media: {
          id: 66732,
          name: "Better Call Saul",
          type: "tv"
        },
        episodeCount: 63
      }
    ],
    projectCount: 2,
    importanceScore: 1007
  }
];
