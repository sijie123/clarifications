import axios from 'axios';

export const getAxiosConfig = () => {
  return {
    withCredentials: true
  }
}

export const POST = (uri, content, config) => {
  let header = Object.assign({}, getAxiosConfig(), config);
  return axios.post(uri, content, header);
}

export const postReplyToThread = (message) => {
  return POST(`/api/thread/${message.threadID}`, {
    content: message.content,
    isExternal: message.isExternal
  })
}

export const newThread = (form) => {
  return POST(`/api/thread`, form);
}

export const grantAccessToThread = (threadID, groupname) => {
  return POST(`/api/group/${threadID}`, {
    groupname: groupname
  })
}

export const fetchUsers = (partialName) => {
  const SEARCH_URI = '/api/user';
  return POST(`${SEARCH_URI}/${partialName}`, {});
}

export const fetchUpdatesSince = (currentUpdateTimestamp) => {
  // if (currentUpdateTimestamp === undefined) currentUpdateTimestamp = '0';
  return POST('/api/update', {
    currentUpdateTimestamp: currentUpdateTimestamp,
  });
}
export const fetchGroups = () => {
  return POST('/api/group', {});
}

export const fetchTasks = () => {
  let config = getAxiosConfig();
  return axios.get('/api/task', config);
}

export const fetchImage = (url) => {
  let config = getAxiosConfig();
  return new Promise((resolve, reject) => {
    return axios.get(url, config)
        .then(blob => {
            const objectUrl = URL.createObjectURL(blob);
            resolve(objectUrl);
        }) // resolved the promise with the objectUrl 
        .catch(err => reject(err)); // if there are any errors reject them
  });
}

export const fetchSeat = (contestantUser) => {
  const SEARCH_URI = `/api/seat/${contestantUser}`
  return POST(SEARCH_URI, {})
}