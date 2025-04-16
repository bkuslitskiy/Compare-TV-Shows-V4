// Cache for memoization
const memoCache = new Map();

/**
 * Compares multiple projects to find shared people
 * @param {Array} projects - Array of projects with cast and crew
 * @returns {Object} Object containing shared cast and crew
 */
export const compareProjects = (projects) => {
  if (!projects || projects.length < 2) {
    throw new Error('At least two projects are required for comparison');
  }
  
  // Create a cache key based on project IDs
  const cacheKey = projects
    .map(p => `${p.id}-${p.type || p.media_type}`)
    .sort()
    .join('|');
  
  // Check if we have a cached result
  if (memoCache.has(cacheKey)) {
    console.log('Using cached comparison result');
    return memoCache.get(cacheKey);
  }
  
  console.time('compareProjects');
  
  // Initialize maps to track people across projects
  const castMap = new Map();
  const crewMap = new Map();
  
  // Track which projects each person appears in
  const castProjectSets = new Map();
  const crewProjectSets = new Map();
  
  // Process each project in batches for large datasets
  const BATCH_SIZE = 500; // Process 500 people at a time
  
  // Process each project
  projects.forEach(project => {
    const projectKey = `${project.id}-${project.type || project.media_type}`;
    const projectName = project.name || project.title; // Handle both TV shows and movies
    
    console.log(`Processing project: ${projectName} (${projectKey})`);
    console.log(`Cast members: ${project.cast ? project.cast.length : 0}`);
    console.log(`Crew members: ${project.crew ? project.crew.length : 0}`);
    
    // Process cast in batches
    if (project.cast) {
      for (let i = 0; i < project.cast.length; i += BATCH_SIZE) {
        const batch = project.cast.slice(i, i + BATCH_SIZE);
        
        batch.forEach(castMember => {
          const personId = castMember.id;
          
          if (!castMap.has(personId)) {
            castMap.set(personId, {
              id: personId,
              name: castMember.name,
              profile_path: castMember.profile_path,
              roles: [],
              projectCount: 0
            });
            castProjectSets.set(personId, new Set());
          }
          
          const person = castMap.get(personId);
          const projectSet = castProjectSets.get(personId);
          
          // Only count each project once per person
          if (!projectSet.has(projectKey)) {
            projectSet.add(projectKey);
            person.projectCount++;
          }
          
          // Create media object with consistent properties
          const mediaInfo = castMember.media || {
            id: project.id,
            type: project.type || project.media_type
          };
          
          // Ensure both name and title are set for consistency
          if (project.name) {
            mediaInfo.name = project.name;
          }
          if (project.title) {
            mediaInfo.title = project.title;
          }
          
          person.roles.push({
            character: castMember.character,
            media: mediaInfo,
            order: castMember.order,
            episodeCount: castMember.episodeCount
          });
        });
      }
    }
    
    // Process crew in batches
    if (project.crew) {
      for (let i = 0; i < project.crew.length; i += BATCH_SIZE) {
        const batch = project.crew.slice(i, i + BATCH_SIZE);
        
        batch.forEach(crewMember => {
          const personId = crewMember.id;
          
          if (!crewMap.has(personId)) {
            crewMap.set(personId, {
              id: personId,
              name: crewMember.name,
              profile_path: crewMember.profile_path,
              roles: [],
              projectCount: 0
            });
            crewProjectSets.set(personId, new Set());
          }
          
          const person = crewMap.get(personId);
          const projectSet = crewProjectSets.get(personId);
          
          // Only count each project once per person
          if (!projectSet.has(projectKey)) {
            projectSet.add(projectKey);
            person.projectCount++;
          }
          
          // Create media object with consistent properties
          const mediaInfo = crewMember.media || {
            id: project.id,
            type: project.type || project.media_type
          };
          
          // Ensure both name and title are set for consistency
          if (project.name) {
            mediaInfo.name = project.name;
          }
          if (project.title) {
            mediaInfo.title = project.title;
          }
          
          person.roles.push({
            job: crewMember.job,
            department: crewMember.department,
            media: mediaInfo,
            episodeCount: crewMember.episodeCount
          });
        });
      }
    }
  });
  
  // Early filtering to reduce processing load
  const sharedCast = Array.from(castMap.values())
    .filter(person => person.projectCount > 1);
  
  const sharedCrew = Array.from(crewMap.values())
    .filter(person => person.projectCount > 1);
  
  console.log(`Found ${sharedCast.length} shared cast members and ${sharedCrew.length} shared crew members`);
  
  // Rank by importance
  const rankedCast = rankByImportance(sharedCast, 'cast');
  const rankedCrew = rankByImportance(sharedCrew, 'crew');
  
  const result = {
    cast: rankedCast,
    crew: rankedCrew
  };
  
  // Cache the result
  memoCache.set(cacheKey, result);
  
  // Limit cache size to prevent memory leaks
  if (memoCache.size > 50) {
    const oldestKey = memoCache.keys().next().value;
    memoCache.delete(oldestKey);
  }
  
  console.timeEnd('compareProjects');
  
  return result;
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

// Cache for similar role checks
const similarRoleCache = new Map();

/**
 * Groups similar roles together
 * @param {Array} roles - Array of roles
 * @returns {Array} Array of grouped roles
 */
export const groupRoles = (roles) => {
  // For small role arrays, use the original algorithm
  if (roles.length <= 10) {
    return groupRolesOriginal(roles);
  }
  
  console.time('groupRoles');
  
  // For larger datasets, use a more efficient approach
  // Group by character/job first to reduce comparisons
  const characterGroups = new Map();
  const jobGroups = new Map();
  
  roles.forEach(role => {
    if (role.character) {
      // For cast roles, group by exact character match
      const key = role.character;
      if (!characterGroups.has(key)) {
        characterGroups.set(key, []);
      }
      characterGroups.get(key).push(role);
    } else if (role.job) {
      // For crew roles, group by normalized job
      const normalizedJob = normalizeJob(role.job);
      if (!jobGroups.has(normalizedJob)) {
        jobGroups.set(normalizedJob, []);
      }
      jobGroups.get(normalizedJob).push(role);
    }
  });
  
  const groupedRoles = [];
  
  // Process character groups
  characterGroups.forEach(similarRoles => {
    groupedRoles.push({
      roles: similarRoles,
      primaryRole: getPrimaryRole(similarRoles)
    });
  });
  
  // Process job groups - these might need further refinement
  jobGroups.forEach((roles, normalizedJob) => {
    // For each normalized job group, we might need to split further
    // based on more specific criteria
    const subgroups = [];
    const processed = new Set();
    
    for (let i = 0; i < roles.length; i++) {
      if (processed.has(i)) continue;
      
      const role = roles[i];
      const group = [role];
      processed.add(i);
      
      for (let j = i + 1; j < roles.length; j++) {
        if (processed.has(j)) continue;
        
        const otherRole = roles[j];
        const cacheKey = `${role.job}|${otherRole.job}`;
        
        let areSimilar;
        if (similarRoleCache.has(cacheKey)) {
          areSimilar = similarRoleCache.get(cacheKey);
        } else {
          areSimilar = areSimilarRoles(role, otherRole);
          similarRoleCache.set(cacheKey, areSimilar);
        }
        
        if (areSimilar) {
          group.push(otherRole);
          processed.add(j);
        }
      }
      
      subgroups.push(group);
    }
    
    // Add each subgroup
    subgroups.forEach(group => {
      groupedRoles.push({
        roles: group,
        primaryRole: getPrimaryRole(group)
      });
    });
  });
  
  console.timeEnd('groupRoles');
  
  return groupedRoles;
};

/**
 * Original implementation of groupRoles for small datasets
 * @param {Array} roles - Array of roles
 * @returns {Array} Array of grouped roles
 */
const groupRolesOriginal = (roles) => {
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
 * Normalizes job titles for initial grouping
 * @param {string} job - Job title
 * @returns {string} Normalized job title
 */
const normalizeJob = (job) => {
  const lowerJob = job.toLowerCase();
  
  if (lowerJob.includes('direct')) return 'director';
  if (lowerJob.includes('writ') || lowerJob.includes('screenplay') || lowerJob.includes('story')) return 'writer';
  if (lowerJob.includes('produc')) return 'producer';
  if (lowerJob.includes('cinemat') || lowerJob.includes('photography')) return 'cinematographer';
  if (lowerJob.includes('edit')) return 'editor';
  if (lowerJob.includes('sound') || lowerJob.includes('audio')) return 'sound';
  if (lowerJob.includes('music') || lowerJob.includes('compos')) return 'music';
  if (lowerJob.includes('costume') || lowerJob.includes('makeup') || lowerJob.includes('make-up')) return 'costume';
  if (lowerJob.includes('art') || lowerJob.includes('design')) return 'design';
  if (lowerJob.includes('visual') || lowerJob.includes('effect')) return 'vfx';
  
  return 'other';
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
