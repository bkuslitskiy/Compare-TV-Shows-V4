/**
 * Compares multiple projects to find shared people
 * @param {Array} projects - Array of projects with cast and crew
 * @returns {Object} Object containing shared cast and crew
 */
export const compareProjects = (projects) => {
  if (!projects || projects.length < 2) {
    throw new Error('At least two projects are required for comparison');
  }
  
  // Initialize maps to track people across projects
  const castMap = new Map();
  const crewMap = new Map();
  
  // Process each project
  projects.forEach(project => {
    // Process cast
    if (project.cast) {
      project.cast.forEach(castMember => {
        const personId = castMember.id;
        
        if (!castMap.has(personId)) {
          castMap.set(personId, {
            id: personId,
            name: castMember.name,
            profile_path: castMember.profile_path,
            roles: [],
            projectCount: 0
          });
        }
        
        const person = castMap.get(personId);
        person.projectCount++;
        
        person.roles.push({
          character: castMember.character,
          media: castMember.media || {
            id: project.id,
            name: project.name || project.title,
            type: project.type
          },
          order: castMember.order,
          episodeCount: castMember.episodeCount
        });
      });
    }
    
    // Process crew
    if (project.crew) {
      project.crew.forEach(crewMember => {
        const personId = crewMember.id;
        
        if (!crewMap.has(personId)) {
          crewMap.set(personId, {
            id: personId,
            name: crewMember.name,
            profile_path: crewMember.profile_path,
            roles: [],
            projectCount: 0
          });
        }
        
        const person = crewMap.get(personId);
        person.projectCount++;
        
        person.roles.push({
          job: crewMember.job,
          department: crewMember.department,
          media: crewMember.media || {
            id: project.id,
            name: project.name || project.title,
            type: project.type
          },
          episodeCount: crewMember.episodeCount
        });
      });
    }
  });
  
  // Filter to only include people who appear in multiple projects
  const sharedCast = Array.from(castMap.values())
    .filter(person => person.projectCount > 1);
  
  const sharedCrew = Array.from(crewMap.values())
    .filter(person => person.projectCount > 1);
  
  // Rank by importance
  const rankedCast = rankByImportance(sharedCast, 'cast');
  const rankedCrew = rankByImportance(sharedCrew, 'crew');
  
  return {
    cast: rankedCast,
    crew: rankedCrew
  };
};

/**
 * Ranks shared people by importance
 * @param {Array} sharedPeople - Array of shared people
 * @param {string} type - Type of people (cast or crew)
 * @returns {Array} Ranked array of shared people
 */
export const rankByImportance = (sharedPeople, type) => {
  return sharedPeople.map(person => {
    // Calculate importance score
    let importanceScore = 0;
    
    if (type === 'cast') {
      // For cast, consider order and episode count
      person.roles.forEach(role => {
        // Lower order (closer to 0) is more important
        const orderScore = role.order !== undefined ? Math.max(10 - role.order, 0) : 0;
        
        // More episodes means more important
        const episodeScore = role.episodeCount || 1;
        
        // Combine scores
        importanceScore += orderScore * 2 + episodeScore;
      });
    } else if (type === 'crew') {
      // For crew, consider job importance and episode count
      person.roles.forEach(role => {
        // Job importance scores
        let jobScore = 0;
        
        // Directors and writers are very important
        if (role.job === 'Director') jobScore = 10;
        else if (role.job === 'Writer') jobScore = 8;
        else if (role.job === 'Producer') jobScore = 7;
        else if (role.job === 'Executive Producer') jobScore = 9;
        else if (role.job === 'Director of Photography') jobScore = 6;
        else if (role.job === 'Editor') jobScore = 5;
        else if (role.job === 'Production Design') jobScore = 4;
        else if (role.job === 'Costume Design') jobScore = 3;
        else if (role.job === 'Music') jobScore = 3;
        else jobScore = 1;
        
        // More episodes means more important
        const episodeScore = role.episodeCount || 1;
        
        // Combine scores
        importanceScore += jobScore * episodeScore;
      });
    }
    
    // Add importance score to person
    return {
      ...person,
      importanceScore
    };
  }).sort((a, b) => b.importanceScore - a.importanceScore);
};

/**
 * Groups similar roles together
 * @param {Array} roles - Array of roles
 * @returns {Array} Array of grouped roles
 */
export const groupRoles = (roles) => {
  const groupedRoles = [];
  const processedIndices = new Set();
  
  for (let i = 0; i < roles.length; i++) {
    if (processedIndices.has(i)) continue;
    
    const role = roles[i];
    const similarRoles = [role];
    processedIndices.add(i);
    
    // Find similar roles
    for (let j = i + 1; j < roles.length; j++) {
      if (processedIndices.has(j)) continue;
      
      const otherRole = roles[j];
      
      // Check if roles are similar
      if (areSimilarRoles(role, otherRole)) {
        similarRoles.push(otherRole);
        processedIndices.add(j);
      }
    }
    
    // Add grouped roles
    groupedRoles.push({
      roles: similarRoles,
      primaryRole: getPrimaryRole(similarRoles)
    });
  }
  
  return groupedRoles;
};

/**
 * Checks if two roles are similar
 * @param {Object} role1 - First role
 * @param {Object} role2 - Second role
 * @returns {boolean} Whether the roles are similar
 */
const areSimilarRoles = (role1, role2) => {
  // For cast roles
  if (role1.character && role2.character) {
    return role1.character === role2.character;
  }
  
  // For crew roles
  if (role1.job && role2.job) {
    // Check for exact match
    if (role1.job === role2.job) return true;
    
    // Check for similar jobs
    const similarJobs = {
      'Director': ['Episode Director'],
      'Writer': ['Screenplay', 'Story', 'Writer'],
      'Producer': ['Co-Producer', 'Associate Producer', 'Line Producer'],
      'Executive Producer': ['Co-Executive Producer'],
      'Director of Photography': ['Cinematographer', 'Director of Photography'],
      'Sound Designer': ['Sound Editor', 'Sound Mixer', 'Sound'],
      'Music': ['Original Music Composer', 'Music Supervisor', 'Composer']
    };
    
    for (const [key, values] of Object.entries(similarJobs)) {
      if ((role1.job === key && values.includes(role2.job)) ||
          (role2.job === key && values.includes(role1.job))) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Gets the primary role from a list of similar roles
 * @param {Array} roles - Array of similar roles
 * @returns {Object} Primary role
 */
const getPrimaryRole = (roles) => {
  if (roles.length === 1) return roles[0];
  
  // For cast roles, use the one with the lowest order
  if (roles[0].character) {
    return roles.reduce((primary, role) => {
      if (role.order === undefined) return primary;
      if (primary.order === undefined) return role;
      return role.order < primary.order ? role : primary;
    }, roles[0]);
  }
  
  // For crew roles, use job importance
  if (roles[0].job) {
    const jobImportance = {
      'Director': 10,
      'Writer': 9,
      'Executive Producer': 8,
      'Producer': 7,
      'Director of Photography': 6,
      'Cinematographer': 6,
      'Editor': 5,
      'Production Design': 4,
      'Costume Design': 3,
      'Original Music Composer': 2,
      'Music Supervisor': 2,
      'Composer': 2
    };
    
    return roles.reduce((primary, role) => {
      const primaryScore = jobImportance[primary.job] || 0;
      const roleScore = jobImportance[role.job] || 0;
      return roleScore > primaryScore ? role : primary;
    }, roles[0]);
  }
  
  return roles[0];
};

export default {
  compareProjects,
  rankByImportance,
  groupRoles
};
