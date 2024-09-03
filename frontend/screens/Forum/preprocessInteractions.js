// preprocessInteractions.js
//dssd
export const preprocessInteractions = (interactions) => {
    const userPostMatrix = {};
    interactions.forEach(interaction => {
      const { patientID, postID, interactionType } = interaction;
      if (!userPostMatrix[patientID]) {
        userPostMatrix[patientID] = {};
      }
      userPostMatrix[patientID][postID] = interactionType === 'like' ? 1 : 0; // Example scoring
    });
    return userPostMatrix;
  };
  